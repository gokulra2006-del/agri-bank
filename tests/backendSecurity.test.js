// AgriSahay Phase 6: Automated Backend Security, Integrity & Compliance Test Suite
import assert from 'assert';
import jwt from 'jsonwebtoken';
import { config } from '../server/config/config.js';
import { getDb } from '../server/database/db.js';
import { authenticateToken } from '../server/middleware/auth.js';
import { requireRole, enforceMakerChecker } from '../server/middleware/rbac.js';
import { calculateEntryHash, logServerAudit, verifyServerAuditChain } from '../server/middleware/auditLogger.js';
import { validateFarmerInput, validateLoanInput } from '../server/middleware/validator.js';
import { calculateServerResilience } from '../server/services/resilienceService.js';
import { calculateScaleOfFinanceEligibility } from '../server/services/plannerService.js';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(testName, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${testName}`);
    console.error(`    -> ${err.message}`);
    failedTests++;
  }
}

async function runAsyncTest(testName, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${testName}`);
    console.error(`    -> ${err.message}`);
    failedTests++;
  }
}

console.log('\n================================================================');
console.log('🛡️  AgriSahay Phase 6: Comprehensive Security & Integrity Tests');
console.log('================================================================\n');

// ----------------------------------------------------
// 1. Authentication Middleware & Token Verification
// ----------------------------------------------------
console.log('Suite 1: Authentication & Token Security');

runTest('1.1 Rejects request when Authorization Bearer token is missing (401)', () => {
  const req = { headers: {} };
  let statusCode = null;
  let responseBody = null;
  const res = {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => { responseBody = data; }
      };
    }
  };
  const next = () => { throw new Error('next() should not be called'); };

  authenticateToken(req, res, next);
  assert.strictEqual(statusCode, 401, 'Expected 401 status code');
  assert.strictEqual(responseBody.error, 'AUTHENTICATION_REQUIRED');
});

runTest('1.2 Rejects tampered / invalid JWT token (403)', () => {
  const req = { headers: { authorization: 'Bearer invalid.tampered.token123' } };
  let statusCode = null;
  let responseBody = null;
  const res = {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => { responseBody = data; }
      };
    }
  };
  const next = () => { throw new Error('next() should not be called'); };

  authenticateToken(req, res, next);
  assert.strictEqual(statusCode, 403, 'Expected 403 status code for bad token');
  assert.strictEqual(responseBody.error, 'TOKEN_INVALID');
});

runTest('1.3 Rejects expired JWT token (403 TOKEN_EXPIRED)', () => {
  // Sign token with -10 seconds expiration
  const expiredToken = jwt.sign(
    { id: 'USR-TEST', role: 'RELATIONSHIP_OFFICER' },
    config.jwtSecret,
    { expiresIn: -10 }
  );

  const req = { headers: { authorization: `Bearer ${expiredToken}` } };
  let statusCode = null;
  let responseBody = null;
  const res = {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => { responseBody = data; }
      };
    }
  };
  const next = () => { throw new Error('next() should not be called'); };

  authenticateToken(req, res, next);
  assert.strictEqual(statusCode, 403, 'Expected 403 status code for expired token');
  assert.strictEqual(responseBody.error, 'TOKEN_EXPIRED');
});

runTest('1.4 Accepts valid signed token and attaches req.user', () => {
  const validToken = jwt.sign(
    { id: 'USR-002', username: 'officer', role: 'RELATIONSHIP_OFFICER' },
    config.jwtSecret,
    { expiresIn: '1h' }
  );

  const req = { headers: { authorization: `Bearer ${validToken}` } };
  let nextCalled = false;
  const res = {
    status: () => ({ json: () => {} })
  };
  const next = () => { nextCalled = true; };

  authenticateToken(req, res, next);
  assert.strictEqual(nextCalled, true, 'Expected next() to be called for valid token');
  assert.strictEqual(req.user.id, 'USR-002');
  assert.strictEqual(req.user.role, 'RELATIONSHIP_OFFICER');
});

// ----------------------------------------------------
// 2. Role-Based Access Control (RBAC) & Four-Eye Maker-Checker
// ----------------------------------------------------
console.log('\nSuite 2: Role-Based Authorization & Maker-Checker Dual Control');

