// Server-Side Explainable Farmer Resilience Index Engine
// Rule-based, transparent scoring with confidence penalties and governance rules.

export const FACTOR_WEIGHTS = [
  { factor: 'Irrigation Security', maxPoints: 20, weight: 0.20 },
  { factor: 'Crop Diversity', maxPoints: 15, weight: 0.15 },
  { factor: 'Climate Exposure', maxPoints: 15, weight: 0.15 },
  { factor: 'Credit & Leverage', maxPoints: 20, weight: 0.20 },
  { factor: 'Allied Income Buffer', maxPoints: 15, weight: 0.15 },
  { factor: 'Soil & Agronomy', maxPoints: 10, weight: 0.10 },
  { factor: 'Insurance Protection', maxPoints: 5, weight: 0.05 }
];

export const GOVERNANCE_NOTICE = "Decision support only. The Explainable Farmer Resilience Index is NOT a credit bureau score and never automatically approves or rejects loans. A human loan officer must review and decide.";

export function calculateServerResilience(farmer, override = null) {
  if (!farmer) return { score: 0, category: 'Unknown', confidence: 0 };

  let score = 0;
  let confidence = 100;
  const breakdown = [];
  const missingWarnings = [];

  // 1. Irrigation Access (Max 20)
  const lType = (farmer.land_type || farmer.landType || '').toLowerCase();
  let irriPts = 8;
  if (lType.includes('canal') || lType.includes('river')) irriPts = 20;
  else if (lType.includes('borewell') || lType.includes('drip') || lType.includes('tube')) irriPts = 18;
  else if (lType.includes('well') || lType.includes('tank')) irriPts = 14;
  else if (lType.includes('seasonal')) irriPts = 10;
  score += irriPts;
  breakdown.push({ factor: 'Irrigation Security', points: irriPts, max: 20 });

  // 2. Crop Diversity (Max 15)
  const secCrop = (farmer.secondary_crop || farmer.secondaryCrop || '').toLowerCase();
  let divPts = (!secCrop || secCrop === 'none') ? 6 : 15;
  score += divPts;
  breakdown.push({ factor: 'Crop Diversity', points: divPts, max: 15 });

  // 3. Climate Exposure (Max 15)
  const zone = (farmer.rainfall_zone || farmer.rainfallRisk || '').toLowerCase();
  let climPts = zone === 'low' || zone === 'deficit' ? 7 : zone === 'high' || zone === 'excess' ? 10 : 15;
  score += climPts;
  breakdown.push({ factor: 'Climate Exposure', points: climPts, max: 15 });

  // 4. Credit & Leverage (Max 20)
  const annInc = Number(farmer.annual_income || farmer.annualIncome || 100000);
  const allInc = Number(farmer.allied_income || farmer.alliedIncome || 0);
  const totalInc = annInc + allInc;
  const debt = Number(farmer.existing_loan_burden || farmer.existingLoanBurden || 0);
  const dti = totalInc > 0 ? (debt / totalInc) : 0;
  let levPts = dti < 0.25 ? 20 : dti < 0.45 ? 14 : 7;
  score += levPts;
  breakdown.push({ factor: 'Credit & Leverage', points: levPts, max: 20 });

  // 5. Allied Income Buffer (Max 15)
  let allPts = allInc >= 40000 ? 15 : allInc > 10000 ? 10 : 4;
  score += allPts;
  breakdown.push({ factor: 'Allied Income Buffer', points: allPts, max: 15 });

  // 6. Soil Health & Agronomy (Max 10)
  if (farmer.soil_card_issued === undefined && farmer.soilCardIssued === undefined) {
    confidence -= 10;
    missingWarnings.push('Soil health testing unverified');
  }
  const hasSoil = Boolean(farmer.soil_card_issued || farmer.soilCardIssued);
  const soilPts = hasSoil ? 9 : 4;
  score += soilPts;
  breakdown.push({ factor: 'Soil & Agronomy', points: soilPts, max: 10 });

  // 7. Insurance Protection (Max 5)
  if (farmer.pmfby_enrolled === undefined && farmer.pmfbyEnrolled === undefined) {
    confidence -= 10;
    missingWarnings.push('PMFBY enrollment not recorded');
  }
  const hasIns = Boolean(farmer.pmfby_enrolled || farmer.pmfbyEnrolled);
  const insPts = hasIns ? 5 : 0;
  score += insPts;
  breakdown.push({ factor: 'Insurance Protection', points: insPts, max: 5 });

  const rawScore = score;
  let isOverridden = false;
  let finalScore = rawScore;

  if (override && override.adjustedScore !== undefined) {
    finalScore = Math.max(0, Math.min(100, Number(override.adjustedScore)));
    isOverridden = true;
  }

  let category = 'Moderate Resilience';
  if (finalScore >= 75) category = 'High Resilience (Climate-Safe)';
  else if (finalScore < 55) category = 'Vulnerable (Safeguards Required)';

  return {
    score: finalScore,
    rawScore,
    category,
    confidencePercent: Math.max(30, confidence),
    isOverridden,
    overrideReason: isOverridden ? override.reason : null,
    adjustedBy: isOverridden ? override.officerName : null,
    missingWarnings,
    breakdown,
    governanceNotice: GOVERNANCE_NOTICE
  };
}
