import mongoose from "mongoose";
import Product from "../models/Product.js";
import {
  getProductCacheVersion,
  invalidateProductCache,
} from "../utils/productCache.js";
import redis from "../config/redis.js";
import { normalizeImageAssets, queueOrDeleteUnusedAssets } from '../utils/productImages.js';

const PRODUCT_FIELDS = ['name', 'slug', 'description', 'price', 'compareAtPrice', 'category', 'images', 'imageAssets', 'sizes', 'stock', 'rating', 'reviews', 'isFeatured', 'isNewArrival', 'active'];

function pickProductFields(body) {
  return Object.fromEntries(PRODUCT_FIELDS.filter(key => body[key] !== undefined).map(key => [key, body[key]]));
}

function normalizeNumber(value, field) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`${field} must be a valid number`);
  return number;
}

const productCardFields =
  "name slug price sizes description compareAtPrice images category rating reviews stock isFeatured isNewArrival active";

const setPublicCache = (res, seconds = 300) => {
  res.set("Cache-Control", `public, max-age=60, s-maxage=${seconds}, stale-while-revalidate=86400`);
};

// List product without stream
export async function listProducts(req, res) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 100);

    const skip = (page - 1) * limit;

    const filter =
      req.query.all === "true"
        ? {}
        : {
            active: true,
          };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      const search = req.query.search.trim();

      if (search) {
        const searchWords = search
          .split(/\s+/)
          .filter(Boolean)
          .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

        filter.$and = searchWords.map((word) => ({
          $or: [
            {
              name: {
                $regex: word,
                $options: "i",
              },
            },
            {
              description: {
                $regex: word,
                $options: "i",
              },
            },
            {
              category: {
                $regex: word,
                $options: "i",
              },
            },
          ],
        }));
      }
    }

    if (req.query.featured === "true" || req.query.best === "true") {
      filter.isFeatured = true;
    }

    if (req.query.new === "true") {
      filter.isNewArrival = true;
    }

    const sortMap = {
      newest: {
        createdAt: -1,
      },
      "price-low": {
        price: 1,
      },
      "price-high": {
        price: -1,
      },
      rating: {
        rating: -1,
        reviews: -1,
      },
      name: {
        name: 1,
      },
    };

    const sort = sortMap[req.query.sort] || sortMap.newest;

    // Redis cache key
    const version = await getProductCacheVersion();

    const cacheKey = `products:v${version}:${JSON.stringify({
      filter,
      sort,
      page,
      limit,
    })}`;

    // Get from Redis
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .select(productCardFields)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      Product.countDocuments(filter),
    ]);

    const result = {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(Math.ceil(total / limit), 1),
      },
    };

    // Save in Redis for 1 hour
    await redis.set(cacheKey, result, {
      ex: 60 * 60,
    });

    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// List best product without stream
