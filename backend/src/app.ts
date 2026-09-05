import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { env } from './config';
import { logger } from './logger';
import { errorMiddleware, notFoundMiddleware } from './middleware/error';
import { configureCloudinary } from './services/cloudinaryService';
import authRoutes from './routes/auth';
import googleAuthRoutes from './routes/googleAuth';
import profileRoutes from './routes/profiles';
import publicRoutes from './routes/public';
import categoryRoutes from './routes/categories';
import taskRoutes from './routes/tasks';
import offerRoutes from './routes/offers';
import messageRoutes from './routes/messages';
import notificationRoutes from './routes/notifications';
import reviewRoutes from './routes/reviews';
import trustRoutes from './routes/trust';
import adminRoutes from './routes/admin';
import recommendationRoutes from './routes/recommendations';
import uploadRoutes from './routes/uploads';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','), credentials: true }));
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));
  app.use(pinoHttp({ logger }));

  const globalLimiter = rateLimit({ windowMs: 60_000, max: 200, standardHeaders: true, legacyHeaders: false });
  app.use('/api/', globalLimiter);

  app.get('/health', (_req, res) => res.json({ ok: true, env: env.NODE_ENV, time: new Date().toISOString() }));

  configureCloudinary();

  app.use('/api/auth', authRoutes);
  app.use('/api/auth', googleAuthRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/public', publicRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/uploads', uploadRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api', offerRoutes);
  app.use('/api', messageRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api', reviewRoutes);
  app.use('/api', trustRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/recommendations', recommendationRoutes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);
  return app;
}