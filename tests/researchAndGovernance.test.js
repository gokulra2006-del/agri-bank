import {
  calculateEntryHash,
  verifyAuditChain,
  logAudit,
  getAuditLogs,
  GENESIS_HASH
} from '../src/utils/audit.js';

import {
  calculateResilienceScore,
  FACTOR_WEIGHTS_EXPLANATIONS,
  DECISION_GOVERNANCE_NOTICE
} from '../src/utils/resilienceEngine.js';

import {
  calculateDescriptiveStats,
  calculateSUSScore,
  checkPrivacyThreshold,
  STANDARD_STUDY_TASKS
} from '../src/utils/studyUtils.js';

import {
  generateMonthlyCashFlowProjections
} from '../src/utils/plannerEngine.js';

import {
  getIndicSpeechVoiceTag,
  RURAL_BANKING_TERMS
} from '../src/utils/accessibility.js';

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

console.log('\n====================================================');
console.log('🧪 AgriSahay Research & Governance - Automated Unit Tests');
console.log('====================================================\n');

// ----------------------------------------------------
// Test Suite 1: Audit Log Cryptographic Hash-Chaining
// ----------------------------------------------------
console.log('Test Suite 1: Audit Log Cryptographic Hash Chaining');

const testGenesisHash = GENESIS_HASH;
const entry1 = {
  id: 'AUDIT-101',
  timestamp: '2025-01-01T10:00:00.000Z',
  userRole: 'Branch Manager',
  action: 'LOAN_APPROVED',
  entityId: 'LN-201',
  entityType: 'Loan Application',
  previousStatus: 'Under Review',
  newStatus: 'Approved',
  notes: 'Approved under seasonal credit limit',
  prevHash: testGenesisHash
};
entry1.hash = calculateEntryHash(testGenesisHash, entry1);

const entry2 = {
  id: 'AUDIT-102',
  timestamp: '2025-01-01T10:05:00.000Z',
  userRole: 'Field Officer',
  action: 'FIELD_VISIT_LOGGED',
  entityId: 'VST-501',
  entityType: 'Field Verification',
  previousStatus: 'Scheduled',
  newStatus: 'Completed',
  notes: 'Crop condition healthy',
  prevHash: entry1.hash
};
entry2.hash = calculateEntryHash(entry1.hash, entry2);

const validChain = [entry2, entry1]; // newest first
const verificationResult = verifyAuditChain(validChain);

assert(verificationResult.isValid === true, 'Valid 2-entry hash chain passes cryptographic verification');
assert(verificationResult.totalEntries === 2, 'Correct count of verified entries reported');

// Tampering simulation: alter notes in entry1 without updating hash
const tamperedEntry1 = { ...entry1, notes: 'Unauthorized tampering of audit notes' };
const brokenChain = [entry2, tamperedEntry1];
const tamperedResult = verifyAuditChain(brokenChain);

assert(tamperedResult.isValid === false, 'Tampered audit record detected by hash discrepancy');
assert(tamperedResult.brokenAtIndex !== null, 'Exact index of broken chain pinpointed');

// ----------------------------------------------------
// Test Suite 2: Explainable Farmer Resilience Index
// ----------------------------------------------------
console.log('\nTest Suite 2: Explainable Farmer Resilience Index & Overrides');

const completeFarmer = {
  id: 'F-TEST-1',
  name: 'Ramesh Gowda',
  landType: 'Canal Irrigated',
  primaryCrop: 'Paddy',
  secondaryCrop: 'Ragi',
  rainfallRisk: 'Low',
  overdueCount: 0,
  activeLoanCount: 1,
  alliedActivities: ['Dairy (2 cows)'],
  soilCardIssued: true,
  pmfbyEnrolled: true
};

const fullEval = calculateResilienceScore(completeFarmer);
assert(fullEval.confidencePercent >= 90, `Complete profile yields high confidence percentage (Got: ${fullEval.confidencePercent}%)`);
assert(fullEval.missingInformation.length === 0, 'No missing data alerts for complete profile');
assert(fullEval.score >= 70, `Score is high for diversified farmer (Got: ${fullEval.score})`);
assert(FACTOR_WEIGHTS_EXPLANATIONS.length === 7, 'All 7 factor weights explanations defined');
assert(typeof DECISION_GOVERNANCE_NOTICE === 'string' && DECISION_GOVERNANCE_NOTICE.includes('human loan officer'), 'Decision governance notice emphasizes human officer accountability');

// Incomplete farmer (missing soil card and pmfby)
const incompleteFarmer = {
  id: 'F-TEST-2',
  name: 'Somanna',
  landType: 'Rainfed',
  primaryCrop: 'Sugarcane',
  secondaryCrop: 'None',
  rainfallRisk: 'High',
  soilCardIssued: undefined,
  pmfbyEnrolled: undefined
};
const incompleteEval = calculateResilienceScore(incompleteFarmer);
assert(incompleteEval.missingInformation.length > 0, `Missing fields apply confidence warnings (Count: ${incompleteEval.missingInformation.length})`);
assert(incompleteEval.confidencePercent < 100, `Confidence percentage penalized for missing fields (Got: ${incompleteEval.confidencePercent}%)`);

// Officer Override Testing via overrides map
const overridesMap = {
  'F-TEST-1': {
    adjustedScore: 88,
    reason: 'Farmer installed micro-drip irrigation verified during unannounced branch visit.',
    adjustedBy: 'Gokul Sharma (Branch Manager)',
    adjustedAt: '2025-01-20T10:00:00.000Z'
  }
};
const overriddenEval = calculateResilienceScore(completeFarmer, overridesMap);
assert(overriddenEval.isOverridden === true, 'Officer override flag correctly detected');
assert(overriddenEval.score === 88, `Officer override score applied (Got: ${overriddenEval.score})`);
assert(overriddenEval.overrideReason.length > 10, 'Mandatory justification captured');

