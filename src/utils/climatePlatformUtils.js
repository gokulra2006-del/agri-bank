// Pure rule engines for:
// 1. Smart Notes Assistant (multilingual rule extraction)
// 2. Government Schemes & Subsidy Matcher
// 3. Early Financial Stress Detection

import { GOV_SCHEMES } from '../data/mockData.js';

// ==========================================
// 1. SMART NOTES ASSISTANT (Rule-Based Demo)
// ==========================================

export function extractSmartVisitNotes(rawText = '', lang = 'en') {
  if (!rawText || !rawText.trim()) {
    return null;
  }

  const textLower = rawText.toLowerCase();

  // Highlight matches
  const highlightedPhrases = [];

  // 1. Crop Condition
  let cropCondition = 'Fair / Moderate';
  let cropRisk = 'Low';
  if (
    textLower.includes('excellent') ||
    textLower.includes('healthy') ||
    textLower.includes('optimal') ||
    textLower.includes('ಉತ್ತಮ') ||
    textLower.includes('ಬೆಳೆ ಚೆನ್ನಾಗಿದೆ') ||
    textLower.includes('अच्छी स्थिति') ||
    textLower.includes('நன்று')
  ) {
    cropCondition = 'Good / Healthy Growth';
    highlightedPhrases.push('healthy / optimal growth');
  } else if (
    textLower.includes('pest') ||
    textLower.includes('attack') ||
    textLower.includes('wilt') ||
    textLower.includes('droop') ||
    textLower.includes('ರೋಗ') ||
    textLower.includes('ಕೀಟ') ||
    textLower.includes('कीट') ||
    textLower.includes('பூச்சி')
  ) {
    cropCondition = 'Stressed / Disease Observed';
    cropRisk = 'High';
    highlightedPhrases.push('pest / disease mention');
  } else if (
    textLower.includes('yellow') ||
    textLower.includes('deficit') ||
    textLower.includes('dry') ||
    textLower.includes('ಒಣಗಿದೆ') ||
    textLower.includes('सूखा')
  ) {
    cropCondition = 'Moisture Deficit';
    cropRisk = 'Medium';
    highlightedPhrases.push('moisture deficit / dryness');
  }

  // 2. Irrigation Status
  let irrigationCondition = 'Normal Canal/Well Flow';
  if (
    textLower.includes('canal') ||
    textLower.includes('ಕಾಲುವೆ') ||
    textLower.includes('नहर') ||
    textLower.includes('கால்வாய்')
  ) {
    irrigationCondition = 'Canal Irrigation Active';
    highlightedPhrases.push('canal water');
  } else if (
    textLower.includes('borewell') ||
    textLower.includes('ಬೋರ್‌ವೆಲ್') ||
    textLower.includes('बोरवेल') ||
    textLower.includes('போர்வெல்')
  ) {
    irrigationCondition = 'Borewell Groundwater Dependent';
    highlightedPhrases.push('borewell supply');
  } else if (
    textLower.includes('dry') ||
    textLower.includes('water shortage') ||
    textLower.includes('ನೀರಿನ ಕೊರತೆ') ||
    textLower.includes('पानी की कमी')
  ) {
    irrigationCondition = 'Severe Water Deficit';
    cropRisk = 'High';
    highlightedPhrases.push('water shortage');
  }

  // 3. Pest / Disease
  let pestMentioned = false;
  let pestDetails = 'None observed';
  if (
    textLower.includes('pest') ||
    textLower.includes('thrips') ||
    textLower.includes('bollworm') ||
    textLower.includes('armyworm') ||
    textLower.includes('ಕೀಟ') ||
    textLower.includes('कीट') ||
    textLower.includes('பூச்சி')
  ) {
    pestMentioned = true;
    pestDetails = 'Pest/insect pressure noted in field observations';
    highlightedPhrases.push('pest infestation');
  }

  // 4. Missing Documents Mentioned
  const missingDocs = [];
  if (textLower.includes('rtc') || textLower.includes('pahani') || textLower.includes('ಪಹಣಿ') || textLower.includes('7-12')) {
    missingDocs.push('Updated RTC / Land Record Mutation');
    highlightedPhrases.push('RTC / Pahani document');
  }
  if (textLower.includes('noc') || textLower.includes('cooperative') || textLower.includes('ಸೊಸೈಟಿ')) {
    missingDocs.push('PACS Cooperative NOC');
    highlightedPhrases.push('PACS NOC');
  }
  if (textLower.includes('insurance') || textLower.includes('pmfby') || textLower.includes('ವಿಮೆ') || textLower.includes('बीमा')) {
    missingDocs.push('PMFBY Crop Insurance Premium Receipt');
    highlightedPhrases.push('insurance receipt');
  }

  // 5. Follow-up Needed & Suggested Date
  let followUpDays = 14;
  if (cropRisk === 'High') followUpDays = 5;
  else if (cropRisk === 'Medium') followUpDays = 10;

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + followUpDays);
  const suggestedFollowUpDate = targetDate.toISOString().split('T')[0];

  return {
    rawText,
    extractedLang: lang,
    cropCondition,
    irrigationCondition,
    pestMentioned,
    pestDetails,
    missingDocs,
    cropRisk,
    suggestedFollowUpDate,
    highlightedPhrases,
    suggestedAction:
      cropRisk === 'High'
        ? 'Schedule emergency field inspection within 5 days and alert Taluk Agriculture Officer.'
        : 'Maintain standard monitoring and verify mandi harvesting cutting slip schedule.'
  };
}

