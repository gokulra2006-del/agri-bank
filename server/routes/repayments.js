// Repayments & Field Visits API Routes
import express from 'express';
import { getDb } from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { logServerAudit } from '../middleware/auditLogger.js';

export const repaymentRouter = express.Router();
export const visitRouter = express.Router();

// --------------------------------------------------------------------
// Repayments
// --------------------------------------------------------------------
repaymentRouter.get('/', authenticateToken, async (req, res, next) => {
  try {
    const db = await getDb();
    const { loan_id, status } = req.query;
    let list = [...db.tables.repayments];
    if (loan_id) list = list.filter(r => r.loan_id === loan_id);
    if (status) list = list.filter(r => r.payment_status === status);
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    next(err);
  }
});

repaymentRouter.post('/:id/pay', authenticateToken, requireRole(['RELATIONSHIP_OFFICER', 'BRANCH_MANAGER', 'ADMIN']), async (req, res, next) => {
  try {
    const db = await getDb();
    const rep = db.tables.repayments.find(r => r.id === req.params.id);
    if (!rep) return res.status(404).json({ success: false, error: 'REPAYMENT_NOT_FOUND' });

    const paidAmount = Number(req.body.amount || rep.total_due);
    rep.amount_paid += paidAmount;
    rep.payment_status = rep.amount_paid >= rep.total_due ? 'Paid' : 'Partially Paid';
    rep.paid_date = new Date().toISOString();

    await logServerAudit({
      action: 'REPAYMENT_RECORDED',
      userId: req.user.id,
      userRole: req.user.role,
      entityId: rep.id,
      entityType: 'Repayment Ledger',
      newStatus: rep.payment_status,
      notes: `Logged payment of ₹${paidAmount} against installment #${rep.installment_number} for loan ${rep.loan_id}.`
    });

    res.json({ success: true, message: 'Repayment successfully processed.', data: rep });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------------------------
// Field Visits
// --------------------------------------------------------------------
visitRouter.get('/', authenticateToken, async (req, res, next) => {
  try {
    const db = await getDb();
    const { farmer_id } = req.query;
    let list = [...db.tables.field_visits];
    if (farmer_id) list = list.filter(v => v.farmer_id === farmer_id);
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    next(err);
  }
});

visitRouter.post('/', authenticateToken, requireRole(['RELATIONSHIP_OFFICER', 'BRANCH_MANAGER', 'ADMIN']), async (req, res, next) => {
  try {
    const db = await getDb();
    const { farmer_id, crop_stage, crop_condition, pest_risk_observed, irrigation_verified, notes, latitude, longitude } = req.body;
    const farmer = db.tables.farmers.find(f => f.id === farmer_id);
    if (!farmer) return res.status(404).json({ success: false, error: 'FARMER_NOT_FOUND' });

    const newVisit = {
      id: `VST-${Date.now()}`,
      farmer_id,
      farmer_name: farmer.name,
      officer_id: req.user.id,
      visit_date: req.body.visit_date || new Date().toISOString().split('T')[0],
      crop_stage: crop_stage || 'Vegetative',
      crop_condition: crop_condition || 'Good',
      pest_risk_observed: pest_risk_observed || 'None',
      irrigation_verified: irrigation_verified || farmer.land_type,
      notes: notes || 'Agronomic inspection verified on field.',
      latitude: latitude ? Number(latitude) : 12.5218,
      longitude: longitude ? Number(longitude) : 76.8951,
      gps_accuracy_meters: 8.5,
      synced_from_offline: Boolean(req.body.synced_from_offline),
      created_at: new Date().toISOString()
    };

    db.tables.field_visits.push(newVisit);

    await logServerAudit({
      action: 'FIELD_VISIT_LOGGED',
      userId: req.user.id,
      userRole: req.user.role,
      entityId: newVisit.id,
      entityType: 'Field Verification',
      notes: `Recorded field visit for ${farmer.name}. Crop condition: ${newVisit.crop_condition}, Stage: ${newVisit.crop_stage}.`
    });

    res.status(201).json({ success: true, data: newVisit });
  } catch (err) {
    next(err);
  }
});