// ----------------------------------------------------
// Test Suite 3: Usability Statistics & SUS Brooke 1986
// ----------------------------------------------------
console.log('\nTest Suite 3: Usability Study Statistics & SUS Scoring (Brooke 1986)');

const times = [45, 52, 48, 60, 42, 55, 50, 48];
const stats = calculateDescriptiveStats(times);
assert(stats.count === 8, 'Descriptive stats count matches sample size');
assert(stats.mean > 45 && stats.mean < 55, `Mean calculated accurately (Got: ${stats.mean})`);
assert(stats.median === 49, `Median calculated accurately (Got: ${stats.median})`);
assert(stats.stdDev > 0, `Standard deviation calculated (Got: ${stats.stdDev})`);

// Empty array returns zeros
const emptyStats = calculateDescriptiveStats([]);
assert(emptyStats.count === 0 && emptyStats.mean === 0, 'Empty data set returns safe zero stats');

// Standard Brooke 1986 SUS scoring
// All 5s -> Odd items (1,3,5,7,9): 5-1=4. Even items (2,4,6,8,10): 5-5=0. Sum = 4*5 = 20. 20 * 2.5 = 50.
const allFives = calculateSUSScore([5, 5, 5, 5, 5, 5, 5, 5, 5, 5]);
assert(allFives.score === 50, `SUS score for neutral/all-5 matches Brooke formula (Got: ${allFives.score})`);

// Ideal response: 5 on odd (agreements), 1 on even (disagreements)
// Odd: (5-1)*5 = 20. Even: (5-1)*5 = 20. Sum = 40. 40 * 2.5 = 100.
const idealSUS = calculateSUSScore([5, 1, 5, 1, 5, 1, 5, 1, 5, 1]);
assert(idealSUS.score === 100, `Ideal SUS score calculates to 100 (Got: ${idealSUS.score})`);
assert(idealSUS.adjective === 'Excellent', `Ideal SUS gets Excellent adjective rating (Got: ${idealSUS.adjective})`);

// ----------------------------------------------------
// Test Suite 4: Privacy Threshold k-Anonymity (N < 5)
// ----------------------------------------------------
console.log('\nTest Suite 4: Differential Privacy / k-Anonymity Threshold');

const smallGroup = checkPrivacyThreshold(3, 5);
assert(smallGroup.isSuppressed === true, 'Group with N < 5 is correctly suppressed for privacy');
assert(smallGroup.displayValue.includes('Suppressed'), 'Display value contains suppression notice');

const adequateGroup = checkPrivacyThreshold(12, 5);
assert(adequateGroup.isSuppressed === false, 'Group with N >= 5 is NOT suppressed');
assert(adequateGroup.displayValue === '12', 'Display value matches original count when N >= 5');

// ----------------------------------------------------
// Test Suite 5: Monthly Cash Flow Curves
// ----------------------------------------------------
console.log('\nTest Suite 5: Multi-Scenario Cash Flow Projections');

const loanDetails = {
  crop: 'Paddy',
  sowingDate: '2026-06-15',
  expectedHarvestDate: '2026-10-25',
  loanAmount: 100000,
  expectedIncome: 220000,
  inputExpenses: 65000,
  existingDebt: 15000,
  interestRate: 7.0
};

const cashFlow = generateMonthlyCashFlowProjections(loanDetails);
assert(cashFlow.expected.monthlyBreakdown.length > 0, `Generated ${cashFlow.expected.monthlyBreakdown.length} monthly cash flow intervals`);
assert(cashFlow.expected !== undefined, 'Expected scenario curve generated');
assert(cashFlow.worstCase !== undefined, 'Worst-case scenario curve generated');
assert(cashFlow.bestCase !== undefined, 'Best-case scenario curve generated');
assert(cashFlow.worstCase.totalIncome < cashFlow.expected.totalIncome, 'Worst-case revenue reflects climate shock discount');
assert(cashFlow.bestCase.totalIncome > cashFlow.expected.totalIncome, 'Best-case revenue reflects bumper yield premium');

// ----------------------------------------------------
// Test Suite 6: Speech API Tag & Indic Rural Glossary
// ----------------------------------------------------
console.log('\nTest Suite 6: Speech API Localization & Rural Terminology');

assert(getIndicSpeechVoiceTag('en') === 'en-IN', 'English resolves to en-IN');
assert(getIndicSpeechVoiceTag('hi') === 'hi-IN', 'Hindi resolves to hi-IN');
assert(getIndicSpeechVoiceTag('kn') === 'kn-IN', 'Kannada resolves to kn-IN');
assert(getIndicSpeechVoiceTag('ta') === 'ta-IN', 'Tamil resolves to ta-IN');

const termsKeys = Object.keys(RURAL_BANKING_TERMS);
assert(termsKeys.length >= 8, `Rural banking simplified glossary contains >= 8 core terms (Got: ${termsKeys.length})`);
const loanTerm = RURAL_BANKING_TERMS.loan;
assert(loanTerm && loanTerm.simpleAnalogy.length > 0, 'Analogy provided for loan concept');

console.log('\n====================================================');
console.log(`Test Execution Finished: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================\n');

if (failed > 0) {
  process.exit(1);
}
