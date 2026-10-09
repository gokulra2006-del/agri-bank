# AgriSahay STRIDE Threat Model & Security Mitigations

## 1. Threat Modeling Overview

AgriSahay utilizes Microsoft's **STRIDE** methodology (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) to evaluate risks in agricultural lending systems and rural edge synchronizations.

---

## 2. STRIDE Matrix & Mitigations

### 1. Spoofing (Identity Deception)
- **Threat**: An attacker impersonates a Branch Manager or Field Officer to sanction unauthorized loans or view sensitive farmer records.
- **Mitigation**:
  - All sensitive endpoints require signed Bearer tokens using HMAC-SHA256 (`authenticateToken`).
  - Passwords hashed using bcrypt with 10 salt rounds.
  - Expired tokens are immediately rejected with `403 TOKEN_EXPIRED`.

### 2. Tampering (Unauthorized Data Alteration)
- **Threat**: An internal rogue employee or external attacker modifies loan sanction amounts or alters historical audit records.
- **Mitigation**:
  - The `audit_events` ledger computes forward cryptographic hash chains (`prev_hash` $\to$ `hash`). Any alteration breaks chain verification (`/api/ops/audit-verify`).
  - Input validation sanitizes phone numbers, acreages, and numerical bounds.

### 3. Repudiation (Denial of Action)
- **Threat**: An officer denies having submitted an override or approved an unhedged loan application.
- **Mitigation**:
  - Every financial transaction, sanction, and score override records mandatory officer ID, timestamp, and justification in the immutable audit log.

### 4. Information Disclosure (Data Leakage)
- **Threat**: Unauthorized exposure of farmers' personally identifiable information (PII), Aadhaar numbers, or account details.
- **Mitigation**:
  - Raw 12-digit Aadhaar numbers are intercepted and masked immediately to `XXXX-XXXX-last4`.
  - Research exports strip all direct identifiers (names, phones, account numbers).
  - Demographic cohorts with $N < 5$ are suppressed (`[Suppressed: N < 5]`) to prevent differential re-identification attacks.

### 5. Denial of Service (DoS)
- **Threat**: Malicious actor floods login or search endpoints to exhaust server resources.
- **Mitigation**:
  - Sliding-window rate limiter restricts requests to 200 per 15-minute window per IP.
  - Pagination limits database response payload sizes.

### 6. Elevation of Privilege (Unauthorized Escalation)
- **Threat**: A Relationship Officer crafts an API payload calling the sanction endpoint (`/api/loans/:id/sanction`) to approve their own loan.
- **Mitigation**:
  - The Four-Eye dual-control middleware (`enforceMakerChecker`) and role checks (`requireRole(['BRANCH_MANAGER', 'ADMIN'])`) execute server-side on every sanction request.
  - Self-approval prohibition explicitly checks that `maker_officer_id !== req.user.id`.
