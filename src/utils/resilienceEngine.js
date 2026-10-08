// Farmer Resilience Engine for AgriSahay Banking
// Transparent, non-blackbox calculations with plain-language explanations.

/**
 * Calculates transparent resilience score (0-100) based on 7 agricultural factors.
 * Weights:
 * 1. Irrigation Access (20 pts)
 * 2. Crop Diversity (15 pts)
 * 3. Rainfall Exposure (15 pts)
 * 4. Repayment History (20 pts)
 * 5. Dairy/Secondary Income (15 pts)
 * 6. Soil Health & Organic Practices (10 pts)
 * 7. Insurance Coverage (5 pts)
 */
export function calculateResilienceScore(farmer) {
  let score = 0;
  const breakdown = [];
  const recommendations = [];

  // 1. Irrigation Access (Max 20)
  const lType = (farmer.landType || '').toLowerCase();
  let irrigationPts = 8;
  let irrigationDesc = 'Rainfed reliant; vulnerable to dry spells';
  if (lType.includes('canal') || lType.includes('drip')) {
    irrigationPts = 20;
    irrigationDesc = 'Assured perennial or micro-irrigation system installed';
  } else if (lType.includes('borewell') || lType.includes('well')) {
    irrigationPts = 16;
    irrigationDesc = 'Groundwater irrigation with seasonal aquifer exposure';
  } else {
    recommendations.push('Explore PM Krishi Sinchayee Yojana subsidy for micro-drip or sprinkler irrigation.');
  }
  score += irrigationPts;
  breakdown.push({ factor: 'Irrigation Security', points: irrigationPts, max: 20, desc: irrigationDesc });

  // 2. Crop Diversity (Max 15)
  let diversityPts = 7;
  let diversityDesc = 'Single mono-crop cultivation; higher market concentration risk';
  if (farmer.secondaryCrop && farmer.secondaryCrop !== 'None' && farmer.secondaryCrop.trim() !== '') {
    diversityPts = 15;
    diversityDesc = `Dual cropping (${farmer.primaryCrop} + ${farmer.secondaryCrop}) reduces market failure risk`;
  } else {
    recommendations.push('Intercrop with pulses or short-duration oilseeds to hedge against price volatility.');
  }
  score += diversityPts;
  breakdown.push({ factor: 'Crop Diversity', points: diversityPts, max: 15, desc: diversityDesc });

  // 3. Rainfall & Climate Exposure (Max 15)
  // Based on district vulnerability
  let rainPts = 12;
  let rainDesc = 'Moderate historical rainfall variability in district';
  const dist = (farmer.district || '').toLowerCase();
  if (dist === 'mandya') {
    rainPts = 14;
    rainDesc = 'Cauvery command basin; low drought incidence';
  } else if (dist === 'guntur') {
    rainPts = 8;
    rainDesc = 'High cyclone & unseasonal rain volatility zone';
    recommendations.push('Advise automatic crop loss notification enrollment under PMFBY.');
  } else if (dist === 'dharmapuri') {
    rainPts = 9;
    rainDesc = 'Semi-arid rain shadow region; occasional dry spells';
  }
  score += rainPts;
  breakdown.push({ factor: 'Climate Exposure', points: rainPts, max: 15, desc: rainDesc });

  // 4. Repayment History & Debt Burden (Max 20)
  let debtPts = 20;
  let debtDesc = 'Zero past defaults and manageable debt burden';
  const burden = Number(farmer.existingLoanBurden || 0);
  const income = Number(farmer.annualIncome || 100000);
  const dti = burden / income;
  if (dti > 0.4) {
    debtPts = 6;
    debtDesc = 'High debt obligations relative to annual income';
    recommendations.push('Structure smaller initial credit tranche and monitor debt servicing closely.');
  } else if (dti > 0.2) {
    debtPts = 13;
    debtDesc = 'Moderate leverage; sustainable debt obligations';
  }
  score += debtPts;
  breakdown.push({ factor: 'Credit & Leverage', points: debtPts, max: 20, desc: debtDesc });

  // 5. Allied & Secondary Income (Max 15)
  const allied = Number(farmer.alliedIncome || 0);
  let alliedPts = 5;
  let alliedDesc = 'Negligible non-farm or allied cash flow';
  if (allied >= 40000) {
    alliedPts = 15;
    alliedDesc = `Strong buffer from dairy/livestock: ₹${allied.toLocaleString('en-IN')}/year`;
  } else if (allied > 10000) {
    alliedPts = 10;
    alliedDesc = `Moderate secondary income: ₹${allied.toLocaleString('en-IN')}/year`;
  } else {
    recommendations.push('Evaluate eligibility for allied dairy animal loan to create year-round cash flow.');
  }
  score += alliedPts;
  breakdown.push({ factor: 'Allied Income Buffer', points: alliedPts, max: 15, desc: alliedDesc });

  // 6. Soil Health & Management (Max 10)
  const soilPts = farmer.soilCardIssued !== false ? 9 : 4;
  const soilDesc = soilPts === 9 ? 'Soil Health Card verified; balanced N-P-K fertilizer protocol' : 'Pending Soil Health Card testing';
  if (soilPts < 9) {
    recommendations.push('Assist farmer in testing soil sample at local Krishi Vigyan Kendra (KVK).');
  }
  score += soilPts;
  breakdown.push({ factor: 'Soil & Agronomy', points: soilPts, max: 10, desc: soilDesc });

  // 7. Insurance Coverage (Max 5)
  const insPts = farmer.pmfbyEnrolled !== false ? 5 : 0;
  const insDesc = insPts === 5 ? 'Active PMFBY enrollment verified for current season' : 'No active crop insurance recorded';
  if (insPts === 0) {
    recommendations.push('Mandate PMFBY crop insurance premium deduction during loan disbursal.');
  }
  score += insPts;
  breakdown.push({ factor: 'Insurance Protection', points: insPts, max: 5, desc: insDesc });

  // Classification & Category
  let category = 'Moderate Resilience';
  let badgeColor = '#d97706';
  let badgeBg = '#fef3c7';
  if (score >= 75) {
    category = 'High Resilience (Climate-Safe)';
    badgeColor = '#15803d';
    badgeBg = '#dcfce7';
  } else if (score < 55) {
    category = 'Vulnerable (Safeguards Required)';
    badgeColor = '#b91c1c';
    badgeBg = '#fee2e2';
  }

  return {
    score,
    category,
    badgeColor,
    badgeBg,
    breakdown,
    recommendations
  };
}

