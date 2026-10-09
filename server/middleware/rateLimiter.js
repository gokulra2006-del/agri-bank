// In-Memory Sliding Window Rate Limiting Middleware
import { config } from '../config/config.js';

const requestCounts = new Map();

export function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const windowMs = config.rateLimitWindowMs;
  const max = config.rateLimitMaxRequests;

  let clientRecord = requestCounts.get(ip);
  if (!clientRecord) {
    clientRecord = { count: 1, resetTime: now + windowMs };
    requestCounts.set(ip, clientRecord);
  } else {
    if (now > clientRecord.resetTime) {
      clientRecord.count = 1;
      clientRecord.resetTime = now + windowMs;
    } else {
      clientRecord.count++;
      if (clientRecord.count > max) {
        return res.status(429).json({
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: `Too many requests from this client. Please retry after ${Math.ceil((clientRecord.resetTime - now) / 1000)} seconds.`
        });
      }
    }
  }

  next();
}
