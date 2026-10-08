// Pure calculation engine for Harvest-Based Repayment Planning
// Transparent, rule-based algorithms aligned with crop physiology and market realization cycles.

import { CROP_CALENDAR } from '../data/mockData.js';

/**
 * Generates harvest-aligned repayment schedule and comparative monthly EMI schedule.
 *
 * @param {Object} params
 * @param {string} params.crop - Crop name
 * @param {string} params.sowingDate - Sowing ISO date string YYYY-MM-DD
 * @param {string} params.expectedHarvestDate - Expected harvest ISO date string YYYY-MM-DD
 * @param {number} params.loanAmount - Principal amount in INR
 * @param {number} params.interestRate - Annual interest rate (e.g. 7.0)
 * @param {number} params.tenureMonths - Total facility tenure in months (e.g. 12)
 * @param {string} params.preference - 'auto' | 'bullet' | 'bi-annual' | 'quarterly'
 * @returns {Object} result containing harvest schedule, monthly EMI comparison, and metrics
 */
export function generateHarvestRepaymentPlan({
  crop = 'Paddy',
  sowingDate,
  expectedHarvestDate,
  loanAmount = 100000,
  interestRate = 7.0,
  tenureMonths = 12,
  preference = 'auto'
}) {
  const sow = new Date(sowingDate);
  const harvest = new Date(expectedHarvestDate);

  if (isNaN(sow.getTime()) || isNaN(harvest.getTime())) {
    throw new Error('Valid sowing and harvest dates are required.');
  }

  if (harvest <= sow) {
    throw new Error('Expected harvest date must be after sowing date.');
  }

  // Crop metadata lookup
  const cropInfo = CROP_CALENDAR.find(c => c.cropName.toLowerCase().includes(crop.toLowerCase())) || {
    cropName: crop,
    gestationDays: 120,
    waterRequirement: 'Medium',
    season: 'Kharif'
  };

  const cropDurationDays = Math.round((harvest - sow) / (1000 * 60 * 60 * 24));
  const mandiBufferDays = 15; // 15-day window for APMC arrival & payment clearing
  const firstSettlementDate = new Date(harvest.getTime() + mandiBufferDays * 24 * 60 * 60 * 1000);

  // Standard Monthly EMI calculation for comparison
  const monthlyRate = (interestRate / 100) / 12;
  const numMonthlyPayments = tenureMonths;
  let standardMonthlyEMI = 0;
  if (monthlyRate > 0) {
    standardMonthlyEMI = Math.round(
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numMonthlyPayments)) /
      (Math.pow(1 + monthlyRate, numMonthlyPayments) - 1)
    );
  } else {
    standardMonthlyEMI = Math.round(loanAmount / numMonthlyPayments);
  }
  const standardTotalPayable = standardMonthlyEMI * numMonthlyPayments;
  const standardTotalInterest = standardTotalPayable - loanAmount;

  // Determine harvest alignment model based on crop type
  const cropLower = crop.toLowerCase();
  let scheduleModel = 'BULLET_POST_HARVEST'; // Default
  if (preference !== 'auto') {
    scheduleModel = preference;
  } else if (cropLower.includes('sugarcane')) {
    scheduleModel = 'ANNUAL_MILL_CRUSHING'; // Sugar mill crushing cycle
  } else if (cropLower.includes('tomato') || cropLower.includes('vegetable') || cropLower.includes('onion')) {
    scheduleModel = 'MULTI_PICKING_QUARTERLY'; // Multiple pickings
  } else if (tenureMonths > 8) {
    scheduleModel = 'BI_ANNUAL_HARVEST'; // Kharif + Rabi two seasons
  }

  const installments = [];
  let harvestTotalInterest = 0;

  if (scheduleModel === 'BULLET_POST_HARVEST' || scheduleModel === 'bullet' || scheduleModel === 'ANNUAL_MILL_CRUSHING') {
    // Single bullet after harvest + mandi buffer
    const days = Math.min(365, cropDurationDays + mandiBufferDays);
    const years = days / 365;
    const interest = Math.round(loanAmount * (interestRate / 100) * years);
    harvestTotalInterest = interest;
    const totalDue = loanAmount + interest;

    installments.push({
      installmentNumber: 1,
      dueDate: firstSettlementDate.toISOString().split('T')[0],
      stageLabel: 'Post-Harvest Mandi Realization',
      principal: loanAmount,
      interest: interest,
      totalAmount: totalDue,
      remainingBalance: 0,
      cashFlowStatus: 'Peak Cash Inflow (APMC Auction Proceeds)'
    });
  } else if (scheduleModel === 'BI_ANNUAL_HARVEST' || scheduleModel === 'bi-annual') {
    // Two installments: 40% after mid-season crop / picking, 60% after final harvest
    const half1 = Math.round(loanAmount * 0.4);
    const half2 = loanAmount - half1;
    const midDate = new Date(sow.getTime() + Math.round(cropDurationDays * 0.5) * 24 * 60 * 60 * 1000);
    const midInterest = Math.round(half1 * (interestRate / 100) * (0.5));
    const finalDays = (cropDurationDays + mandiBufferDays) / 365;
    const finalInterest = Math.round(half2 * (interestRate / 100) * finalDays);
    harvestTotalInterest = midInterest + finalInterest;

    installments.push({
      installmentNumber: 1,
      dueDate: midDate.toISOString().split('T')[0],
      stageLabel: 'Interim / First Picking Window',
      principal: half1,
      interest: midInterest,
      totalAmount: half1 + midInterest,
      remainingBalance: half2,
      cashFlowStatus: 'Partial Yield / Green Harvest'
    });

    installments.push({
      installmentNumber: 2,
      dueDate: firstSettlementDate.toISOString().split('T')[0],
      stageLabel: 'Final Mandi Settlement',
      principal: half2,
      interest: finalInterest,
      totalAmount: half2 + finalInterest,
      remainingBalance: 0,
      cashFlowStatus: 'Full Commercial Mandi Realization'
    });
  } else {
    // Quarterly or multi-picking (3 tranches)
    const trancheP = Math.round(loanAmount / 3);
    const trancheP3 = loanAmount - trancheP * 2;
    const t1Date = new Date(sow.getTime() + 60 * 24 * 60 * 60 * 1000);
    const t2Date = new Date(sow.getTime() + 120 * 24 * 60 * 60 * 1000);
    const t3Date = firstSettlementDate;

    const int1 = Math.round(trancheP * (interestRate / 100) * (60 / 365));
    const int2 = Math.round(trancheP * (interestRate / 100) * (120 / 365));
    const int3 = Math.round(trancheP3 * (interestRate / 100) * ((cropDurationDays + mandiBufferDays) / 365));
    harvestTotalInterest = int1 + int2 + int3;

    installments.push({
      installmentNumber: 1,
      dueDate: t1Date.toISOString().split('T')[0],
      stageLabel: 'Early Picking Flush',
      principal: trancheP,
      interest: int1,
      totalAmount: trancheP + int1,
      remainingBalance: loanAmount - trancheP,
      cashFlowStatus: 'Initial market arrivals'
    });
    installments.push({
      installmentNumber: 2,
      dueDate: t2Date.toISOString().split('T')[0],
      stageLabel: 'Peak Harvest Picking',
      principal: trancheP,
      interest: int2,
      totalAmount: trancheP + int2,
      remainingBalance: trancheP3,
      cashFlowStatus: 'High volume wholesale sales'
    });
    installments.push({
      installmentNumber: 3,
      dueDate: t3Date.toISOString().split('T')[0],
      stageLabel: 'Final Harvest Closeout',
      principal: trancheP3,
      interest: int3,
      totalAmount: trancheP3 + int3,
      remainingBalance: 0,
      cashFlowStatus: 'Seasonal closure & mandi clearing'
    });
  }

  const harvestTotalPayable = loanAmount + harvestTotalInterest;

  return {
    crop: cropInfo.cropName,
    sowingDate: sow.toISOString().split('T')[0],
    expectedHarvestDate: harvest.toISOString().split('T')[0],
    cropDurationDays,
    mandiBufferDays,
    firstSettlementDate: firstSettlementDate.toISOString().split('T')[0],
    scheduleModel,
    loanAmount,
    interestRate,
    tenureMonths,
    harvestInstallments: installments,
    harvestTotalPayable,
    harvestTotalInterest,
    // Monthly comparison
    standardMonthlyEMI,
    standardTotalPayable,
    standardTotalInterest,
    savingsOrDifference: standardTotalPayable - harvestTotalPayable,
    riskComparison: {
      monthlyEMIStress: 'High risk of technical bounce during vegetative non-cash months (months 1–3 prior to harvest).',
      harvestAlignedAdvantage: 'Zero outflow during crop gestation; repayment due strictly when farmer holds mandi auction sale proceeds.'
    }
  };
}
