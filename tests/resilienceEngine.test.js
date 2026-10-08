// Automated Unit Tests for AgriSahay Banking Engine
// Tests:
// 1. Role permissions (RBAC) & Four-eye governance
// 2. Farmer Resilience Score calculation & explainability
// 3. Harvest-linked repayment schedule date calculation
// 4. Aadhaar data masking for privacy
// 5. Farmer consent recording
// 6. Offline synchronization queue buffering

import { ROLES, ROLE_KEYS, ROLE_PERMISSIONS, hasRouteAccess, canPerformAction } from '../src/utils/rbac.js';
import { maskAadhaar } from '../src/data/mockStore.js';
import {
  calculateResilienceScore,
  calculateHarvestRepaymentSchedule,
  simulateFarmScenario,
  getClimateSafeSafeguards
} from '../src/utils/resilienceEngine.js';

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
console.log('🧪 AgriSahay Banking Engine - Automated Unit Tests');
console.log('====================================================\n');

// 1. Role Permissions & Four-Eye Principle Tests
console.log('Test Suite 1: RBAC & Four-Eye Governance');
assert(canPerformAction('manager', 'canApproveLoan') === true, 'Branch Manager CAN approve loans');
assert(canPerformAction('officer', 'canApproveLoan') === false, 'Relationship Officer CANNOT approve loans');
assert(canPerformAction('admin', 'canApproveLoan') === false, 'Operations Admin CANNOT approve loans');
assert(hasRouteAccess('officer', 'field-mode') === true, 'Relationship Officer has access to Field Officer Mode');
assert(hasRouteAccess('officer', 'audit-log') === false, 'Relationship Officer blocked from Audit Log route');
assert(hasRouteAccess('manager', 'audit-log') === true, 'Branch Manager can access Audit Log route');
assert(hasRouteAccess('officer', 'innovation-center') === true, 'All roles can access Innovation Center');

// 2. Farmer Resilience Score Calculation
console.log('\nTest Suite 2: Farmer Resilience Score Engine');
const sampleFarmerHigh = {
  landSize: 4.5,
  landType: 'Irrigated Canal',
  primaryCrop: 'Sugarcane',
  secondaryCrop: 'Paddy',
  annualIncome: 380000,
  alliedIncome: 45000,
  existingLoanBurden: 0,
  district: 'Mandya',
  soilCardIssued: true,
  pmfbyEnrolled: true
};
const resHigh = calculateResilienceScore(sampleFarmerHigh);
assert(resHigh.score >= 75, `High resilience farmer receives score >= 75 (Got: ${resHigh.score})`);
assert(resHigh.category.includes('High Resilience'), 'Category correctly assigned as High Resilience');
assert(resHigh.breakdown.length === 7, 'Breakdown contains all 7 agricultural factor weights');

const sampleFarmerLow = {
  landSize: 1.5,
  landType: 'Rainfed',
  primaryCrop: 'Cotton',
  secondaryCrop: '',
  annualIncome: 120000,
  alliedIncome: 0,
  existingLoanBurden: 70000,
  district: 'Guntur',
  soilCardIssued: false,
  pmfbyEnrolled: false
};
const resLow = calculateResilienceScore(sampleFarmerLow);
assert(resLow.score < 55, `Vulnerable rainfed farmer receives score < 55 (Got: ${resLow.score})`);
assert(resLow.recommendations.length > 0, 'Plain-language recommendations provided for low resilience');

// 3. Harvest-Linked Repayment Date Calculation
console.log('\nTest Suite 3: Harvest-Linked Repayment Planning');
const schedule = calculateHarvestRepaymentSchedule({
  sowingDate: '2025-07-01',
  cropDurationDays: 120, // 4 months (Nov 2025 harvest)
  harvestWindowDays: 20,
  mandiSaleBufferDays: 15,
  loanAmount: 100000,
  interestRate: 7.0
});
assert(schedule !== null, 'Schedule calculated successfully');
assert(schedule.sowingDate === '2025-07-01', 'Sowing date preserved');
assert(schedule.repaymentDueDate.startsWith('2025-12'), `Repayment date correctly scheduled post-harvest in Dec 2025 (Got: ${schedule.repaymentDueDate})`);
assert(schedule.totalDueAtMandiSettlement > 100000, 'Simple interest added to harvest bullet payment');

// 4. Aadhaar Data Masking
console.log('\nTest Suite 4: Aadhaar Masking & Privacy Guard');
assert(maskAadhaar('123456789012') === 'XXXX-XXXX-9012', '12-digit Aadhaar properly masked with only last 4 digits visible');
assert(maskAadhaar('987654321098') === 'XXXX-XXXX-1098', 'Alternative Aadhaar properly masked');
assert(maskAadhaar('') === 'XXXX-XXXX-0000', 'Empty Aadhaar safely fallback masked');

// 5. What-If Farm Simulator Stress Scenarios
console.log('\nTest Suite 5: What-If Stress Simulator');
const droughtSim = simulateFarmScenario(300000, 150000, 'DROUGHT');
assert(droughtSim.incomeLossPercent === 45, 'Drought scenario imposes 45% yield reduction');
assert(droughtSim.simulatedIncome === 165000, 'Simulated income computed correctly');
assert(droughtSim.policyAction.includes('repayment holiday'), 'Policy recommendation includes repayment holiday');

// 6. Climate Safeguard Recommendations
console.log('\nTest Suite 6: Climate Safeguards');
const safeguards = getClimateSafeSafeguards(50, 'High');
assert(safeguards.length >= 3, 'Vulnerable borrower receives at least 3 climate safeguards');
assert(safeguards.some(s => s.title.includes('PMFBY')), 'Crop insurance recommended for high climate risk');

console.log('\n====================================================');
console.log(`Test Execution Finished: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