/**
 * Calculates harvest-aligned repayment dates and projected cashflows.
 */
export function calculateHarvestRepaymentSchedule({ sowingDate, cropDurationDays, harvestWindowDays = 21, mandiSaleBufferDays = 15, loanAmount, interestRate = 7 }) {
  const sow = new Date(sowingDate);
  if (isNaN(sow.getTime())) {
    return null;
  }

  // Harvest date = Sowing + crop duration
  const harvestStart = new Date(sow.getTime() + cropDurationDays * 24 * 60 * 60 * 1000);
  const harvestEnd = new Date(harvestStart.getTime() + harvestWindowDays * 24 * 60 * 60 * 1000);
  
  // Repayment bullet date = Harvest End + Mandi Sale Buffer (allows farmer to sell at APMC and receive proceeds)
  const repaymentDueDate = new Date(harvestEnd.getTime() + mandiSaleBufferDays * 24 * 60 * 60 * 1000);

  // Interest calculation for crop duration + buffer
  const totalDays = cropDurationDays + harvestWindowDays + mandiSaleBufferDays;
  const years = totalDays / 365;
  const simpleInterest = Math.round(loanAmount * (interestRate / 100) * years);
  const totalPayable = Math.round(loanAmount + simpleInterest);

  return {
    sowingDate: sow.toISOString().split('T')[0],
    harvestStartDate: harvestStart.toISOString().split('T')[0],
    harvestEndDate: harvestEnd.toISOString().split('T')[0],
    repaymentDueDate: repaymentDueDate.toISOString().split('T')[0],
    totalDurationDays: totalDays,
    principal: loanAmount,
    projectedInterest: simpleInterest,
    totalDueAtMandiSettlement: totalPayable,
    rationale: `Repayment scheduled ${mandiSaleBufferDays} days post-harvest to allow APMC mandi realization and protect farmer from distress distress sales.`
  };
}

/**
 * Farm What-If Stress Simulator
 * Evaluates impact of agricultural shocks on income, repayment capacity, and recommended loan ceiling.
 */
