import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { clerk } from './middleware/clerk.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import cookieParser from 'cookie-parser';
import userRouter from './routes/userRouter.js';
import { handleClerkWebhook } from './controllers/clerkWebhookController.js';
import { retryQueuedProductImageCleanup } from './utils/productImages.js';

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const requestBuckets = new Map();
function rateLimit({ windowMs, max }) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl}`;
    const now = Date.now();
    const bucket = requestBuckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      requestBuckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (++bucket.count > max) return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    next();
  };
}

function requireTrustedOrigin(req, res, next) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (origin && !allowedOrigins.includes(origin)) return res.status(403).json({ message: 'Invalid request origin' });
  next();
}

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true
}));

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  });
  next();
});

app.use('/api/clerk', express.raw({ type: 'application/json' }), handleClerkWebhook);
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(clerk);
app.use(requireTrustedOrigin);

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    name: 'Gift Zone API'
  });
});

app.use('/api/products', rateLimit({ windowMs: 60_000, max: 180 }), productRoutes);
app.use('/api/orders', rateLimit({ windowMs: 60_000, max: 30 }), orderRoutes);
app.use('/api/admin', rateLimit({ windowMs: 15 * 60_000, max: 20 }), adminRoutes);
app.use('/api/upload', rateLimit({ windowMs: 60_000, max: 30 }), uploadRoutes);
app.use('/api/users', rateLimit({ windowMs: 60_000, max: 60 }), userRouter);

app.use((err, req, res, next) => {
  console.error('Unhandled request error:', err.name);
  res.status(err.status || 500).json({
    message: err.status && err.status < 500 ? err.message : 'Server error'
  });
});

connectDB().then(() => {
  retryQueuedProductImageCleanup().catch(() => console.error('Product-image cleanup retry failed'));
  setInterval(() => retryQueuedProductImageCleanup().catch(() => console.error('Product-image cleanup retry failed')), 10 * 60 * 1000).unref();
  const server = app.listen(PORT, () => {
    console.log(`Gift Zone API running on port ${PORT}`);
  });

  const shutdown = signal => {
    console.log(`${signal} received. Shutting down Gift Zone API...`);

    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
});
