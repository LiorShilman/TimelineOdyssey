import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';

// Load environment variables
dotenv.config();

// Import database connection (this will initialize Prisma)
import './config/database.config.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import momentRoutes from './routes/moment.routes.js';
import mediaRoutes from './routes/media.routes.js';
import tagRoutes from './routes/tag.routes.js';
import relationRoutes from './routes/relation.routes.js';

// Import middleware
import { generalLimiter } from './middleware/rateLimit.middleware.js';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware.js';
import logger from './utils/logger.utils.js';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Security & CORS Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(generalLimiter);

// Request logging
app.use((req: express.Request, _res: express.Response, next: express.NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/moments', momentRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/relations', relationRoutes);

// Future routes will be added here:
// app.use('/api/timeline', timelineRoutes);

// 404 handler
app.use(notFoundMiddleware);

// Global error handler (must be last)
app.use(errorMiddleware);

// Start server
server.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔒 CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export default app;