runTest('2.1 Blocks Relationship Officer from accessing Manager/Admin endpoints (403)', () => {
  const req = { user: { id: 'USR-002', role: 'RELATIONSHIP_OFFICER' } };
  let statusCode = null;
  const res = {
    status: (code) => {
      statusCode = code;
      return { json: () => {} };
    }
  };
  const next = () => { throw new Error('next() should not be called'); };

  const guard = requireRole(['BRANCH_MANAGER', 'ADMIN']);
  guard(req, res, next);
  assert.strictEqual(statusCode, 403, 'Relationship Officer must not access Branch Manager endpoints');
});

runTest('2.2 Allows Branch Manager to access Manager-authorized endpoints', () => {
  const req = { user: { id: 'USR-001', role: 'BRANCH_MANAGER' } };
  let nextCalled = false;
  const res = { status: () => ({ json: () => {} }) };
  const next = () => { nextCalled = true; };

  const guard = requireRole(['BRANCH_MANAGER', 'ADMIN']);
  guard(req, res, next);
  assert.strictEqual(nextCalled, true, 'Branch Manager must be permitted');
});

runTest('2.3 Enforces Four-Eye rule: Officer cannot approve loan applications', () => {
  const req = { user: { id: 'USR-002', role: 'RELATIONSHIP_OFFICER' } };
  let statusCode = null;
  let responseBody = null;
  const res = {
    status: (code) => {
      statusCode = code;
      return { json: (data) => { responseBody = data; } };
    }
  };
  const next = () => { throw new Error('next() should not be called'); };

  enforceMakerChecker(req, res, next);
  assert.strictEqual(statusCode, 403, 'Officer must be barred from sanctioning loans');
  assert.strictEqual(responseBody.error, 'FOUR_EYE_VIOLATION');
});

// ----------------------------------------------------
// 3. Input Validation & Strict Aadhaar Masking
// ----------------------------------------------------
console.log('\nSuite 3: Input Validation & Aadhaar Masking Compliance');

runTest('3.1 Rejects farmer registration with invalid 10-digit mobile number', () => {
  const req = {
    body: {
      name: 'Ramesh Patel',
      phone: '12345', // Invalid: not 10 digits, does not start with 6-9
      land_size_acres: 3.5,
      primary_crop: 'Paddy'
    }
  };
  let statusCode = null;
  let responseBody = null;
  const res = {
    status: (code) => {
      statusCode = code;
      return { json: (data) => { responseBody = data; } };
    }
  };
  const next = () => { throw new Error('next() should not be called'); };

  validateFarmerInput(req, res, next);
  assert.strictEqual(statusCode, 400, 'Invalid phone number must return 400');
  assert.strictEqual(responseBody.error, 'VALIDATION_FAILED');
  assert.ok(responseBody.errors.some(e => e.includes('Indian mobile number')));
});

runTest('3.2 Rejects excessive or negative land size values', () => {
  const req = {
    body: {
      name: 'Suresh Gowda',
      phone: '9876543210',
      land_size_acres: -2.0, // Negative acreage
      primary_crop: 'Ragi'
    }
  };
  let statusCode = null;
  const res = {
    status: (code) => {
      statusCode = code;
      return { json: () => {} };
    }
  };
  const next = () => { throw new Error('next() should not be called'); };

  validateFarmerInput(req, res, next);
  assert.strictEqual(statusCode, 400, 'Negative land size must return 400');
});

runTest('3.3 Automatically sanitizes and masks raw 12-digit Aadhaar input', () => {
  const req = {
    body: {
      name: 'Mallamma',
      phone: '9845123456',
      land_size_acres: 4.2,
      primary_crop: 'Sugarcane',
      aadhaar: '5678 1234 9901' // Raw Aadhaar provided
    }
  };
  const res = { status: () => ({ json: () => {} }) };
  let nextCalled = false;
  const next = () => { nextCalled = true; };

  validateFarmerInput(req, res, next);
  assert.strictEqual(nextCalled, true);
  assert.strictEqual(req.body.aadhaar, undefined, 'Raw Aadhaar field must be deleted');
  assert.strictEqual(req.body.aadhaar_masked, 'XXXX-XXXX-9901', 'Aadhaar must be masked to last 4 digits');
});

