import "./src/config/env.js";
import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import compression from 'compression';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import { notFound, errorHandler } from './src/middleware/errors.js';
import authRoutes from './src/routes/auth.routes.js';
import productRoutes from './src/routes/product.routes.js';
import orderRoutes from './src/routes/order.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import uploadRoutes from './src/routes/upload.routes.js';



const app = express();
app.set('trust proxy', 1);

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(hpp());
app.use(mongoSanitize());
app.use(compression());

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.length === 0) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS blocked'), false);
  },
  credentials: true
}));


if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate limit
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// Health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, name: 'hzshop-server', env: process.env.NODE_ENV || 'development' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);


const clientDist = path.join(process.cwd(), '..', 'client', 'dist');
if (process.env.SERVE_CLIENT === 'true' && fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;


await connectDB();
app.listen(PORT, () => {
  console.log(`hzShop API running on port ${PORT}`);
});
