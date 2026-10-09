// Server Configuration Loader
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'agrisahay_super_secure_jwt_secret_key_2026_rural_banking_v6',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/agrisahay',
  useDemoStoreFallback: process.env.USE_DEMO_STORE_FALLBACK !== 'false',
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
  rateLimitMaxRequests: 300,
  privacyThresholdN: 5,
  corsOrigins: process.env.CORS_ORIGIN || 'http://localhost:5173'
};
