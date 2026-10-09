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
export const FACTOR_WEIGHTS_EXPLANATIONS = [
  { factor: 'Irrigation Security', maxPoints: 20, weightPercent: '20%', rationale: 'Perennial/canal irrigation provides direct insurance against rainfall deficit; rainfed crops carry 3x yield loss risk in drought years.' },
  { factor: 'Crop Diversity', maxPoints: 15, weightPercent: '15%', rationale: 'Polyculture hedges against localized disease attacks and single-commodity APMC wholesale market price crashes.' },
  { factor: 'Climate Exposure', maxPoints: 15, weightPercent: '15%', rationale: 'Reflects district-level historical monsoon departures and vulnerability to localized flooding or drought dry spells.' },
  { factor: 'Credit & Leverage', maxPoints: 20, weightPercent: '20%', rationale: 'Debt-to-income ratio indicates repayment headroom; unsustainable leverage magnifies credit distress under crop failure.' },
  { factor: 'Allied Income Buffer', maxPoints: 15, weightPercent: '15%', rationale: 'Dairy, poultry, or non-farm monthly revenue provides critical liquidity during crop gestation periods before harvest.' },
  { factor: 'Soil & Agronomy', maxPoints: 10, weightPercent: '10%', rationale: 'Soil Health Card verification ensures balanced macronutrient application, protecting yield stability and lowering chemical fertilizer expenses.' },
  { factor: 'Insurance Protection', maxPoints: 5, weightPercent: '5%', rationale: 'Active PMFBY enrollment ensures indemnity payouts against catastrophic area-yield or localized crop loss events.' }
];

export const DECISION_GOVERNANCE_NOTICE = "Decision support only. The Explainable Farmer Resilience Index is NOT a credit bureau score and never automatically approves or rejects loans. A human loan officer must review and decide.";

/**
 * Calculates Explainable Farmer Resilience Index (0-100) based on 7 transparent agricultural factors.
 * Includes missing data confidence penalty and supports officer override with mandatory audit reason.
 */
