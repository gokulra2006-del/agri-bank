// Credit Protection & PMFBY Crop Loss Intimation Routes
import express from 'express';
import { getDb } from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { logServerAudit } from '../middleware/auditLogger.js';

const router = express.Router();

// GET /api/credit-protection - List loss claims
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const db = await getDb();
    res.json({ success: true, count: db.tables.credit_protection_cases.length, data: db.tables.credit_protection_cases });
  } catch (err) {
    next(err);
  }
});

// POST /api/credit-protection/intimate - Intimate crop loss (72-hour window check)
router.post('/intimate', authenticateToken, requireRole(['RELATIONSHIP_OFFICER', 'BRANCH_MANAGER', 'ADMIN']), async (req, res, next) => {
  try {
    const db = await getDb();
    const { loan_id, loss_cause, incident_date, estimated_damage_pct, notes } = req.body;

    const loan = db.tables.loans.find(l => l.id === loan_id);
    if (!loan) return res.status(404).json({ success: false, error: 'LOAN_NOT_FOUND' });

    const farmer = db.tables.farmers.find(f => f.id === loan.farmer_id);
    const incDate = new Date(incident_date);
    const now = new Date();
    const elapsedHours = Math.max(0, Number(((now.getTime() - incDate.getTime()) / (1000 * 3600)).toFixed(1)));

    const newCase = {
      id: `CLM-${Date.now()}`,
      loan_id,
      farmer_id: loan.farmer_id,
      farmer_name: farmer ? farmer.name : loan.farmer_name,
      loss_cause: loss_cause || 'Unseasonal Rainfall',
      incident_date,
      intimated_at: now.toISOString(),
      hours_to_intimation: elapsedHours,
      estimated_damage_pct: Number(estimated_damage_pct || 40),
      surveyor_status: 'Assigned',
      surveyor_name: 'Dr. V. Patil (District Agriculture Officer)',
      survey_date: null,
      actual_assessed_damage_pct: null,
      recommended_relief_amount: 0,
      restructuring_recommended: false,
      new_moratorium_months: 0,
      notes: notes || 'Loss reported from field terminal.',
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };

    db.tables.credit_protection_cases.push(newCase);

    await logServerAudit({
      action: 'PMFBY_LOSS_INTIMATED',
      userId: req.user.id,
      userRole: req.user.role,
      entityId: newCase.id,
      entityType: 'Credit Protection',
      notes: `Intimated ${newCase.loss_cause} for ${newCase.farmer_name}. Latency: ${elapsedHours} hrs against 72-hr guideline.`
    });

    res.status(201).json({
      success: true,
      message: elapsedHours <= 72 ? 'Loss intimation registered within 72-hour window.' : 'Loss intimation registered (late intimation waiver required).',
      data: newCase
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/credit-protection/:id/survey - Submit surveyor report
router.post('/:id/survey', authenticateToken, requireRole(['BRANCH_MANAGER', 'ADMIN']), async (req, res, next) => {
  try {
    const db = await getDb();
    const clm = db.tables.credit_protection_cases.find(c => c.id === req.params.id);
    if (!clm) return res.status(404).json({ success: false, error: 'CLAIM_NOT_FOUND' });

    const assessedDmg = Number(req.body.actual_assessed_damage_pct || clm.estimated_damage_pct);
    clm.actual_assessed_damage_pct = assessedDmg;
    clm.survey_date = new Date().toISOString().split('T')[0];
    clm.surveyor_status = 'Survey_Completed';
    clm.recommended_relief_amount = Number(req.body.recommended_relief_amount || 0);
    clm.restructuring_recommended = assessedDmg >= 50;
    clm.new_moratorium_months = assessedDmg >= 50 ? 6 : 0;
    clm.updated_at = new Date().toISOString();

    await logServerAudit({
      action: 'PMFBY_SURVEY_COMPLETED',
      userId: req.user.id,
      userRole: req.user.role,
      entityId: clm.id,
      entityType: 'Credit Protection',
      notes: `Survey completed for ${clm.id}. Assessed damage: ${assessedDmg}%. Restructuring recommended: ${clm.restructuring_recommended}.`
    });

    res.json({ success: true, data: clm });
  } catch (err) {
    next(err);
  }
});

export default router;
