// Automated test suite for Climate Platform Utilities
import { generateHarvestRepaymentPlan } from '../src/utils/plannerEngine.js';
import { extractSmartVisitNotes, matchFarmerSchemes, detectFarmerFinancialStress } from '../src/utils/climatePlatformUtils.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('====================================================');
console.log('🧪 Climate-Smart Platform Utilities - Automated Tests');
console.log('====================================================\n');

// 1. Planner Engine
console.log('Test Suite 1: Planner Engine');
const plan = generateHarvestRepaymentPlan({
  crop: 'Paddy',
  sowingDate: '2025-07-01',
  expectedHarvestDate: '2025-11-01',
  loanAmount: 100000,
  interestRate: 7.0,
  tenureMonths: 6,
  preference: 'bullet'
});
assert(plan.harvestInstallments.length === 1, 'Bullet repayment generates 1 harvest-aligned installment');
assert(plan.standardMonthlyEMI > 0, 'Standard monthly EMI calculated for comparison');
assert(plan.riskComparison.harvestAlignedAdvantage.includes('Zero outflow'), 'Risk comparison explains seasonal advantage');

// 2. Smart Notes Assistant
console.log('\nTest Suite 2: Smart Notes Assistant (Rule-Based)');
const notesGood = extractSmartVisitNotes('Field inspection conducted. Crop is healthy and optimal. Canal water running well. 7-12 RTC document verified.');
assert(notesGood.cropCondition.includes('Healthy'), 'Healthy crop condition identified');
assert(notesGood.irrigationCondition.includes('Canal'), 'Canal irrigation identified');
assert(notesGood.cropRisk === 'Low', 'Low risk assigned to healthy crop');

const notesPest = extractSmartVisitNotes('ಬೆಳೆಗೆ ಕೀಟ ರೋಗ ತಗುಲಿದೆ. ನೀರಿನ ಕೊರತೆ ಇದೆ. ತಕ್ಷಣ ಪರಿಶೀಲನೆ ಅಗತ್ಯ.', 'kn');
assert(notesPest.pestMentioned === true, 'Kannada pest keyword correctly detected');
assert(notesPest.cropRisk === 'High', 'High risk assigned to crop with pest & water deficit');

// 3. Scheme Matcher
console.log('\nTest Suite 3: Scheme Matcher');
const sampleFarmer = {
  landSize: 2.5,
  landType: 'Rainfed',
  primaryCrop: 'Cotton',
  annualIncome: 180000,
  pmfbyEnrolled: true,
  existingLoanBurden: 20000
};
const schemes = matchFarmerSchemes(sampleFarmer);
assert(schemes.length >= 4, 'Farmer matched against all sample schemes');
const pmksy = schemes.find(s => s.schemeId === 'SCH-05');
assert(pmksy.status === 'Eligible', 'Rainfed farmer eligible for micro-irrigation subsidy');

// 4. Early Financial Stress Detection
console.log('\nTest Suite 4: Early Financial Stress Detection');
const stressedFarmer = {
  id: 'FMR-TEST',
  name: 'Test Borrower',
  landType: 'Rainfed',
  secondaryCrop: '',
  annualIncome: 100000,
  existingLoanBurden: 60000, // 60% DTI
  pmfbyEnrolled: false
};
const stress = detectFarmerFinancialStress(stressedFarmer, [], [{ farmerName: 'Test Borrower', status: 'Overdue' }]);
assert(stress.stressTier.includes('High Stress'), 'High stress tier assigned due to overdue & high leverage');
assert(stress.supportiveActions.length > 0, 'Supportive actions provided with solution-oriented tone');

console.log('\n====================================================');
console.log(`Execution Complete: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) process.exit(1);
else process.exit(0);
