// Authentication & User Management Routes
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../database/db.js';
import { config } from '../config/config.js';
import { authenticateToken } from '../middleware/auth.js';
import { logServerAudit } from '../middleware/auditLogger.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'MISSING_CREDENTIALS', message: 'Username and password are required.' });
    }

    const db = await getDb();
    const user = db.tables.users.find(u => u.username === username.toLowerCase());

    if (!user) {
      return res.status(401).json({ success: false, error: 'INVALID_CREDENTIALS', message: 'Invalid username or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'INVALID_CREDENTIALS', message: 'Invalid username or password.' });
    }

    const payload = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      branch_id: user.branch_id
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

    await logServerAudit({
      action: 'USER_LOGIN_SUCCESS',
      userId: user.id,
      userRole: user.role,
      entityId: user.id,
      entityType: 'User Authentication',
      notes: `User ${user.username} successfully logged in with role ${user.role}.`
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        branch_id: user.branch_id,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const db = await getDb();
    const user = db.tables.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'USER_NOT_FOUND' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        branch_id: user.branch_id,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, async (req, res, next) => {
  try {
    await logServerAudit({
      action: 'USER_LOGOUT',
      userId: req.user.id,
      userRole: req.user.role,
      entityId: req.user.id,
      entityType: 'User Authentication',
      notes: `User ${req.user.username} logged out.`
    });

    res.json({ success: true, message: 'Successfully signed out.' });
  } catch (err) {
    next(err);
  }
});

export default router;
