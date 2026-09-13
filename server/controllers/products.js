import mongoose from 'mongoose';
import Product from '../models/Product.js';

export async function listProducts(req, res) {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 48);
        const skip = (page - 1) * limit;
        const filter = req.query.all === 'true' ? {} : { active: true };

        if (req.query.category) {
            filter.category = req.query.category;
        }

        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: 'i' };
        }

        if (req.query.featured === 'true' || req.query.best === 'true') {
            filter.isFeatured = true;
        }

        if (req.query.new === 'true') {
            filter.isNew = true;
        }

        const sortMap = {
            newest: { createdAt: -1 },
            'price-low': { price: 1 },
            'price-high': { price: -1 },
            rating: { rating: -1, reviews: -1 },
            name: { name: 1 }
        };
        const sort = sortMap[req.query.sort] || sortMap.newest;

        const [products, total] = await Promise.all([
            Product.find(filter).sort(sort).skip(skip).limit(limit),
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
        res.status(500).json({ message: error.message });
    }
}

export async function getRelatedProducts(req, res) {
    try {
        const limit = Math.min(Math.max(Number(req.query.limit) || 4, 1), 12);
        const currentProductId = req.query.exclude;
        const filter = {
            active: true,
            category: req.params.category
        };

        if (currentProductId && mongoose.isValidObjectId(currentProductId)) {
            filter._id = { $ne: currentProductId };
        }

        const products = await Product.find(filter)
            .sort({ isFeatured: -1, rating: -1, createdAt: -1 })
            .limit(limit);

        res.json({ products });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function getProduct(req, res) {
    try {
        const product = await Product.findOne({ slug: req.params.slug, active: true });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function createProduct(req, res) {
    try {
        const payload = { ...req.body };

        if (payload.image && !payload.images) {
            payload.images = [payload.image];
        }

        delete payload.image;

        const product = await Product.create(payload);
        res.status(201).json({ product });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export async function updateProduct(req, res) {
    try {
        const payload = { ...req.body };

        if (payload.image && !payload.images) {
            payload.images = [payload.image];
        }

        delete payload.image;

        const product = await Product.findByIdAndUpdate(req.params.id, payload, {
            new: true,
            runValidators: true
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ product });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export async function deleteProduct(req, res) {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { active: false },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product archived', product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
