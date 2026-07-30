import './loadEnv';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import passport from 'passport';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

import { connectDatabase, isDatabaseConnected } from './config/database';
import { configurePassport } from './config/passport';
import { configureCloudinary } from './config/cloudinary';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { logger } from './utils/logger';

import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import brandRoutes from './routes/brand.routes';
import cartRoutes from './routes/cart.routes';
import wishlistRoutes from './routes/wishlist.routes';
import orderRoutes from './routes/order.routes';
import reviewRoutes from './routes/review.routes';
import couponRoutes from './routes/coupon.routes';
import userRoutes from './routes/user.routes';
import analyticsRoutes from './routes/analytics.routes';
import mediaRoutes from './routes/media.routes';
import paymentRoutes from './routes/payment.routes';
import notificationRoutes from './routes/notification.routes';
import contactRoutes from './routes/contact.routes';

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// ---------------------------------------------------------------------------
// CORS — always allows the known Vercel frontend URLs.
// Additional origins can be added via CORS_ORIGIN env var (comma-separated).
// In development, localhost ports are also included automatically.
// ---------------------------------------------------------------------------

// Hardcode the known production frontend origins so the app works even if
// CORS_ORIGIN is not set in the Railway environment variables.
const PRODUCTION_ORIGINS = [
  'https://ayezacosmetics-web.vercel.app',
  'https://ayezacosmetics-web-19ds.vercel.app',
];

const envOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const devOrigins =
  process.env.NODE_ENV !== 'production'
    ? ['http://localhost:3000', 'http://localhost:3003', 'http://localhost:3004']
    : [];

const allowedOrigins = [...new Set([...PRODUCTION_ORIGINS, ...envOrigins, ...devOrigins])];

logger.info(`CORS allowed origins: ${allowedOrigins.join(', ')}`);

const corsOptions: cors.CorsOptions = {
  origin: (requestOrigin, callback) => {
    // Allow server-to-server / curl requests (no Origin header sent)
    if (!requestOrigin) return callback(null, true);

    if (allowedOrigins.includes(requestOrigin)) {
      return callback(null, requestOrigin); // reflect exact origin back
    }

    // Also allow any *.vercel.app preview deployments for this project
    if (/^https:\/\/ayezacosmetics-web[a-z0-9-]*\.vercel\.app$/.test(requestOrigin)) {
      return callback(null, requestOrigin);
    }

    logger.warn(`CORS blocked request from origin: ${requestOrigin}`);
    callback(new Error(`CORS policy: origin '${requestOrigin}' is not allowed.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // cache preflight for 24 hours
  optionsSuccessStatus: 204,
};

// Register CORS middleware FIRST — must run before every route and error handler.
app.use(cors(corsOptions));

// Explicitly handle OPTIONS preflight for all routes so that auth/rate-limit
// middleware never has a chance to intercept and block a preflight request.
app.options('*', cors(corsOptions));


app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
  }));
}

configurePassport();
app.use(passport.initialize());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { background-color: #0a0a0a; }',
  customSiteTitle: 'AYEZA COSMETICS API',
}));

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    database: isDatabaseConnected() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

const API_PREFIX = '/api';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/brands`, brandRoutes);
app.use(`${API_PREFIX}/cart`, cartRoutes);
app.use(`${API_PREFIX}/wishlist`, wishlistRoutes);
app.use(`${API_PREFIX}/orders`, orderRoutes);
app.use(`${API_PREFIX}/reviews`, reviewRoutes);
app.use(`${API_PREFIX}/coupons`, couponRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);
app.use(`${API_PREFIX}/media`, mediaRoutes);
app.use(`${API_PREFIX}/payments`, paymentRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);
app.use(`${API_PREFIX}/contact`, contactRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const HOST = process.env.HOST || '0.0.0.0';
const PORT = parseInt(process.env.PORT || '5001', 10);

/**
 * 1) Connect MongoDB (required)
 * 2) Only then bind Express — Railway /health works after this
 */
const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    try {
      configureCloudinary();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn(`Cloudinary configuration skipped/failed: ${message}`);
    }

    const server = app.listen(PORT, HOST, () => {
      logger.info('✓ Express Started');
      logger.info(`🚀 Listening on http://${HOST}:${PORT}`);
      logger.info(`🏥 Health: http://${HOST}:${PORT}/health`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      logger.error(`HTTP server failed to bind on ${HOST}:${PORT}:`, error);
      process.exit(1);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`✗ Failed to start server: ${message}`);
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

void startServer();

export default app;