export function calculateResilienceScore(farmer, overrides = null) {
  if (!farmer) {
    return {
      index: 0,
      score: 0,
      category: 'Insufficient Data',
      badgeColor: '#64748b',
      badgeBg: '#f1f5f9',
      breakdown: [],
      recommendations: [],
      positiveFactors: [],
      riskFactors: [],
      missingInformation: ['Farmer profile record missing'],
      confidencePercent: 0,
      factorWeights: FACTOR_WEIGHTS_EXPLANATIONS,
      governanceNotice: DECISION_GOVERNANCE_NOTICE
    };
  }

  let score = 0;
  const breakdown = [];
  const recommendations = [];
  const positiveFactors = [];
  const riskFactors = [];
  const missingInformation = [];
  let confidencePercent = 100;

  // 1. Irrigation Access (Max 20)
  const lType = (farmer.landType || '').toLowerCase();
  let irrigationPts = 8;
  let irrigationDesc = 'Rainfed reliant; vulnerable to dry spells';
  if (lType.includes('canal') || lType.includes('drip')) {
    irrigationPts = 20;
    irrigationDesc = 'Assured perennial or micro-irrigation system installed';
    positiveFactors.push('Perennial/micro-irrigation access installed (+20 pts)');
  } else if (lType.includes('borewell') || lType.includes('well')) {
    irrigationPts = 16;
    irrigationDesc = 'Groundwater irrigation with seasonal aquifer exposure';
    positiveFactors.push('Borewell irrigation operational (+16 pts)');
  } else {
    riskFactors.push('Purely rainfed cultivation exposed to dry spells (-12 pts)');
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
    positiveFactors.push(`Diversified cropping pattern with ${farmer.secondaryCrop} (+15 pts)`);
  } else {
    riskFactors.push('Mono-cropping concentrates market and pest exposure (-8 pts)');
    recommendations.push('Intercrop with pulses or short-duration oilseeds to hedge against price volatility.');
  }
  score += diversityPts;
  breakdown.push({ factor: 'Crop Diversity', points: diversityPts, max: 15, desc: diversityDesc });

  // 3. Rainfall & Climate Exposure (Max 15)
  let rainPts = 12;
  let rainDesc = 'Moderate historical rainfall variability in district';
  const dist = (farmer.district || '').toLowerCase();
  if (dist === 'mandya') {
    rainPts = 14;
    rainDesc = 'Cauvery command basin; low drought incidence';
    positiveFactors.push('Command basin agro-climatic zone with stable hydrology (+14 pts)');
  } else if (dist === 'guntur') {
    rainPts = 8;
    rainDesc = 'High cyclone & unseasonal rain volatility zone';
    riskFactors.push('Coastal/delta cyclone vulnerability zone (-7 pts)');
    recommendations.push('Advise automatic crop loss notification enrollment under PMFBY.');
  } else if (dist === 'dharmapuri') {
    rainPts = 9;
    rainDesc = 'Semi-arid rain shadow region; occasional dry spells';
    riskFactors.push('Semi-arid rain shadow with periodic dry spells (-6 pts)');
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
    riskFactors.push(`Leverage ratio elevated (${(dti * 100).toFixed(0)}% of income committed to debt) (-14 pts)`);
    recommendations.push('Structure smaller initial credit tranche and monitor debt servicing closely.');
  } else if (dti > 0.2) {
    debtPts = 13;
    debtDesc = 'Moderate leverage; sustainable debt obligations';
  } else {
    positiveFactors.push('Low leverage and unencumbered farm cash flows (+20 pts)');
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
    positiveFactors.push(`Allied livestock cash flow buffer (₹${allied.toLocaleString('en-IN')}/yr) (+15 pts)`);
  } else if (allied > 10000) {
    alliedPts = 10;
    alliedDesc = `Moderate secondary income: ₹${allied.toLocaleString('en-IN')}/year`;
  } else {
    recommendations.push('Evaluate eligibility for allied dairy animal loan to create year-round cash flow.');
  }
  score += alliedPts;
  breakdown.push({ factor: 'Allied Income Buffer', points: alliedPts, max: 15, desc: alliedDesc });

  // 6. Soil Health & Management (Max 10)
  if (farmer.soilCardIssued === undefined || farmer.soilCardIssued === null) {
    missingInformation.push('Soil Health Card record pending verification (-10% confidence)');
    confidencePercent -= 10;
  }
  const soilPts = farmer.soilCardIssued !== false ? 9 : 4;
  const soilDesc = soilPts === 9 ? 'Soil Health Card verified; balanced N-P-K fertilizer protocol' : 'Pending Soil Health Card testing';
  if (soilPts < 9) {
    recommendations.push('Assist farmer in testing soil sample at local Krishi Vigyan Kendra (KVK).');
  } else {
    positiveFactors.push('Soil Health Card verified with balanced nutrient protocol (+9 pts)');
  }
  score += soilPts;
  breakdown.push({ factor: 'Soil & Agronomy', points: soilPts, max: 10, desc: soilDesc });

  // 7. Insurance Coverage (Max 5)
  if (farmer.pmfbyEnrolled === undefined || farmer.pmfbyEnrolled === null) {
    missingInformation.push('Crop insurance PMFBY status not uploaded (-10% confidence)');
    confidencePercent -= 10;
  }
  const insPts = farmer.pmfbyEnrolled !== false ? 5 : 0;
  const insDesc = insPts === 5 ? 'Active PMFBY enrollment verified for current season' : 'No active crop insurance recorded';
  if (insPts === 0) {
    riskFactors.push('No PMFBY insurance coverage recorded for current crop season (-5 pts)');
    recommendations.push('Mandate PMFBY crop insurance premium deduction during loan disbursal.');
  } else {
    positiveFactors.push('Active PMFBY crop insurance policy active (+5 pts)');
  }
  score += insPts;
  breakdown.push({ factor: 'Insurance Protection', points: insPts, max: 5, desc: insDesc });

  // Check for Officer Override
  const originalScore = score;
  let isOverridden = false;
  let overrideReason = null;
  let adjustedBy = null;
  let adjustedAt = null;

  if (overrides && overrides[farmer.id]) {
    const ov = overrides[farmer.id];
    score = Math.max(0, Math.min(100, Number(ov.adjustedScore || score)));
    isOverridden = true;
    overrideReason = ov.reason || 'Officer agronomic judgment adjustment';
    adjustedBy = ov.adjustedBy || 'Officer';
    adjustedAt = ov.adjustedAt || new Date().toISOString();
  }

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
    index: score,
    score, // Backward compatibility alias
    originalIndex: originalScore,
    isOverridden,
    overrideReason,
    adjustedBy,
    adjustedAt,
    category,
    badgeColor,
    badgeBg,
    breakdown,
    recommendations,
    positiveFactors,
    riskFactors,
    missingInformation,
    confidencePercent: Math.max(20, confidencePercent),
    factorWeights: FACTOR_WEIGHTS_EXPLANATIONS,
    governanceNotice: DECISION_GOVERNANCE_NOTICE,
    formulaExplanation: 'Explainable Farmer Resilience Index = Sum of 7 Weighted Agronomic Factor Points (0-100). Never decides loans automatically.'
  };
}

/**
 * Computes aggregated fairness and bias metrics across demographic cohorts.
 * Applies privacy threshold: groups with fewer than 5 records are marked suppressed.
 */