// ==========================================
// 2. SCHEMES & SUBSIDY MATCHER
// ==========================================

export function matchFarmerSchemes(farmer) {
  if (!farmer) return [];

  const land = Number(farmer.landSize || 0);
  const income = Number(farmer.annualIncome || 0);
  const isRainfed = (farmer.landType || '').toLowerCase().includes('rainfed');
  const crop = (farmer.primaryCrop || '').toLowerCase();

  return GOV_SCHEMES.map(scheme => {
    let status = 'Eligible';
    let matchScore = 95;
    const reasonsMet = [];
    const reasonsUnmet = [];
    const requiredDocs = [];

    if (scheme.id === 'SCH-01') {
      // PMFBY Crop Insurance
      requiredDocs.push('Land RTC / Patta', 'Sowing Certificate', 'Aadhaar Card');
      if (farmer.pmfbyEnrolled) {
        reasonsMet.push('Enrolled for notified crop in notified taluk.');
      } else {
        status = 'Likely eligible';
        reasonsMet.push('Notified agricultural crop cultivated.');
        reasonsUnmet.push('Active policy enrollment receipt pending submission.');
      }
    } else if (scheme.id === 'SCH-02') {
      // Prompt Repayment Subvention (3%)
      requiredDocs.push('KCC Bank Passbook', 'Crop Verification Note');
      if (farmer.existingLoanBurden < income * 0.4) {
        reasonsMet.push('Account compliant with timely harvest-linked repayments.');
      } else {
        status = 'Likely eligible';
        reasonsMet.push('KCC sanctioned borrower.');
        reasonsUnmet.push('Subject to timely settlement within 1 year / harvest date.');
      }
    } else if (scheme.id === 'SCH-03') {
      // PM-KISAN
      requiredDocs.push('Land Records', 'Aadhaar (Masked/e-KYC)', 'Bank Account');
      if (land <= 5) {
        reasonsMet.push(`Small/marginal landholding (${land} acres).`);
        reasonsMet.push('Eligible for ₹6,000 direct income support.');
      } else {
        status = 'Eligible';
        reasonsMet.push('Cultivating landholder family with verified land records.');
      }
    } else if (scheme.id === 'SCH-04') {
      // Agri Infrastructure Fund (AIF)
      requiredDocs.push('Project Report', 'Land Possession Certificate', 'NOC');
      if (land >= 3 || income > 300000) {
        status = 'Likely eligible';
        reasonsMet.push('Adequate farm scale for post-harvest warehouse/sorting unit.');
      } else {
        status = 'Not eligible';
        reasonsUnmet.push('Individual scale below minimum project threshold for cold storage.');
      }
    } else {
      // Micro-Irrigation / PMKSY
      requiredDocs.push('Water Source Certificate', 'Electricity/Borewell Bill', 'Soil Report');
      if (isRainfed) {
        status = 'Eligible';
        reasonsMet.push('Rainfed farm qualifies for highest slab (up to 70% drip subsidy).');
      } else {
        status = 'Likely eligible';
        reasonsMet.push('Subsidized micro-irrigation drip equipment applicable.');
      }
    }

    return {
      schemeId: scheme.id,
      title: scheme.title,
      category: scheme.category,
      benefits: scheme.benefits,
      status,
      matchScore,
      reasonsMet,
      reasonsUnmet,
      requiredDocs,
      nextStep:
        status === 'Eligible'
          ? 'Fast-track application submission at branch desk.'
          : 'Assist farmer with missing documents or official portal linking.'
    };
  });
}

