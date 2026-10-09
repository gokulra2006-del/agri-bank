// Server-Side Cash Flow and Harvest Repayment Planner Service

export function calculateScaleOfFinanceEligibility({
  landSizeAcres,
  crop,
  annualIncome = 150000,
  alliedIncome = 30000,
  existingDebt = 20000
}) {
  const SCALE_RATES = {
    'Sugarcane': 45000,
    'Paddy': 32000,
    'Ragi': 24000,
    'Cotton': 38000,
    'Maize': 26000,
    'Groundnut': 28000
  };

  const scalePerAcre = SCALE_RATES[crop] || 30000;
  const baseScaleLoan = Math.round(Number(landSizeAcres || 1) * scalePerAcre);
  
  // RBI KCC Master Guidelines: 10% post-harvest/household + 20% maintenance
  const kccBuffer = Math.round(baseScaleLoan * 0.30);
  const eligibleCreditLimit = baseScaleLoan + kccBuffer;

  const totalHouseholdIncome = Number(annualIncome) + Number(alliedIncome);
  const maxSafeFOIR = Math.max(0, Math.round(totalHouseholdIncome * 0.5) - Number(existingDebt));
  const recommendedLoan = Math.min(eligibleCreditLimit, maxSafeFOIR > 0 ? maxSafeFOIR * 2 : eligibleCreditLimit);

  return {
    scalePerAcre,
    baseScaleLoan,
    kccBuffer,
    eligibleCreditLimit,
    recommendedLoan
  };
}

export function generateServerRepaymentSchedule({
  appliedAmount,
  sowingDate,
  expectedHarvestDate,
  interestRate = 7.0,
  repaymentModel = 'BULLET_POST_HARVEST'
}) {
  const sow = new Date(sowingDate);
  const harvest = new Date(expectedHarvestDate);
  const mandiBufferDays = 15;
  const settlementDate = new Date(harvest.getTime() + mandiBufferDays * 24 * 60 * 60 * 1000);

  const durationDays = Math.max(30, Math.round((harvest.getTime() - sow.getTime()) / (24 * 60 * 60 * 1000)));
  const years = (durationDays + mandiBufferDays) / 365;
  const totalInterest = Math.round(appliedAmount * (interestRate / 100) * years);
  const totalPayable = appliedAmount + totalInterest;

  const installments = [];

  if (repaymentModel === 'BULLET_POST_HARVEST') {
    installments.push({
      installmentNumber: 1,
      dueDate: settlementDate.toISOString().split('T')[0],
      principalDue: appliedAmount,
      interestDue: totalInterest,
      totalDue: totalPayable,
      stageLabel: 'Post-Harvest Mandi Auction Settlement'
    });
  } else if (repaymentModel === 'BI_ANNUAL_HARVEST') {
    const halfP = Math.round(appliedAmount * 0.4);
    const midDate = new Date(sow.getTime() + Math.round(durationDays * 0.5) * 24 * 60 * 60 * 1000);
    const int1 = Math.round(halfP * (interestRate / 100) * 0.5);
    
    installments.push({
      installmentNumber: 1,
      dueDate: midDate.toISOString().split('T')[0],
      principalDue: halfP,
      interestDue: int1,
      totalDue: halfP + int1,
      stageLabel: 'Interim / First Picking Window'
    });

    const remP = appliedAmount - halfP;
    const int2 = totalInterest - int1;
    installments.push({
      installmentNumber: 2,
      dueDate: settlementDate.toISOString().split('T')[0],
      principalDue: remP,
      interestDue: int2,
      totalDue: remP + int2,
      stageLabel: 'Final Commercial Mandi Realization'
    });
  }

  return {
    repaymentModel,
    settlementDate: settlementDate.toISOString().split('T')[0],
    durationDays,
    totalPrincipal: appliedAmount,
    totalInterest,
    totalPayable,
    installments
  };
}