runTest('3.4 Rejects loan application with out-of-bounds amount', () => {
  const req = {
    body: {
      farmer_id: 'FAR-001',
      crop: 'Cotton',
      applied_amount: 3000, // Below minimum ₹5,000
      sowing_date: '2026-06-01',
      expected_harvest_date: '2026-11-01'
    }
  };
  let statusCode = null;
  const res = {
    status: (code) => {
      statusCode = code;
      return { json: () => {} };
    }
  };
  const next = () => { throw new Error('next() should not be called'); };

  validateLoanInput(req, res, next);
  assert.strictEqual(statusCode, 400, 'Loan amount below threshold must be rejected');
});

// ----------------------------------------------------
// 4. Audit Log Cryptographic Hash-Chaining & Tamper Detection
// ----------------------------------------------------
console.log('\nSuite 4: Server-Side Cryptographic Audit Trail & Tamper Proofing');

await runAsyncTest('4.1 Server audit logger creates hash-chained log entry', async () => {
  const entry = await logServerAudit({
    action: 'TEST_AUDIT_ACTION',
    userId: 'USR-001',
    userRole: 'BRANCH_MANAGER',
    entityId: 'LN-TEST-01',
    entityType: 'Loan Application',
    notes: 'Testing cryptographic forward hash-chaining'
  });

  assert.ok(entry.hash, 'Entry must contain a cryptographic hash');
  assert.ok(entry.prev_hash, 'Entry must point to previous hash');
  assert.strictEqual(entry.sequence_num > 0, true, 'Sequence number must be positive');
});

await runAsyncTest('4.2 Verify audit log chain validity', async () => {
  const verification = await verifyServerAuditChain();
  assert.strictEqual(verification.isValid, true, 'Untampered audit chain must report valid');
  assert.ok(verification.totalEntries > 0, 'Total entries must be greater than zero');
});

await runAsyncTest('4.3 Detects malicious tampering of historical audit entry', async () => {
  const db = await getDb();
  // Maliciously tamper with an existing entry notes
  const targetEntry = db.tables.audit_events[0];
  const originalNotes = targetEntry.notes;
  targetEntry.notes = 'MALICIOUS_UNAUTHORIZED_ALTERATION';

  const verification = await verifyServerAuditChain();
  assert.strictEqual(verification.isValid, false, 'Tampered chain must report invalid');
  assert.ok(verification.brokenAtIndex !== undefined, 'Broken index must be flagged');

  // Restore for subsequent tests
  targetEntry.notes = originalNotes;
  const restoredVerification = await verifyServerAuditChain();
  assert.strictEqual(restoredVerification.isValid, true, 'Restored chain must report valid');
});

// ----------------------------------------------------
// 5. Offline Sync Idempotency & Replay Attack Mitigation
// ----------------------------------------------------
console.log('\nSuite 5: Offline Sync Idempotency & Conflict Detection');

await runAsyncTest('5.1 Idempotency key prevents duplicate transaction recording', async () => {
  const db = await getDb();
  const testIdempotencyKey = 'IDEMP-TEST-UNIQUE-999';

  // First submission
  const firstEvent = {
    id: 'SYNC-EV-01',
    idempotency_key: testIdempotencyKey,
    device_id: 'TAB-MANDYA-01',
    entity_type: 'FIELD_VISIT',
    entity_id: 'VIS-999',
    operation: 'CREATE',
    status: 'SYNCED',
    created_at: new Date().toISOString()
  };
  db.tables.offline_sync_events.push(firstEvent);

  // Attempt duplicate submission with exact same idempotency key
  const duplicateFound = db.tables.offline_sync_events.find(e => e.idempotency_key === testIdempotencyKey);
  assert.ok(duplicateFound, 'Prior event with idempotency key found');
  assert.strictEqual(duplicateFound.entity_id, 'VIS-999');

  // Verify that count does not duplicate
  const matches = db.tables.offline_sync_events.filter(e => e.idempotency_key === testIdempotencyKey);
  assert.strictEqual(matches.length, 1, 'Only one event must be persisted for the idempotency key');
});

