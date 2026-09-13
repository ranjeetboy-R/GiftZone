import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { clerk } from './middleware/clerk.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error('Origin is not allowed by CORS'));
        },
        credentials: true
    })
);

app.use(express.json({ limit: '2mb' }));
app.use(clerk);

app.get('/api/health', (req, res) => {
    res.json({
        ok: true,
        name: 'Gift Zone API'
    });
});

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

app.use((err, req, res, next) => {
    console.error(err);

    res.status(err.status || 500).json({
        message: err.message || 'Server error'
    });
});

connectDB()
    .then(() => {
        const server = app.listen(PORT, () => {
            console.log(`Gift Zone API running on port ${PORT}`);
        });

        const shutdown = (signal) => {
            console.log(`${signal} received. Shutting down Gift Zone API...`);
            server.close(() => {
                process.exit(0);
            });
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
    })