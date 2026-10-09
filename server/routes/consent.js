// DPDP Act Consent & Data Governance Routes
import express from 'express';
import { getDb } from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateConsentInput } from '../middleware/validator.js';
import { logServerAudit } from '../middleware/auditLogger.js';

const router = express.Router();

// GET /api/consent - List consent records
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const db = await getDb();
    const { farmer_id } = req.query;
    let list = [...db.tables.consent_records];
    if (farmer_id) list = list.filter(c => c.farmer_id === farmer_id);
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    next(err);
  }
});

// POST /api/consent - Record consent
router.post('/', authenticateToken, requireRole(['RELATIONSHIP_OFFICER', 'BRANCH_MANAGER', 'ADMIN']), validateConsentInput, async (req, res, next) => {
  try {
    const db = await getDb();
    const { farmer_id, purpose, consent_language, ip_or_device_id } = req.body;

    const newConsent = {
      id: `CNS-${Date.now()}`,
      farmer_id,
      purpose,
      status: 'ACTIVE',
      consent_language: consent_language || 'kn',
      granted_at: new Date().toISOString(),
      withdrawn_at: null,
      expiry_date: new Date(Date.now() + 2 * 365 * 24 * 3600 * 1000).toISOString().split('T')[0], // 2 years
      captured_by_officer_id: req.user.id,
      ip_or_device_id: ip_or_device_id || 'TERMINAL-BRANCH-01'
    };

    db.tables.consent_records.push(newConsent);

    await logServerAudit({
      action: 'DPDP_CONSENT_GRANTED',
      userId: req.user.id,
      userRole: req.user.role,
      entityId: newConsent.id,
      entityType: 'Consent Record',
      notes: `Recorded consent for farmer ${farmer_id}. Purpose: ${purpose}, Language: ${newConsent.consent_language}.`
    });

    res.status(201).json({ success: true, data: newConsent });
  } catch (err) {
    next(err);
  }
});

// POST /api/consent/:id/withdraw - Withdraw consent
router.post('/:id/withdraw', authenticateToken, requireRole(['RELATIONSHIP_OFFICER', 'BRANCH_MANAGER', 'ADMIN']), async (req, res, next) => {
  try {
    const db = await getDb();
    const consent = db.tables.consent_records.find(c => c.id === req.params.id);
    if (!consent) return res.status(404).json({ success: false, error: 'CONSENT_RECORD_NOT_FOUND' });

    consent.status = 'WITHDRAWN';
    consent.withdrawn_at = new Date().toISOString();

    await logServerAudit({
      action: 'DPDP_CONSENT_WITHDRAWN',
      userId: req.user.id,
      userRole: req.user.role,
      entityId: consent.id,
      entityType: 'Consent Record',
      previousStatus: 'ACTIVE',
      newStatus: 'WITHDRAWN',
      notes: `Borrower revoked consent for ${consent.purpose}. Processing halted for this purpose.`
    });

    res.json({ success: true, message: 'Consent successfully revoked.', data: consent });
  } catch (err) {
    next(err);
  }
});

// GET /api/consent/access-logs - View staff data access history
router.get('/access-logs', authenticateToken, requireRole(['AUDITOR', 'BRANCH_MANAGER', 'ADMIN']), async (req, res, next) => {
  try {
    const db = await getDb();
    res.json({ success: true, count: db.tables.data_access_logs.length, data: db.tables.data_access_logs });
  } catch (err) {
    next(err);
  }
});

// POST /api/consent/corrections - Request data correction
router.post('/corrections', authenticateToken, async (req, res, next) => {
  try {
    const db = await getDb();
    const { farmer_id, field_name, requested_value, reason } = req.body;
    if (!farmer_id || !field_name || !requested_value) {
      return res.status(400).json({ success: false, error: 'MISSING_FIELDS', message: 'farmer_id, field_name, and requested_value are required.' });
    }

    const newReq = {
      id: `CORR-${Date.now()}`,
      farmer_id,
      field_name,
      requested_value,
      reason: reason || 'Borrower requested correction under DPDP right to rectification.',
      status: 'PENDING',
      created_at: new Date().toISOString()
    };

    db.tables.data_correction_requests.push(newReq);

    await logServerAudit({
      action: 'DATA_CORRECTION_REQUESTED',
      userId: req.user.id,
      userRole: req.user.role,
      entityId: newReq.id,
      entityType: 'Data Correction',
      notes: `Requested correction for ${farmer_id} on field '${field_name}'.`
    });

    res.status(201).json({ success: true, data: newReq });
  } catch (err) {
    next(err);
  }
});

export default router;
