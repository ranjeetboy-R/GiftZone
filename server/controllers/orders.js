import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const SHIPPING_FEE = 79;
const FREE_SHIPPING_MINIMUM = 999;

export async function createOrder(req, res) {
    try {
        const { customer, shippingAddress, items, utr, paymentProofUrl } = req.body;

        if (!customer?.name || !customer?.phone || !shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.pincode) {
            return res.status(400).json({ message: 'Complete delivery details are required.' });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty.' });
        }

        if (!utr?.trim() || !paymentProofUrl?.trim()) {
            return res.status(400).json({ message: 'UTR and payment screenshot are required.' });
        }

        const productIds = items.map((item) => item.productId);

        if (productIds.some((id) => !mongoose.isValidObjectId(id))) {
            return res.status(400).json({ message: 'One or more products are invalid.' });
        }

        const products = await Product.find({
            _id: { $in: productIds },
            active: true
        });

        if (products.length !== productIds.length) {
            return res.status(400).json({ message: 'One or more products are no longer available.' });
        }

        const productMap = new Map(products.map((product) => [product._id.toString(), product]));
        const orderItems = [];
        let subtotal = 0;

        for (const item of items) {
            const product = productMap.get(item.productId.toString());
            const quantity = Number(item.quantity);

            if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
                return res.status(400).json({ message: 'Invalid product quantity.' });
            }

            if (product.stock < quantity) {
                return res.status(400).json({ message: `${product.name} has only ${product.stock} item(s) left.` });
            }

            const lineTotal = product.price * quantity;
            subtotal += lineTotal;

            orderItems.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity,
                image: product.images?.[0] || ''
            });
        }

        const shipping = subtotal >= FREE_SHIPPING_MINIMUM ? 0 : SHIPPING_FEE;
        const total = subtotal + shipping;

        const order = await Order.create({
            userId: req.userId,
            customer: {
                name: customer.name.trim(),
                email: customer.email?.trim() || '',
                phone: customer.phone.trim()
            },
            items: orderItems,
            shippingAddress: {
                name: shippingAddress.name?.trim() || customer.name.trim(),
                phone: shippingAddress.phone?.trim() || customer.phone.trim(),
                address: shippingAddress.address.trim(),
                city: shippingAddress.city.trim(),
                state: shippingAddress.state.trim(),
                pincode: shippingAddress.pincode.trim()
            },
            subtotal,
            shipping,
            total,
            paymentMethod: 'manual_qr',
            paymentStatus: 'submitted',
            orderStatus: 'pending',
            utr: utr.trim(),
            paymentProofUrl: paymentProofUrl.trim()
        });

        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity }
            });
        }

        res.status(201).json({ order });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export async function myOrders(req, res) {
    try {
        const orders = await Order.find({ userId: req.userId })
            .sort({ createdAt: -1 });

        res.json({ orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function getMyOrder(req, res) {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        res.json({ order });
    } catch (error) {
        res.status(400).json({ message: 'Invalid order ID.' });
    }
}

export async function listOrders(req, res) {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(200);

        res.json({ orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function updateOrder(req, res) {
    try {
        const allowedFields = ['paymentStatus', 'orderStatus'];
        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const order = await Order.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ order });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