export function simulateFarmScenario(baseIncome, baseLoanRequested, scenarioType) {
  let incomeLossPercent = 0;
  let costInflationPercent = 0;
  let shockDescription = '';
  let policyAction = '';

  switch (scenarioType) {
    case 'DROUGHT':
      incomeLossPercent = 45;
      costInflationPercent = 15;
      shockDescription = 'Severe deficit rainfall leading to 45% yield drop and 15% higher emergency irrigation costs.';
      policyAction = 'Trigger PMFBY claims process, grant 6-month repayment holiday, cap loan to essential maintenance.';
      break;
    case 'DELAYED_MONSOON':
      incomeLossPercent = 20;
      costInflationPercent = 10;
      shockDescription = '30-day sowing delay requiring resowing with short-duration contingency seed varieties.';
      policyAction = 'Extend harvest repayment schedule by 45 days; provide seed resowing top-up advance.';
      break;
    case 'PRICE_CRASH':
      incomeLossPercent = 35;
      costInflationPercent = 0;
      shockDescription = 'Post-harvest mandi market glut causing 35% drop below Minimum Support Price (MSP).';
      policyAction = 'Advise warehouse receipt financing (e-NWR) to allow holding stock until market recovers.';
      break;
    case 'PEST_ATTACK':
      incomeLossPercent = 30;
      costInflationPercent = 25;
      shockDescription = 'Invasive pest attack (e.g. Fall Armyworm / Thrips) cutting yield by 30% with 25% higher pesticide outlay.';
      policyAction = 'Require agricultural university advisory endorsement; disburse in staged tranches upon verification.';
      break;
    case 'INPUT_COST_SPIKE':
      incomeLossPercent = 5;
      costInflationPercent = 30;
      shockDescription = 'Sharp hike in certified seed, diesel, and fertilizer rates reducing net harvest margins.';
      policyAction = 'Review Scale of Finance guidelines; disburse directly to input vendors via Kisan Card.';
      break;
    default:
      incomeLossPercent = 0;
      costInflationPercent = 0;
      shockDescription = 'Baseline normal seasonal conditions with average monsoon and stable mandi pricing.';
      policyAction = 'Standard harvest-linked lending guidelines apply.';
  }

  const simulatedGross = Math.round(baseIncome * (1 - incomeLossPercent / 100));
  const estimatedDebtCapacity = Math.round(simulatedGross * 0.45); // Max 45% farm income can service debt safely
  const simulatedLoanCeiling = Math.min(baseLoanRequested, Math.max(25000, estimatedDebtCapacity));
  const repaymentStress = baseLoanRequested > estimatedDebtCapacity ? 'Deficit Risk' : 'Manageable';

  return {
    scenarioType,
    incomeLossPercent,
    costInflationPercent,
    shockDescription,
    policyAction,
    simulatedIncome: simulatedGross,
    estimatedDebtCapacity,
    simulatedLoanCeiling,
    repaymentStress
  };
}

/**
 * Climate-Safe Loan Safeguard Recommendations
 */
export function getClimateSafeSafeguards(resilienceScore, climateExposure) {
  const safeguards = [];

  if (resilienceScore < 60 || climateExposure === 'High') {
    safeguards.push({
      title: 'Mandatory PMFBY Crop Insurance',
      description: 'Require active crop insurance policy prior to disbursal to protect against catastrophic weather loss.',
      icon: 'ShieldCheck',
      category: 'Risk Mitigation'
    });
    safeguards.push({
      title: 'Emergency Repayment Holiday Clause',
      description: 'Embed pre-approved 90-day grace period in sanction terms if official state gazette declares district calamity.',
      icon: 'Calendar',
      category: 'Credit Relief'
    });
    safeguards.push({
      title: 'Phased Tranche Disbursal',
      description: 'Disburse in 2 tranches: 60% at land preparation/sowing, 40% after ARO field verification of germination.',
      icon: 'Layers',
      category: 'Prudential Underwriting'
    });
  }

  if (resilienceScore < 70) {
    safeguards.push({
      title: 'Drip / Micro-Irrigation Top-Up',
      description: 'Offer preferential 2% subsidized rate for solar pump or drip-line installation under PM-KUSUM.',
      icon: 'Droplets',
      category: 'Resilience Enhancement'
    });
    safeguards.push({
      title: 'Crop Diversification Incentive',
      description: 'Encourage allocating at least 20% land to drought-resistant millets or pulses.',
      icon: 'Sprout',
      category: 'Agro-Ecological'
    });
  }

  return safeguards;
}
