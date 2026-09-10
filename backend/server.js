import 'dotenv/config'

import express, { json, urlencoded } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectDatabase from './src/config/database.js';
import logger from './src/utils/logger.js';
import { generalLimiter } from './src/middleware/rateLimitMiddleware.js';
import { notFound, errorHandler } from './src/middleware/errorMiddleware.js';

import authRoutes from './src/routes/authRoutes.js';
import datasetRoutes from './src/routes/datasetRoutes.js';
import processingRoutes from './src/routes/processingRoutes.js';
import insightsRoutes from './src/routes/insightsRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use('/api', generalLimiter);
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'DataForge API', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/datasets', datasetRoutes);
app.use('/api/processing', processingRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  await connectDatabase();
  app.listen(PORT, () => {
    logger.info(`DataForge API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    logger.error(`Health check: http://localhost:${PORT}/health`);
  });
};

startServer();
