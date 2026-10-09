// Research Data Export Routes (Anonymized & DPDP Privacy Suppressed)
import express from 'express';
import { getDb } from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { logServerAudit } from '../middleware/auditLogger.js';
import { config } from '../config/config.js';

const router = express.Router();

// GET /api/export/research-dataset - Anonymized research dataset export
router.get('/research-dataset', authenticateToken, requireRole(['RESEARCHER', 'BRANCH_MANAGER', 'ADMIN']), async (req, res, next) => {
  try {
    const db = await getDb();
    const format = (req.query.format || 'json').toLowerCase();
    const threshold = config.privacyThresholdN || 5;

    // Build anonymized farmer and loan records
    const rawFarmers = db.tables.farmers;
    const rawLoans = db.tables.loans;

    // Check cohort group sizes for k-anonymity suppression
    const villageCounts = {};
    rawFarmers.forEach(f => {
      villageCounts[f.village] = (villageCounts[f.village] || 0) + 1;
    });

    const anonymizedDataset = rawFarmers.map((f, idx) => {
      const isSuppressedVillage = villageCounts[f.village] < threshold;
      const associatedLoan = rawLoans.find(l => l.farmer_id === f.id);

      return {
        researchId: `RSCH-SUB-${String(idx + 1).padStart(4, '0')}`, // PII Name Stripped
        gender: f.gender,
        villageCohort: isSuppressedVillage ? '[Suppressed: N < 5]' : f.village,
        taluk: f.taluk,
        district: f.district,
        landSizeAcres: f.land_size_acres,
        landType: f.land_type,
        primaryCrop: f.primary_crop,
        secondaryCrop: f.secondary_crop,
        annualIncomeRange: f.annual_income < 100000 ? '< 1L' : f.annual_income < 300000 ? '1L - 3L' : '> 3L',
        rainfallZone: f.rainfall_zone,
        soilCardIssued: f.soil_card_issued,
        pmfbyEnrolled: f.pmfby_enrolled,
        resilienceScore: f.resilience_score,
        resilienceConfidence: f.resilience_confidence,
        resilienceCategory: f.resilience_category,
        loanStatus: associatedLoan ? associatedLoan.status : 'None',
        loanAppliedAmount: associatedLoan ? associatedLoan.applied_amount : null,
        repaymentModel: associatedLoan ? associatedLoan.repayment_model : null
        // Phone, Name, Aadhaar, Account numbers strictly omitted
      };
    });

    await logServerAudit({
      action: 'RESEARCH_DATA_EXPORTED',
      userId: req.user.id,
      userRole: req.user.role,
      entityId: 'DATASET-EXPORT',
      entityType: 'Research Export',
      notes: `Exported ${anonymizedDataset.length} anonymized records in ${format.toUpperCase()} format with k-anonymity threshold N < ${threshold}.`
    });

    if (format === 'csv') {
      const headers = Object.keys(anonymizedDataset[0] || {}).join(',');
      const rows = anonymizedDataset.map(row => Object.values(row).map(val => `"${val !== null && val !== undefined ? val : ''}"`).join(','));
      const csvContent = [headers, ...rows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="agrisahay_anonymized_research_dataset.csv"');
      return res.send(csvContent);
    }

    res.json({
      success: true,
      metadata: {
        totalRecords: anonymizedDataset.length,
        anonymizationRules: ['Names stripped', 'Phone numbers stripped', 'Aadhaar omitted', 'Villages with N < 5 suppressed'],
        exportedBy: req.user.username,
        exportedAt: new Date().toISOString()
      },
      data: anonymizedDataset
    });
  } catch (err) {
    next(err);
  }
});

export default router;