// ==========================================
// 3. EARLY FINANCIAL STRESS DETECTION
// ==========================================

export function detectFarmerFinancialStress(farmer, loans = [], repayments = []) {
  if (!farmer) return null;

  const farmerLoans = loans.filter(l => l.farmerId === farmer.id);
  const farmerRepayments = repayments.filter(r => r.farmerName.toLowerCase() === farmer.name.toLowerCase() || farmerLoans.some(l => l.id === r.loanId));

  let stressPoints = 0;
  const stressReasons = [];
  const supportiveActions = [];

  // Factor 1: Overdue repayment schedules
  const overdueCount = farmerRepayments.filter(r => r.status === 'Overdue').length;
  if (overdueCount > 0) {
    stressPoints += 45;
    stressReasons.push(`${overdueCount} installment(s) currently overdue past harvest maturity.`);
    supportiveActions.push('Offer a supportive harvest grace period and examine mandi auction timing.');
  }

  // Factor 2: High leverage / Debt-to-income ratio
  const debt = Number(farmer.existingLoanBurden || 0);
  const income = Number(farmer.annualIncome || 100000);
  const dti = debt / income;
  if (dti > 0.45) {
    stressPoints += 30;
    stressReasons.push(`High institutional leverage: Outstanding liabilities (${debt.toLocaleString('en-IN')}) exceed 45% of annual income.`);
    supportiveActions.push('Conduct credit restructuring review before sanctioning fresh liabilities.');
  } else if (dti > 0.25) {
    stressPoints += 15;
    stressReasons.push('Moderate debt burden requires careful seasonal cash flow tracking.');
  }

  // Factor 3: Rainfed mono-crop vulnerability
  const isRainfed = (farmer.landType || '').toLowerCase().includes('rainfed');
  const hasNoSecondary = !farmer.secondaryCrop || farmer.secondaryCrop === 'None' || farmer.secondaryCrop.trim() === '';
  if (isRainfed && hasNoSecondary) {
    stressPoints += 20;
    stressReasons.push('Rainfed mono-crop without secondary harvest or livestock buffer.');
    supportiveActions.push('Recommend allied dairy loan top-up and intercropping diversification.');
  }

  // Factor 4: Missing insurance safety net
  if (farmer.pmfbyEnrolled === false) {
    stressPoints += 15;
    stressReasons.push('No active PMFBY crop insurance enrolled to protect against climatic shocks.');
    supportiveActions.push('Assist with immediate seasonal PMFBY crop insurance enrollment.');
  }

  // Determine stress tier
  let stressTier = 'Low Stress (Stable)';
  let badgeColor = '#15803d';
  let badgeBg = '#dcfce7';
  if (stressPoints >= 50) {
    stressTier = 'High Stress (Assistance Needed)';
    badgeColor = '#b91c1c';
    badgeBg = '#fee2e2';
  } else if (stressPoints >= 25) {
    stressTier = 'Watchlist (Proactive Support)';
    badgeColor = '#d97706';
    badgeBg = '#fef3c7';
  }

  return {
    farmerId: farmer.id,
    farmerName: farmer.name,
    stressPoints,
    stressTier,
    badgeColor,
    badgeBg,
    stressReasons,
    supportiveActions,
    toneGuidance: 'Supportive and solution-oriented approach. Never treat seasonal agricultural delays as default.'
  };
}