export function computeFairnessAndBiasMetrics(farmers = [], loans = []) {
  if (!Array.isArray(farmers) || farmers.length === 0) {
    return { cohorts: [], disparityFlags: [], notice: 'No borrower records available for aggregated fairness analysis.' };
  }

  // Helper to aggregate a group
  const evaluateCohort = (name, categoryName, filterFn) => {
    const matchedFarmers = farmers.filter(filterFn);
    const count = matchedFarmers.length;
    const isSuppressed = count < 5;

    if (count === 0 || isSuppressed) {
      return {
        category: categoryName,
        groupName: name,
        count,
        isSuppressed,
        avgIndex: isSuppressed ? 'Suppressed (N < 5)' : 0,
        approvalRate: isSuppressed ? 'Suppressed (N < 5)' : '0%',
        restructuringRate: isSuppressed ? 'Suppressed (N < 5)' : '0%'
      };
    }

    const indices = matchedFarmers.map(f => calculateResilienceScore(f).score);
    const avgIndex = Math.round(indices.reduce((a, b) => a + b, 0) / count);

    const farmerIds = new Set(matchedFarmers.map(f => f.id));
    const cohortLoans = loans.filter(l => farmerIds.has(l.farmerId));
    const approved = cohortLoans.filter(l => l.status === 'Approved' || l.status === 'Disbursed').length;
    const approvalRate = cohortLoans.length > 0 ? Math.round((approved / cohortLoans.length) * 100) : 0;
    const restructured = cohortLoans.filter(l => l.status === 'Restructured' || l.restructured).length;
    const restructuringRate = cohortLoans.length > 0 ? Math.round((restructured / cohortLoans.length) * 100) : 0;

    return {
      category: categoryName,
      groupName: name,
      count,
      isSuppressed: false,
      avgIndex,
      approvalRate: `${approvalRate}%`,
      restructuringRate: `${restructuringRate}%`,
      rawApprovalRate: approvalRate,
      rawAvgIndex: avgIndex
    };
  };

  const cohorts = [
    // 1. Irrigation
    evaluateCohort('Rainfed Farmers', 'Irrigation Source', f => (f.landType || '').toLowerCase().includes('rainfed')),
    evaluateCohort('Canal / Borewell Farmers', 'Irrigation Source', f => !(f.landType || '').toLowerCase().includes('rainfed')),

    // 2. Landholding Size
    evaluateCohort('Small & Marginal (< 2 Ha)', 'Landholding Category', f => Number(f.landArea || f.landAreaAcres || 1.5) < 5),
    evaluateCohort('Medium & Large (≥ 2 Ha)', 'Landholding Category', f => Number(f.landArea || f.landAreaAcres || 1.5) >= 5),

    // 3. Districts
    evaluateCohort('Mandya District', 'District Operations', f => (f.district || '').toLowerCase() === 'mandya'),
    evaluateCohort('Dharmapuri District', 'District Operations', f => (f.district || '').toLowerCase() === 'dharmapuri'),
    evaluateCohort('Nashik District', 'District Operations', f => (f.district || '').toLowerCase() === 'nashik'),
    evaluateCohort('Guntur District', 'District Operations', f => (f.district || '').toLowerCase() === 'guntur')
  ];

  // Disparity evaluation
  const disparityFlags = [];
  const rainfed = cohorts.find(c => c.groupName === 'Rainfed Farmers');
  const irrigated = cohorts.find(c => c.groupName === 'Canal / Borewell Farmers');

  if (rainfed && irrigated && !rainfed.isSuppressed && !irrigated.isSuppressed) {
    const gap = irrigated.rawAvgIndex - rainfed.rawAvgIndex;
    if (gap >= 12) {
      disparityFlags.push({
        title: 'Irrigation Access Score Disparity Detected',
        severity: 'Warning',
        message: `Rainfed farmers average index (${rainfed.avgIndex}) is ${gap} points lower than irrigated farmers (${irrigated.avgIndex}). Because irrigation carries 20 points, purely rainfed cultivators are structurally disadvantaged.`,
        recommendation: 'Do NOT deny credit based solely on the Index. Instead, recommend micro-irrigation subsidies (PMKSY) or staggered disbursements.'
      });
    }
  }

  const small = cohorts.find(c => c.groupName === 'Small & Marginal (< 2 Ha)');
  const large = cohorts.find(c => c.groupName === 'Medium & Large (≥ 2 Ha)');
  if (small && large && !small.isSuppressed && !large.isSuppressed) {
    const diff = Math.abs(small.rawAvgIndex - large.rawAvgIndex);
    if (diff > 15) {
      disparityFlags.push({
        title: 'Landholding Scale Weighting Variance',
        severity: 'Notice',
        message: `Marginal farmers index variance is ${diff} points. Allied livestock income should be factored to balance single-parcel land limits.`,
        recommendation: 'Evaluate dairy/goat livestock cash flows to offset small land area limitations.'
      });
    }
  }

  return {
    cohorts,
    disparityFlags,
    notice: 'Aggregated fairness metrics do not prove bias or fairness on their own. They serve as diagnostic indicators for credit committee review. Groups with N < 5 are suppressed to protect privacy.'
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
