import mongoose from 'mongoose';
import Product from '../models/Product.js';

export async function listProducts(req, res) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 12, 1),
      100
    );

    const skip = (page - 1) * limit;

    const filter = req.query.all === 'true'
      ? {}
      : {
        active: true
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
          .map(word =>
            word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          );

        filter.$and = searchWords.map(word => ({
          $or: [
            {
              name: {
                $regex: word,
                $options: 'i'
              }
            },
            {
              description: {
                $regex: word,
                $options: 'i'
              }
            },
            {
              category: {
                $regex: word,
                $options: 'i'
              }
            }
          ]
        }));
      }
    }

    if (
      req.query.featured === 'true' ||
      req.query.best === 'true'
    ) {
      filter.isFeatured = true;
    }

    if (req.query.new === 'true') {
      filter.isNewArrival = true;
    }

    const sortMap = {
      newest: {
        createdAt: -1
      },
      'price-low': {
        price: 1
      },
      'price-high': {
        price: -1
      },
      rating: {
        rating: -1,
        reviews: -1
      },
      name: {
        name: 1
      }
    };

    const sort = sortMap[req.query.sort] || sortMap.newest;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .select(
          'name slug price sizes description compareAtPrice images category rating reviews stock isFeatured isNewArrival active'
        )
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      Product.countDocuments(filter)
    ]);

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(Math.ceil(total / limit), 1)
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function getRelatedProducts(req, res) {
  try {
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 4, 1),
      12
    );

    const currentProductId = req.query.exclude;

    const filter = {
      active: true,
      category: req.params.category
    };

    if (
      currentProductId &&
      mongoose.isValidObjectId(currentProductId)
    ) {
      filter._id = {
        $ne: currentProductId
      };
    }

    const products = await Product.find(filter)
      .select(
        'name slug price compareAtPrice images category rating reviews stock isFeatured isNewArrival'
      )
      .sort({
        isFeatured: -1,
        rating: -1,
        createdAt: -1
      })
      .limit(limit)
      .lean();

    res.json({
      products
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function getProduct(req, res) {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      active: true
    }).lean();

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    res.json({
      product
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function createProduct(req, res) {
  try {
    const payload = {
      ...req.body
    };

    if (!payload.name) {
      return res.status(400).json({
        message: 'Product name is required'
      });
    }

    if (!payload.slug) {
      return res.status(400).json({
        message: 'Product slug is required'
      });
    }

    if (!payload.category) {
      return res.status(400).json({
        message: 'Product category is required'
      });
    }

    if (Number(payload.price) < 0) {
      return res.status(400).json({
        message: 'Product price cannot be negative'
      });
    }

    payload.price = Number(payload.price);
    payload.stock = Number(payload.stock || 0);
    payload.rating = Number(payload.rating || 0);
    payload.reviews = Number(payload.reviews || 0);

    if (payload.compareAtPrice !== undefined) {
      payload.compareAtPrice = Number(payload.compareAtPrice);
    }

    if (payload.sizes !== undefined) {
      payload.sizes = Array.isArray(payload.sizes)
        ? payload.sizes
          .map((size) => String(size).trim())
          .filter(Boolean)
        : [];
    }

    const product = await Product.create(payload);

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    res.status(400).json({
      message:
        error.code === 11000
          ? 'Product slug already exists'
          : error.message
    });
  }
}

export async function updateProduct(req, res) {
  try {
    const payload = {
      ...req.body
    };

    delete payload._id;
    delete payload.createdAt;
    delete payload.updatedAt;

    if (payload.price !== undefined) {
      payload.price = Number(payload.price);
    }

    if (payload.stock !== undefined) {
      payload.stock = Number(payload.stock);
    }

    if (payload.rating !== undefined) {
      payload.rating = Number(payload.rating);
    }

    if (payload.reviews !== undefined) {
      payload.reviews = Number(payload.reviews);
    }

    if (payload.compareAtPrice !== undefined) {
      payload.compareAtPrice = Number(payload.compareAtPrice);
    }

    if (payload.sizes !== undefined) {
      payload.sizes = Array.isArray(payload.sizes)
        ? payload.sizes
          .map((size) => String(size).trim())
          .filter(Boolean)
        : [];
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      payload,
      {
        returnDocument: 'after',
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    res.status(400).json({
      message:
        error.code === 11000
          ? 'Product slug already exists'
          : error.message
    });
  }
}

export async function deleteProduct(req, res) {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(404).json({
        success: false,
        message: 'Product id not found'
      });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

function formatCategoryName(slug) {
  const names = {
    'electronics-gadgets': 'Electronics & Gadgets',
    'mobile-accessories': 'Mobile Accessories',
    'home-living': 'Home & Living',
    'fashion-accessories': 'Fashion & Accessories',
    'beauty-personal-care': 'Beauty & Personal Care',
    'kitchen-dining': 'Kitchen & Dining',
    'personalized-gifts': 'Personalized Gifts',
    'birthday-gifts': 'Birthday Gifts',
    'anniversary-gifts': 'Anniversary Gifts',
    'wedding-gifts': 'Wedding Gifts',
    'corporate-gifts': 'Corporate Gifts',
    'festival-gifts': 'Festival Gifts'
  };

  return (
    names[slug] ||
    slug
      .split('-')
      .map(
        word =>
          word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(' ')
  );
}

export async function getCategories(req, res) {
  try {
    const hasLimit = req.query.limit !== undefined;

    const limit = hasLimit
      ? Math.min(
        Math.max(Number(req.query.limit) || 1, 1),
        100
      )
      : null;

    const pipeline = [
      {
        $match: {
          active: true,
          category: {
            $exists: true,
            $nin: ['', null]
          }
        }
      },
      {
        $group: {
          _id: '$category',
          count: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ];

    if (limit !== null) {
      pipeline.push({
        $limit: limit
      });
    }

    const categories = await Product.aggregate(pipeline);

    res.json({
      categories: categories.map(item => ({
        slug: item._id,
        name: formatCategoryName(item._id),
        count: item.count
      }))
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}