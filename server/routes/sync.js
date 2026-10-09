// Offline Synchronization & Conflict Reconciliation Routes
import express from 'express';
import { getDb } from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { logServerAudit } from '../middleware/auditLogger.js';

const router = express.Router();

// GET /api/sync/events - View sync queue events
router.get('/events', authenticateToken, async (req, res, next) => {
  try {
    const db = await getDb();
    const { status } = req.query;
    let list = [...db.tables.offline_sync_events];
    if (status) list = list.filter(s => s.status === status);
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    next(err);
  }
});

// POST /api/sync/batch - Process offline queue batch with idempotency & conflict detection
router.post('/batch', authenticateToken, async (req, res, next) => {
  try {
    const { events } = req.body;
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ success: false, error: 'NO_EVENTS_PROVIDED', message: 'Array of sync events required.' });
    }

    const db = await getDb();
    const results = [];

    for (const ev of events) {
      const { idempotency_key, entity_type, entity_id, action, payload, base_version = 1 } = ev;

      // 1. Idempotency Check (Duplicate submission prevention)
      const existing = db.tables.offline_sync_events.find(s => s.idempotency_key === idempotency_key);
      if (existing) {
        results.push({
          idempotency_key,
          status: existing.status,
          message: 'Duplicate submission detected via idempotency key; returning existing result.',
          event_id: existing.id
        });
        continue;
      }

      // 2. Conflict Detection for updates
      let isConflict = false;
      let conflictReason = null;

      if (action === 'UPDATE' && entity_type === 'FARMER') {
        const currentFarmer = db.tables.farmers.find(f => f.id === entity_id);
        if (currentFarmer && currentFarmer.version > base_version) {
          isConflict = true;
          conflictReason = `Version collision: Server version is ${currentFarmer.version}, while offline record is based on version ${base_version}.`;
        }
      }

      const syncRecord = {
        id: `SYNC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        idempotency_key,
        officer_id: req.user.id,
        entity_type,
        entity_id,
        action,
        payload_json: payload,
        status: isConflict ? 'CONFLICT' : 'SYNCED',
        retry_count: ev.retry_count || 0,
        conflict_reason: conflictReason,
        created_at: new Date().toISOString(),
        synced_at: isConflict ? null : new Date().toISOString()
      };

      db.tables.offline_sync_events.push(syncRecord);

      if (!isConflict) {
        // Apply changes to database
        if (entity_type === 'FIELD_VISIT') {
          db.tables.field_visits.push({
            ...payload,
            id: payload.id || `VST-${Date.now()}`,
            officer_id: req.user.id,
            synced_from_offline: true,
            created_at: new Date().toISOString()
          });
        } else if (entity_type === 'FARMER' && action === 'UPDATE') {
          const fIndex = db.tables.farmers.findIndex(f => f.id === entity_id);
          if (fIndex !== -1) {
            db.tables.farmers[fIndex] = {
              ...db.tables.farmers[fIndex],
              ...payload,
              version: db.tables.farmers[fIndex].version + 1,
              updated_at: new Date().toISOString()
            };
          }
        }

        await logServerAudit({
          action: 'OFFLINE_EVENT_SYNCED',
          userId: req.user.id,
          userRole: req.user.role,
          entityId: entity_id,
          entityType: entity_type,
          notes: `Replayed offline ${action} event (${idempotency_key}). Status: SYNCED.`
        });
      } else {
        await logServerAudit({
          action: 'OFFLINE_SYNC_CONFLICT_DETECTED',
          userId: req.user.id,
          userRole: req.user.role,
          entityId: entity_id,
          entityType: entity_type,
          notes: conflictReason
        });
      }

      results.push({
        idempotency_key,
        status: syncRecord.status,
        conflict_reason: conflictReason,
        event_id: syncRecord.id
      });
    }

    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    next(err);
  }
});

// POST /api/sync/resolve-conflict - Resolve conflict with comment
router.post('/resolve-conflict', authenticateToken, async (req, res, next) => {
  try {
    const { event_id, resolution_choice, merged_payload, resolution_comment } = req.body;
    if (!event_id || !resolution_comment) {
      return res.status(400).json({ success: false, error: 'MISSING_DATA', message: 'event_id and resolution_comment are mandatory.' });
    }

    const db = await getDb();
    const ev = db.tables.offline_sync_events.find(s => s.id === event_id);
    if (!ev) return res.status(404).json({ success: false, error: 'SYNC_EVENT_NOT_FOUND' });

    ev.status = 'SYNCED';
    ev.resolved_by_user_id = req.user.id;
    ev.resolved_at = new Date().toISOString();
    ev.resolution_comment = resolution_comment;
    ev.synced_at = new Date().toISOString();

    if (merged_payload && ev.entity_type === 'FARMER') {
      const idx = db.tables.farmers.findIndex(f => f.id === ev.entity_id);
      if (idx !== -1) {
        db.tables.farmers[idx] = {
          ...db.tables.farmers[idx],
          ...merged_payload,
          version: db.tables.farmers[idx].version + 1,
          updated_at: new Date().toISOString()
        };
      }
    }

    await logServerAudit({
      action: 'OFFLINE_CONFLICT_RESOLVED',
      userId: req.user.id,
      userRole: req.user.role,
      entityId: ev.entity_id,
      entityType: ev.entity_type,
      notes: `Resolved conflict on ${ev.entity_id}. Choice: ${resolution_choice}. Justification: ${resolution_comment}.`
    });

    res.json({ success: true, message: 'Conflict resolved successfully.', data: ev });
  } catch (err) {
    next(err);
  }
});

export default router;
