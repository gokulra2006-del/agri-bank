// Farmers Directory Routes (Aadhaar Masked & DPDP Access Tracked)
import express from 'express';
import { getDb } from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateFarmerInput } from '../middleware/validator.js';
import { logServerAudit } from '../middleware/auditLogger.js';
import { calculateServerResilience } from '../services/resilienceService.js';

const router = express.Router();

// GET /api/farmers - List farmers
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const db = await getDb();
    const { search, village, landType } = req.query;
    let list = [...db.tables.farmers];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(f => f.name.toLowerCase().includes(q) || f.phone.includes(q) || f.id.toLowerCase().includes(q));
    }
    if (village) {
      list = list.filter(f => f.village.toLowerCase() === village.toLowerCase());
    }
    if (landType) {
      list = list.filter(f => f.land_type.toLowerCase() === landType.toLowerCase());
    }

    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    next(err);
  }
});

// GET /api/farmers/:id - Get farmer details & log DPDP access
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const db = await getDb();
    const farmer = db.tables.farmers.find(f => f.id === req.params.id);

    if (!farmer) {
      return res.status(404).json({ success: false, error: 'FARMER_NOT_FOUND', message: 'Borrower record does not exist.' });
    }

    // Log DPDP data access
    const accessLogEntry = {
      id: `DAL-${Date.now()}`,
      farmer_id: farmer.id,
      accessed_by_user_id: req.user.id,
      officer_name: req.user.full_name,
      officer_role: req.user.role,
      access_purpose: req.query.purpose || 'Agricultural Loan Record Inquiry',
      access_timestamp: new Date().toISOString()
    };
    db.tables.data_access_logs.push(accessLogEntry);

    // Calculate live resilience evaluation
    const resilienceEval = calculateServerResilience(farmer);

    res.json({
      success: true,
      data: {
        ...farmer,
        resilienceEvaluation: resilienceEval
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/farmers - Register new farmer
router.post('/', authenticateToken, requireRole(['RELATIONSHIP_OFFICER', 'BRANCH_MANAGER', 'ADMIN']), validateFarmerInput, async (req, res, next) => {
  try {
    const db = await getDb();
    const existing = db.tables.farmers.find(f => f.phone === req.body.phone);

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'DUPLICATE_FARMER_RECORD',
        message: `Farmer with mobile number ${req.body.phone} is already registered (${existing.name}, ${existing.id}).`
      });
    }

    const resilienceEval = calculateServerResilience(req.body);

    const newFarmer = {
      id: `FAR-${String(db.tables.farmers.length + 1).padStart(3, '0')}`,
      name: req.body.name,
      gender: req.body.gender || 'Male',
      village: req.body.village || 'Mandya Rural',
      taluk: req.body.taluk || 'Mandya',
      district: req.body.district || 'Mandya',
      state: req.body.state || 'Karnataka',
      phone: req.body.phone,
      aadhaar_masked: req.body.aadhaar_masked,
      land_size_acres: Number(req.body.land_size_acres),
      land_type: req.body.land_type || 'Canal Irrigated',
      primary_crop: req.body.primary_crop,
      secondary_crop: req.body.secondary_crop || 'None',
      annual_income: Number(req.body.annual_income || 150000),
      allied_income: Number(req.body.allied_income || 0),
      rainfall_zone: req.body.rainfall_zone || 'Medium',
      soil_card_issued: Boolean(req.body.soil_card_issued),
      pmfby_enrolled: Boolean(req.body.pmfby_enrolled),
      resilience_score: resilienceEval.score,
      resilience_confidence: resilienceEval.confidencePercent,
      resilience_category: resilienceEval.category,
      created_by: req.user.id,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.tables.farmers.push(newFarmer);

    await logServerAudit({
      action: 'FARMER_REGISTERED',
      userId: req.user.id,
      userRole: req.user.role,
      entityId: newFarmer.id,
      entityType: 'Farmer Profile',
      previousStatus: 'None',
      newStatus: 'Registered',
      notes: `Registered borrower ${newFarmer.name} (${newFarmer.village}, ${newFarmer.primary_crop}, ${newFarmer.land_size_acres} Acres).`
    });

    res.status(201).json({ success: true, data: newFarmer });
  } catch (err) {
    next(err);
  }
});

// PUT /api/farmers/:id - Update farmer
router.put('/:id', authenticateToken, requireRole(['RELATIONSHIP_OFFICER', 'BRANCH_MANAGER', 'ADMIN']), async (req, res, next) => {
  try {
    const db = await getDb();
    const index = db.tables.farmers.findIndex(f => f.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'FARMER_NOT_FOUND' });
    }

    const current = db.tables.farmers[index];
    const updated = {
      ...current,
      ...req.body,
      id: current.id, // prevent ID mutability
      version: current.version + 1,
      updated_at: new Date().toISOString()
    };

    // Re-evaluate resilience
    const resilienceEval = calculateServerResilience(updated);
    updated.resilience_score = resilienceEval.score;
    updated.resilience_confidence = resilienceEval.confidencePercent;
    updated.resilience_category = resilienceEval.category;

    db.tables.farmers[index] = updated;

    await logServerAudit({
      action: 'FARMER_PROFILE_UPDATED',
      userId: req.user.id,
      userRole: req.user.role,
      entityId: current.id,
      entityType: 'Farmer Profile',
      notes: `Updated agricultural/land profile for ${updated.name}. Version bumped to ${updated.version}.`
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
