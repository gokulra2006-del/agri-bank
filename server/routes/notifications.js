// Notifications & Follow-Up System Routes
import express from 'express';
import { getDb } from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/notifications - List notifications
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const db = await getDb();
    const { category, channel, is_read } = req.query;
    let list = [...db.tables.notifications];

    if (category) list = list.filter(n => n.category === category);
    if (channel) list = list.filter(n => n.channel === channel);
    if (is_read !== undefined) list = list.filter(n => String(n.is_read) === is_read);

    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    next(err);
  }
});

// POST /api/notifications - Send / trigger a notification
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { category, title, message, language = 'en', channel = 'IN_APP', metadata } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'MISSING_DATA', message: 'Title and message are required.' });
    }

    const db = await getDb();
    const newNotif = {
      id: `NTF-${Date.now()}`,
      recipient_role: req.body.recipient_role || 'ALL',
      recipient_user_id: req.body.recipient_user_id || null,
      category: category || 'FARMER_FOLLOW_UP',
      title,
      message,
      language,
      channel,
      delivery_status: channel === 'IN_APP' ? 'DELIVERED' : 'SENT', // Simulated SMS/Email
      is_read: false,
      metadata: metadata || {},
      created_at: new Date().toISOString()
    };

    db.tables.notifications.unshift(newNotif);

    res.status(201).json({
      success: true,
      message: channel.startsWith('SIMULATED') ? `Simulated ${channel} notification dispatched to queue.` : 'In-app notification posted.',
      data: newNotif
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res, next) => {
  try {
    const db = await getDb();
    const notif = db.tables.notifications.find(n => n.id === req.params.id);
    if (!notif) return res.status(404).json({ success: false, error: 'NOTIFICATION_NOT_FOUND' });

    notif.is_read = true;
    res.json({ success: true, data: notif });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notifications/mark-all-read - Mark all read
router.put('/mark-all-read', authenticateToken, async (req, res, next) => {
  try {
    const db = await getDb();
    db.tables.notifications.forEach(n => { n.is_read = true; });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
});

export default router;
