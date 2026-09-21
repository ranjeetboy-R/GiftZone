import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import cloudinary from '../config/cloudinary.js';

// Shipping charges are waived when the order meets this minimum value.
const SHIPPING_FEE = 0;
const FREE_SHIPPING_MINIMUM = 299;

// Validate the purchase, reserve stock, and create a pending order.
export async function createOrder(req, res) {
  try {
    const orderData = JSON.parse(req.body.order || '{}');

    const {
      customer,
      shippingAddress,
      items,
      utr
    } = orderData;

    if (
      !customer?.name ||
      !customer?.phone ||
      !shippingAddress?.address ||
      !shippingAddress?.city ||
      !shippingAddress?.state ||
      !shippingAddress?.pincode
    ) {
      return res.status(400).json({
        message: 'Complete delivery details are required.'
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Your cart is empty.'
      });
    }

    if (!utr?.trim()) {
      return res.status(400).json({
        message: 'UTR is required.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: 'Payment screenshot is required.'
      });
    }

    // Upload payment screenshot to Cloudinary.
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'gift-zone/payment-proofs',
            resource_type: 'image'
          },
          (error, data) => {
            if (error) {
              reject(error);
              return;
            }

            resolve(data);
          }
        )
        .end(req.file.buffer);
    });

    const paymentProofUrl = result?.secure_url;

    const productIds = items.map(
      item => item.productId
    );

    if (
      productIds.some(
        id => !mongoose.isValidObjectId(id)
      )
    ) {
      return res.status(400).json({
        message: 'One or more products are invalid.'
      });
    }

    const products = await Product.find({
      _id: {
        $in: productIds
      },
      active: true
    })
      .select(
        'name price stock images'
      )
      .lean();

    if (products.length !== productIds.length) {
      return res.status(400).json({
        message:
          'One or more products are no longer available.'
      });
    }

    const productMap = new Map(
      products.map(product => [
        product._id.toString(),
        product
      ])
    );

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = productMap.get(
        item.productId.toString()
      );

      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 20
      ) {
        return res.status(400).json({
          message: 'Invalid product quantity.'
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          message:
            `${product.name} has only ${product.stock} item(s) left.`
        });
      }

      const lineTotal =
        product.price * quantity;

      subtotal += lineTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.images?.[0] || ''
      });
    }

    const shipping =
      subtotal >= FREE_SHIPPING_MINIMUM
        ? 0
        : SHIPPING_FEE;

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
        name:
          shippingAddress.name?.trim() ||
          customer.name.trim(),

        phone:
          shippingAddress.phone?.trim() ||
          customer.phone.trim(),

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

    // Update all product stocks in parallel.
    await Promise.all(
      orderItems.map(item =>
        Product.findByIdAndUpdate(
          item.productId,
          {
            $inc: {
              stock: -item.quantity
            }
          }
        )
      )
    );

    res.status(201).json({
      order
    });
  } catch (error) {
    console.error(
      'Create order error:',
      error
    );

    res.status(400).json({
      message: error.message
    });
  }
}

// Return orders that belong to the signed-in customer.
export async function myOrders(req, res) {
  try {
    const orders = await Order.find({
      userId: req.userId
    })
      .sort({
        createdAt: -1
      })
      .lean();

    res.json({
      orders
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

// Return one order only when it belongs to the signed-in customer.
export async function getMyOrder(req, res) {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(404).json({
        message: 'Order id is required.'
      });
    }

    const order = await Order.findOne({
      _id: id,
      userId: req.userId
    }).lean();

    if (!order) {
      return res.status(404).json({
        message: 'Order not found.'
      });
    }

    res.json({
      order
    });
  } catch (error) {
    res.status(400).json({
      message: 'Invalid order ID.'
    });
  }
}

// Return the latest orders for the administrator dashboard.
export async function listOrders(req, res) {
  try {
    const orders = await Order.find()
      .sort({
        createdAt: -1
      })
      .limit(200)
      .lean();

    res.json({
      orders
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

// Allow administrators to update only payment and fulfilment statuses.
export async function updateOrder(req, res) {
  try {
    const allowedFields = [
      'paymentStatus',
      'orderStatus'
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        returnDocument: 'after',
        runValidators: true
      }
    );

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    res.json({
      order
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
}