export async function getBestProducts(req, res) {
  try {
    const cacheKey = "products:best:24";

    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      setPublicCache(res);
      return res.status(200).json({
        products: cachedData,
      });
    }

    const products = await Product.find({ active: true, isFeatured: true })
      .select(productCardFields)
      .sort({ rating: -1, reviews: -1, createdAt: -1 })
      .limit(24)
      .lean();

    await redis.set(cacheKey, products, {
      ex: 60 * 60,
    });

    setPublicCache(res);
    return res.status(200).json({
      products,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

// List new product without stream
export async function getNewProducts(req, res) {
  try {
    const cacheKey = "products:new:24";

    const cachedProducts = await redis.get(cacheKey);

    if (cachedProducts) {
      setPublicCache(res);
      return res.status(200).json({
        products: cachedProducts,
      });
    }

    const products = await Product.find({ active: true, isNewArrival: true })
      .select(productCardFields)
      .sort({ createdAt: -1 })
      .limit(24)
      .lean();

    await redis.set(cacheKey, products, {
      ex: 60 * 60,
    });

    setPublicCache(res);
    return res.status(200).json({
      products,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

// Homepage data is intentionally bundled so a new visitor does not wait for
// three separate browser-to-API round trips before seeing the catalog.
export async function getHomepageProducts(req, res) {
  try {
    const limit = Math.min(Math.max(Number(req.query.categoryLimit) || 8, 1), 100);
    const version = await getProductCacheVersion();
    const cacheKey = `products:homepage:v${version}:${limit}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      setPublicCache(res, 600);
      return res.status(200).json(cachedData);
    }

    const categoryPipeline = [
      {
        $match: {
          active: true,
          category: { $exists: true, $nin: ["", null] },
        },
      },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: limit },
    ];

    const [categories, best, newProducts] = await Promise.all([
      Product.aggregate(categoryPipeline),
      Product.find({ active: true, isFeatured: true })
        .select(productCardFields)
        .sort({ rating: -1, reviews: -1, createdAt: -1 })
        .limit(24)
        .lean(),
      Product.find({ active: true, isNewArrival: true })
        .select(productCardFields)
        .sort({ createdAt: -1 })
        .limit(24)
        .lean(),
    ]);

    const result = {
      categories: categories.map((item) => ({
        slug: item._id,
        name: formatCategoryName(item._id),
        count: item.count,
      })),
      best,
      newProducts,
    };

    await redis.set(cacheKey, result, { ex: 60 * 60 });
    setPublicCache(res, 600);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// List Product with stream
export async function listProductsWithStream(req, res) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 100);

    const skip = (page - 1) * limit;

    const filter =
      req.query.all === "true"
        ? {}
        : {
            active: true,
          };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      const search = req.query.search.trim();

      if (search) {
        const searchWords = search
          .split(/\s+/)
          .filter(Boolean)
          .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

        filter.$and = searchWords.map((word) => ({
          $or: [
            {
              name: {
                $regex: word,
                $options: "i",
              },
            },
            {
              description: {
                $regex: word,
                $options: "i",
              },
            },
            {
              category: {
                $regex: word,
                $options: "i",
              },
            },
          ],
        }));
      }
    }

    if (req.query.featured === "true" || req.query.best === "true") {
      filter.isFeatured = true;
    }

    if (req.query.new === "true") {
      filter.isNewArrival = true;
    }

    const sortMap = {
      newest: {
        createdAt: -1,
      },
      "price-low": {
        price: 1,
      },
      "price-high": {
        price: -1,
      },
      rating: {
        rating: -1,
        reviews: -1,
      },
      name: {
        name: 1,
      },
    };

    const sort = sortMap[req.query.sort] || sortMap.newest;

    // Redis cache key
    const version = await getProductCacheVersion();

    const cacheKey = `products:stream:v${version}:${JSON.stringify({
      filter,
      sort,
      page,
      limit,
    })}`;

    // Get from Redis
    const cachedData = await redis.get(cacheKey);

    res.status(200);

    res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");

    res.setHeader("Cache-Control", "no-cache, no-transform");

    res.setHeader("Transfer-Encoding", "chunked");

    res.flushHeaders?.();

    // Redis cache hit
    if (cachedData) {
      res.write(
        JSON.stringify({
          type: "meta",
          pagination: cachedData.pagination,
        }) + "\n",
      );

      let batch = [];

      for (const product of cachedData.products) {
        batch.push(product);

        if (batch.length === 5) {
          res.write(
            JSON.stringify({
              type: "products",
              products: batch,
            }) + "\n",
          );

          batch = [];

          await new Promise((resolve) => setImmediate(resolve));
        }
      }

      if (batch.length > 0) {
        res.write(
          JSON.stringify({
            type: "products",
            products: batch,
          }) + "\n",
        );
      }

      res.write(
        JSON.stringify({
          type: "done",
        }) + "\n",
      );

      return res.end();
    }

    const total = await Product.countDocuments(filter);

    const cursor = Product.find(filter)
      .select(
        "name slug price sizes description compareAtPrice images category rating reviews stock isFeatured isNewArrival active",
      )
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
      .cursor();

    const products = [];

    res.write(
      JSON.stringify({
        type: "meta",
        pagination: {
          page,
          limit,
          total,
          pages: Math.max(Math.ceil(total / limit), 1),
        },
      }) + "\n",
    );

    let batch = [];

    for await (const product of cursor) {
      products.push(product);

      batch.push(product);

      if (batch.length === 5) {
        res.write(
          JSON.stringify({
            type: "products",
            products: batch,
          }) + "\n",
        );

        batch = [];

        await new Promise((resolve) => setImmediate(resolve));
      }
    }

    if (batch.length > 0) {
      res.write(
        JSON.stringify({
          type: "products",
          products: batch,
        }) + "\n",
      );
    }

    const result = {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(Math.ceil(total / limit), 1),
      },
    };

    // Save in Redis for 1 hour
    await redis.set(cacheKey, result, {
      ex: 60 * 60,
    });

    res.write(
      JSON.stringify({
        type: "done",
      }) + "\n",
    );

    res.end();
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        message: error.message,
      });
    } else {
      res.end();
    }
  }
}

export async function getRelatedProducts(req, res) {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 4, 1), 12);

    const currentProductId = req.query.exclude;

    const filter = {
      active: true,
      category: req.params.category,
    };

    if (currentProductId && mongoose.isValidObjectId(currentProductId)) {
      filter._id = {
        $ne: currentProductId,
      };
    }

    const products = await Product.find(filter)
      .select(
        "name slug price compareAtPrice images category rating reviews stock isFeatured isNewArrival",
      )
      .sort({
        isFeatured: -1,
        rating: -1,
        createdAt: -1,
      })
      .limit(limit)
      .lean();

    res.json({
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function getProduct(req, res) {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      active: true,
    }).lean();

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function createProduct(req, res) {
  let uploadedAssets = [];
  try {
    const payload = pickProductFields(req.body);

    if (!payload.name) {
      return res.status(400).json({
        message: "Product name is required",
      });
    }

    if (!payload.slug) {
      return res.status(400).json({
        message: "Product slug is required",
      });
    }

    if (!payload.category) {
      return res.status(400).json({
        message: "Product category is required",
      });
    }

    if (Number(payload.price) < 0) {
      return res.status(400).json({
        message: "Product price cannot be negative",
      });
    }

    payload.price = normalizeNumber(payload.price, 'Price');
    payload.stock = normalizeNumber(payload.stock || 0, 'Stock');
    payload.rating = normalizeNumber(payload.rating || 0, 'Rating');
    payload.reviews = normalizeNumber(payload.reviews || 0, 'Reviews');

    if (payload.compareAtPrice !== undefined) {
      payload.compareAtPrice = normalizeNumber(payload.compareAtPrice, 'Compare at price');
    }

    if (payload.sizes !== undefined) {
      payload.sizes = Array.isArray(payload.sizes)
        ? payload.sizes.map((size) => String(size).trim()).filter(Boolean)
        : [];
    }

    if (payload.images !== undefined) {
      payload.images = payload.images.filter(image => typeof image === 'string' && image.length <= 2048);
      payload.imageAssets = normalizeImageAssets(payload.images, payload.imageAssets);
      uploadedAssets = payload.imageAssets;
    }

    const product = await Product.create(payload);
    await invalidateProductCache();

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    // The upload endpoint may have succeeded before validation or persistence
    // failed. These IDs came from this admin request, never from a delete API.
    await queueOrDeleteUnusedAssets(uploadedAssets);
    res.status(400).json({
      message:
        error.code === 11000 ? "Product slug already exists" : error.message,
    });
  }
}

export async function updateProduct(req, res) {
  let uploadedAssets = [];
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid product ID' });
    const existing = await Product.findById(req.params.id).select('imageAssets').lean();
    if (!existing) return res.status(404).json({ message: 'Product not found' });
    const payload = pickProductFields(req.body);

    delete payload._id;
    delete payload.createdAt;
    delete payload.updatedAt;

    if (payload.price !== undefined) {
      payload.price = normalizeNumber(payload.price, 'Price');
    }

    if (payload.stock !== undefined) {
      payload.stock = normalizeNumber(payload.stock, 'Stock');
    }

    if (payload.rating !== undefined) {
      payload.rating = normalizeNumber(payload.rating, 'Rating');
    }

    if (payload.reviews !== undefined) {
      payload.reviews = normalizeNumber(payload.reviews, 'Reviews');
    }

    if (payload.compareAtPrice !== undefined) {
      payload.compareAtPrice = normalizeNumber(payload.compareAtPrice, 'Compare at price');
    }

    if (payload.sizes !== undefined) {
      payload.sizes = Array.isArray(payload.sizes)
        ? payload.sizes.map((size) => String(size).trim()).filter(Boolean)
        : [];
    }

    let removedAssets = [];
    if (payload.images !== undefined) {
      payload.images = payload.images.filter(image => typeof image === 'string' && image.length <= 2048);
      const existingByUrl = new Map((existing.imageAssets || []).map(asset => [asset.url, asset]));
      const submittedAssets = Array.isArray(payload.imageAssets) ? payload.imageAssets : [];
      const submittedByUrl = new Map(submittedAssets.map(asset => [asset?.url, asset]));
      payload.imageAssets = payload.images.map(url => existingByUrl.get(url) || normalizeImageAssets([url], [submittedByUrl.get(url)])[0]);
      uploadedAssets = payload.imageAssets.filter(asset => !existingByUrl.has(asset.url));
      removedAssets = (existing.imageAssets || []).filter(asset => !payload.imageAssets.some(next => next.publicId === asset.publicId));
    }

    const product = await Product.findByIdAndUpdate(req.params.id, payload, {
      returnDocument: "after",
      runValidators: true,
    });

    await invalidateProductCache();
    await queueOrDeleteUnusedAssets(removedAssets);
    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    await queueOrDeleteUnusedAssets(uploadedAssets);
    res.status(400).json({
      message:
        error.code === 11000 ? "Product slug already exists" : error.message,
    });
  }
}

export async function deleteProduct(req, res) {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Product id not found",
      });
    }

    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid product id' });
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await invalidateProductCache();
    await queueOrDeleteUnusedAssets(product.imageAssets || []);

    res.json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

function formatCategoryName(slug) {
  const names = {
    "electronics-gadgets": "Electronics & Gadgets",
    "mobile-accessories": "Mobile Accessories",
    "home-living": "Home & Living",
    "fashion-accessories": "Fashion & Accessories",
    "beauty-personal-care": "Beauty & Personal Care",
    "kitchen-dining": "Kitchen & Dining",
    "personalized-gifts": "Personalized Gifts",
    "birthday-gifts": "Birthday Gifts",
    "anniversary-gifts": "Anniversary Gifts",
    "wedding-gifts": "Wedding Gifts",
    "corporate-gifts": "Corporate Gifts",
    "festival-gifts": "Festival Gifts",
  };

  return (
    names[slug] ||
    slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

export async function getCategories(req, res) {
  try {
    const hasLimit = req.query.limit !== undefined;

    const limit = hasLimit
      ? Math.min(Math.max(Number(req.query.limit) || 1, 1), 100)
      : null;

    const version = await getProductCacheVersion();

    const cacheKey = `categories:v${version}:${limit ?? "all"}`;

    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const pipeline = [
      {
        $match: {
          active: true,
          category: {
            $exists: true,
            $nin: ["", null],
          },
        },
      },
      {
        $group: {
          _id: "$category",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ];

    if (limit !== null) {
      pipeline.push({
        $limit: limit,
      });
    }

    const categories = await Product.aggregate(pipeline);

    const result = {
      categories: categories.map((item) => ({
        slug: item._id,
        name: formatCategoryName(item._id),
        count: item.count,
      })),
    };

    await redis.set(cacheKey, result, {
      ex: 60 * 60 * 6,
    });

    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}