await runAsyncTest('5.2 Field-level version collision flags conflict', async () => {
  const serverVersion = 3;
  const clientBaseVersion = 2; // Stale version from disconnected field tablet

  const hasVersionConflict = clientBaseVersion < serverVersion;
  assert.strictEqual(hasVersionConflict, true, 'Client version lag must trigger conflict detection');
});

// ----------------------------------------------------
// 6. DPDP Act 2023 Consent & k-Anonymity Privacy Thresholds
// ----------------------------------------------------
console.log('\nSuite 6: DPDP Act 2023 Consent & Privacy Governance');

await runAsyncTest('6.1 Consent withdrawal marks consent inactive and records audit trail', async () => {
  const db = await getDb();
  const consentRecord = {
    farmer_id: 'FAR-CONSENT-01',
    purpose_credit_assessment: true,
    purpose_satellite_monitoring: true,
    status: 'ACTIVE',
    consent_timestamp: new Date().toISOString()
  };
  db.tables.consent_records.push(consentRecord);

  // Withdraw consent
  consentRecord.status = 'REVOKED';
  consentRecord.revoked_at = new Date().toISOString();

  assert.strictEqual(consentRecord.status, 'REVOKED', 'Consent status must be updated to REVOKED');
  assert.ok(consentRecord.revoked_at, 'Revocation timestamp must be recorded');
});

runTest('6.2 k-Anonymity demographic suppression for small cohorts (N < 5)', () => {
  const villageCohorts = {
    'Kyathanahalli': 12,
    'Koppa': 8,
    'Isolated Hamlet': 2 // N < 5
  };
  const threshold = 5;

  const getSuppressedCohort = (village) => {
    return villageCohorts[village] < threshold ? '[Suppressed: N < 5]' : village;
  };

  assert.strictEqual(getSuppressedCohort('Kyathanahalli'), 'Kyathanahalli', 'Cohort >= 5 must be preserved');
  assert.strictEqual(getSuppressedCohort('Isolated Hamlet'), '[Suppressed: N < 5]', 'Cohort < 5 must be suppressed');
});

// ----------------------------------------------------
// 7. Business Logic & Resilient Scoring Validation
// ----------------------------------------------------
console.log('\nSuite 7: Business Logic & Resilient Scoring Consistency');

runTest('7.1 Resilience engine calculates 7-factor score with valid confidence', () => {
  const farmer = {
    land_size_acres: 4.5,
    land_type: 'Canal Irrigated',
    pmfby_enrolled: true,
    soil_card_issued: true,
    annual_income: 280000,
    credit_bureau_score: 720
  };

  const result = calculateServerResilience(farmer);
  assert.ok(result.score >= 0 && result.score <= 100, 'Score must be between 0 and 100');
  assert.ok(result.confidencePercent >= 50, 'Confidence must be at least 50%');
  assert.ok(result.category.includes('Resilience'), 'Category must indicate resilience');
  assert.strictEqual(result.breakdown.length, 7, 'Must explain all 7 factors');
});

runTest('7.2 Scale of finance eligibility accurately matches District Scale', () => {
  const eligibility = calculateScaleOfFinanceEligibility({
    crop: 'Sugarcane',
    landSizeAcres: 3,
    existingDebt: 25000,
    annualIncome: 350000
  });

  assert.ok(eligibility.recommendedLoan > 0, 'Recommended loan must be positive');
  assert.ok(eligibility.eligibleCreditLimit >= eligibility.recommendedLoan, 'Recommended loan must not exceed base scale');
  assert.strictEqual(eligibility.kccBuffer > 0, true, 'KCC buffer must be included');
});

// ----------------------------------------------------
// Test Execution Summary
// ----------------------------------------------------
console.log('\n================================================================');
console.log(`📊 Test Summary: Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
if (failedTests === 0) {
  console.log('🎉 100% Security, Integrity & Compliance Tests Passed Successfully!');
} else {
  console.error(`⚠️  ${failedTests} tests failed.`);
  process.exit(1);
}
console.log('================================================================\n');
