// Loans Routes with Four-Eye Maker-Checker Underwriting
import express from 'express';
import { getDb } from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole, enforceMakerChecker } from '../middleware/rbac.js';
import { validateLoanInput } from '../middleware/validator.js';
import { logServerAudit } from '../middleware/auditLogger.js';
import { calculateScaleOfFinanceEligibility, generateServerRepaymentSchedule } from '../services/plannerService.js';

const router = express.Router();

// GET /api/loans - List loans
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const db = await getDb();
    const { status, farmer_id } = req.query;
    let list = [...db.tables.loans];

    if (status) list = list.filter(l => l.status === status);
    if (farmer_id) list = list.filter(l => l.farmer_id === farmer_id);

    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    next(err);
  }
});

// GET /api/loans/:id - Get loan with repayment schedule
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const db = await getDb();
    const loan = db.tables.loans.find(l => l.id === req.params.id);
    if (!loan) return res.status(404).json({ success: false, error: 'LOAN_NOT_FOUND' });

    const repayments = db.tables.repayments.filter(r => r.loan_id === loan.id);
    res.json({ success: true, data: { ...loan, repayments } });
  } catch (err) {
    next(err);
  }
});

// POST /api/loans - Originate loan (Maker)
router.post('/', authenticateToken, requireRole(['RELATIONSHIP_OFFICER', 'BRANCH_MANAGER', 'ADMIN']), validateLoanInput, async (req, res, next) => {
  try {
    const db = await getDb();
    const farmer = db.tables.farmers.find(f => f.id === req.body.farmer_id);
    if (!farmer) return res.status(404).json({ success: false, error: 'FARMER_NOT_FOUND' });

    // Server-side Scale of Finance computation
    const eligibility = calculateScaleOfFinanceEligibility({
      landSizeAcres: farmer.land_size_acres,
      crop: req.body.crop,
      annualIncome: farmer.annual_income,
      alliedIncome: farmer.allied_income
    });

    const newLoan = {
      id: `LN-2026-${String(db.tables.loans.length + 1).padStart(3, '0')}`,
      farmer_id: farmer.id,
      farmer_name: farmer.name,
      loan_type: req.body.loan_type || 'Kisan Credit Card (Crop Loan)',
      crop: req.body.crop,
      acreage: farmer.land_size_acres,
      scale_of_finance_per_acre: eligibility.scalePerAcre,
      applied_amount: Number(req.body.applied_amount),
      sanctioned_amount: 0,
      interest_rate: 7.0,
      tenure_months: 12,
      status: 'Submitted',
      sowing_date: req.body.sowing_date,
      expected_harvest_date: req.body.expected_harvest_date,
      repayment_model: req.body.repayment_model || 'BULLET_POST_HARVEST',
      maker_officer_id: req.user.id,
      checker_manager_id: null,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.tables.loans.push(newLoan);

    // Generate schedule
    const schedule = generateServerRepaymentSchedule({
      appliedAmount: newLoan.applied_amount,
      sowingDate: newLoan.sowing_date,
      expectedHarvestDate: newLoan.expected_harvest_date,
      interestRate: newLoan.interest_rate,
      repaymentModel: newLoan.repayment_model
    });

    schedule.installments.forEach(inst => {
      db.tables.repayments.push({
        id: `REP-${Date.now()}-${inst.installmentNumber}`,
        loan_id: newLoan.id,
        installment_number: inst.installmentNumber,
        due_date: inst.dueDate,
        principal_due: inst.principalDue,
        interest_due: inst.interestDue,
        total_due: inst.totalDue,
        amount_paid: 0,
        payment_status: 'Upcoming',
        stage_label: inst.stageLabel,
        created_at: new Date().toISOString()
      });
    });

    await logServerAudit({
      action: 'LOAN_ORIGINATED',
      userId: req.user.id,
      userRole: req.user.role,
      entityId: newLoan.id,
      entityType: 'Loan Application',
      previousStatus: 'Draft',
      newStatus: 'Submitted',
      notes: `Originated ${newLoan.loan_type} for ${farmer.name} (Applied: ₹${newLoan.applied_amount}, Harvest bullet: ${schedule.settlementDate}).`
    });

    res.status(201).json({ success: true, data: newLoan, schedule });
  } catch (err) {
    next(err);
  }
});

// POST /api/loans/:id/sanction - Four-Eye Sanction Approval (Checker: Branch Manager / Admin only)
router.post('/:id/sanction', authenticateToken, enforceMakerChecker, async (req, res, next) => {
  try {
    const db = await getDb();
    const loan = db.tables.loans.find(l => l.id === req.params.id);
    if (!loan) return res.status(404).json({ success: false, error: 'LOAN_NOT_FOUND' });

    // Prevent self-approval (Four-Eye rule)
    if (loan.maker_officer_id === req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'SELF_APPROVAL_PROHIBITED',
        message: 'Maker-Checker policy violation: Originating officer cannot sanction their own application.'
      });
    }

    const previousStatus = loan.status;
    loan.status = 'Approved';
    loan.sanctioned_amount = Number(req.body.sanctioned_amount || loan.applied_amount);
    loan.checker_manager_id = req.user.id;
    loan.sanction_date = new Date().toISOString();
    loan.version += 1;
    loan.updated_at = new Date().toISOString();

    await logServerAudit({
      action: 'LOAN_SANCTION_APPROVED',
      userId: req.user.id,
      userRole: req.user.role,
      entityId: loan.id,
      entityType: 'Loan Application',
      previousStatus,
      newStatus: 'Approved',
      notes: `Branch Manager sanctioned ${loan.id} for ₹${loan.sanctioned_amount}. Maker was ${loan.maker_officer_id}.`
    });

    res.json({ success: true, message: 'Loan sanctioned successfully under Four-Eye governance.', data: loan });
  } catch (err) {
    next(err);
  }
});

export default router;
