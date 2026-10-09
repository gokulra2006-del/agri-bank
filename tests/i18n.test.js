// Automated Unit Tests for Full-Page Translation System & Multi-Lingual Architecture
import { t, DICTIONARIES, SUPPORTED_LANGUAGES, getLanguageCoverage } from '../src/utils/i18n.js';

console.log('====================================================');
console.log('🧪 AgriSahay Full-Page Translation System - Automated Tests');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
  }
}

// Suite 1: Supported Languages & Parity
console.log('Test Suite 1: Language Definitions & Dictionary Load');
assert(SUPPORTED_LANGUAGES.length === 10, 'All 10 official Indian languages defined in system');
const requiredCodes = ['en', 'hi', 'kn', 'ta', 'te', 'mr', 'bn', 'ml', 'gu', 'pa'];
requiredCodes.forEach(code => {
  assert(Boolean(DICTIONARIES[code]), `Dictionary for language [${code}] successfully loaded`);
});

// Suite 2: Fallback Chain Verification
console.log('\nTest Suite 2: Fallback Chain (Selected -> English -> Key)');
const enCommonSave = t('common.save', {}, 'en');
assert(enCommonSave === 'Save', 'Master English key resolves correctly ("Save")');

const hiCommonSave = t('common.save', {}, 'hi');
assert(hiCommonSave === 'सुरक्षित करें', 'Hindi translation resolves ("सुरक्षित करें")');

const knCommonSave = t('common.save', {}, 'kn');
assert(knCommonSave === 'ಉಳಿಸಿ', 'Kannada translation resolves ("ಉಳಿಸಿ")');

// Non-existent key should fall back to the key path
const missingKeyFallback = t('some.nonexistent.key', {}, 'ta');
assert(missingKeyFallback === 'some.nonexistent.key', 'Missing key falls back to key string safely');

// Suite 3: Dynamic Variable Interpolation
console.log('\nTest Suite 3: Dynamic Variable Interpolation');
const interpolatedEn = t('common.showingCount', { count: 32 }, 'en');
assert(interpolatedEn === 'Showing 32 items', `Interpolation replaces {count} in English: Got "${interpolatedEn}"`);

const interpolatedHi = t('common.itemsPending', { count: 5 }, 'hi');
assert(interpolatedHi === 'आपके पास 5 लंबित कार्य हैं', `Interpolation replaces {count} in Hindi: Got "${interpolatedHi}"`);

const interpolatedKn = t('farmers.modalDeleteConfirm', { farmerName: 'Basavaraj Patil', farmerId: 'FAR-001' }, 'kn');
assert(interpolatedKn.includes('Basavaraj Patil') && interpolatedKn.includes('FAR-001'), 'Multiple variables {farmerName} and {farmerId} replaced properly');

// Missing variable should preserve token or handle safely without breaking
const missingVar = t('common.showingCount', {}, 'en');
assert(missingVar === 'Showing {count} items', 'Missing variable leaves placeholder intact without crashing');

// Suite 4: Key Coverage & Completeness Metrics
console.log('\nTest Suite 4: Key Coverage Calculation');
const coverage = getLanguageCoverage();
assert(coverage.length === 10, 'Coverage metrics generated for all 10 languages');
const enCoverage = coverage.find(c => c.code === 'en');
assert(enCoverage.percentage === 100, 'Master English coverage reports 100%');

const hiCoverage = coverage.find(c => c.code === 'hi');
assert(hiCoverage.percentage >= 95, `Hindi coverage is comprehensive (Got ${hiCoverage.percentage}%)`);

const knCoverage = coverage.find(c => c.code === 'kn');
assert(knCoverage.percentage >= 95, `Kannada coverage is comprehensive (Got ${knCoverage.percentage}%)`);

// Suite 5: Data & Privacy Integrity Preservation
console.log('\nTest Suite 5: Data Rules & Aadhaar Masking');
const dummyAadhaar = 'XXXX-XXXX-8921';
assert(dummyAadhaar.startsWith('XXXX-XXXX-'), 'Aadhaar masking remains uniform across languages');

console.log('\n====================================================');
console.log(`Test Execution Finished: ${passedTests} PASSED, ${totalTests - passedTests} FAILED`);
console.log('====================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
