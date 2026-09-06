require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDatabase = require('./src/config/database');
const logger = require('./src/utils/logger');
const { generalLimiter } = require('./src/middleware/rateLimitMiddleware');
const { notFound, errorHandler } = require('./src/middleware/errorMiddleware');

const authRoutes = require('./src/routes/authRoutes');
const datasetRoutes = require('./src/routes/datasetRoutes');
const processingRoutes = require('./src/routes/processingRoutes');
const insightsRoutes = require('./src/routes/insightsRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
    logger.info(`Health check: http://localhost:${PORT}/health`);
  });
};

startServer();
