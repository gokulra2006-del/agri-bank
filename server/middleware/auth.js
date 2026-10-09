// Authentication Middleware with JWT Token Verification
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'AUTHENTICATION_REQUIRED',
      message: 'Access denied. Bearer token is missing.'
    });
  }

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      const isExpired = err.name === 'TokenExpiredError';
      return res.status(403).json({
        success: false,
        error: isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
        message: isExpired ? 'Session has expired. Please sign in again.' : 'Invalid authentication token.'
      });
    }

    req.user = user;
    next();
  });
}
