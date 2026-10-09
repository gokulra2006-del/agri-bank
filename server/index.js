// AgriSahay Secure Backend Entry Point
// Express REST API with PostgreSQL/Relational DB, JWT, RBAC, Rate Limiting & Cryptographic Audit Trails
import express from 'express';
import cors from 'cors';
import { config } from './config/config.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { getDb } from './database/db.js';

import authRouter from './routes/auth.js';
import farmersRouter from './routes/farmers.js';
import loansRouter from './routes/loans.js';
import { repaymentRouter, visitRouter } from './routes/repayments.js';
import creditProtectionRouter from './routes/creditProtection.js';
import consentRouter from './routes/consent.js';
import syncRouter from './routes/sync.js';
import notificationsRouter from './routes/notifications.js';
import pilotRouter from './routes/pilot.js';
import exportRouter from './routes/export.js';
import opsRouter from './routes/ops.js';

export const app = express();

// Security & Parsing Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '5mb' }));
app.use(rateLimiter);

// API Route Mounts
app.use('/api/auth', authRouter);
app.use('/api/farmers', farmersRouter);
app.use('/api/loans', loansRouter);
app.use('/api/repayments', repaymentRouter);
app.use('/api/visits', visitRouter);
app.use('/api/credit-protection', creditProtectionRouter);
app.use('/api/consent', consentRouter);
app.use('/api/sync', syncRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/pilot', pilotRouter);
app.use('/api/export', exportRouter);
app.use('/api/ops', opsRouter);

// Central Error Handler
app.use(errorHandler);

// Start Server if run directly
if (process.env.NODE_ENV !== 'test') {
  getDb().then(() => {
    app.listen(config.port, () => {
      console.log(`====================================================`);
      console.log(`🌾 AgriSahay Secure Core API running on port ${config.port}`);
      console.log(`🔐 Mode: ${config.nodeEnv.toUpperCase()} • PostgreSQL / Relational Engine Active`);
      console.log(`📡 Health Check: http://localhost:${config.port}/api/ops/health`);
      console.log(`====================================================`);
    });
  }).catch(err => {
    console.error('Failed to initialize database engine:', err);
  });
}
