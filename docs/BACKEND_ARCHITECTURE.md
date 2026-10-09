# AgriSahay Backend Architecture Specification

## 1. Executive Summary

AgriSahay's Phase 6 backend is engineered to provide an institutional-grade, secure, and explainable digital lending foundation tailored for inclusive rural credit delivery in India. The backend combines an **Express/Node.js** modular service layer, a **PostgreSQL** relational schema (with transparent in-memory fallback for isolated demo environments), cryptographic forward hash-chaining for tamper-evident audit logging, and strict compliance with the **Digital Personal Data Protection (DPDP) Act, 2023** and **RBI Fair Practices Code**.

```
+-------------------------------------------------------------------------+
|                        AgriSahay Client (React / Vite)                  |
|          [10-Language UI]   [Offline SQLite / Cache]   [A11y Layer]     |
+------------------------------------+------------------------------------+
                                     |  Bearer JWT / Idempotency Key
                                     v
+------------------------------------+------------------------------------+
|                       API Gateway & Middleware Layer                    |
|  - Sliding-Window Rate Limiter (200 req / 15 min per IP)               |
|  - Bearer Token Auth (JWT with HS256 and expiration validation)         |
|  - Role-Based Access Control (RBAC: Admin, Manager, Officer, Research)  |
|  - Four-Eye Sanction Dual Control (Self-approval prohibition)           |
|  - Input Validation & Mandatory Aadhaar Masking Guard (XXXX-XXXX-1234) |
|  - Cryptographic Audit Logger (Forward hash-chained blockchain ledger)  |
+------------------------------------+------------------------------------+
                                     |
                                     v
+------------------------------------+------------------------------------+
|                         Business Service Layer                          |
|  - Resilience Scoring Service (7-Factor explainable agronomic index)   |
|  - Repayment Planning Service (RBI KCC Scale of Finance & bullet logic) |
|  - PMFBY Claim Service (72-hour statutory window loss intimation)      |
|  - Conflict Resolution Engine (Field-level 3-way version merging)       |
+------------------------------------+------------------------------------+
                                     |
                                     v
+------------------------------------+------------------------------------+
|                   Data Persistence & Storage Layer                      |
|  - Primary: PostgreSQL 14+ Relational Engine (Connection Pooling)       |
|  - Fallback: Pre-seeded High-Performance In-Memory Relational Store    |
|  - 15 Relational Entities with Foreign Keys and Check Constraints       |
+-------------------------------------------------------------------------+
```

---

## 2. Key Architecture Principles

1. **Dual-Runtime Operation (Production PostgreSQL & Zero-Config Demo)**:
   - When `DATABASE_URL` is configured, connection pooling connects directly to PostgreSQL.
   - When running in local evaluation or demonstration mode without a database instance, the backend auto-initializes the embedded `MemoryDatabase`, seeded with standard baseline test fixtures, pre-computed hashes, and bcrypt-hashed passwords.

2. **Explainable and Transparent Scoring**:
   - Every resilience evaluation, repayment schedule, and loan limit calculation is executed purely through rule-based, deterministic algorithms.
   - No opaque AI models or black-box scores are utilized. Full factor breakdowns, weight percentages, and plain-language rationale are attached to every scoring payload.

3. **Tamper-Evident Forward Hash Chaining**:
   - Every financial sanction, field visit, consent change, and data access event is logged into the `audit_events` ledger.
   - Each entry computes a cryptographic forward hash linking to the previous entry's hash (`prev_hash`), ensuring that any retrospective tampering or deletion invalidates the chain.

4. **Idempotent Offline-First Synchronization**:
   - Field operations in remote villages use unique client-generated UUIDv4 `idempotency_key` headers.
   - Retried submissions return previously processed records without duplicating financial liabilities or visit entries.

---

## 3. Middleware Pipeline

Requests execute through a disciplined, fail-closed sequential middleware chain:

1. **`rateLimiter`**: Sliding window tracker enforcing 200 requests per 15-minute window per client IP (configurable via `RATE_LIMIT_MAX_REQUESTS`).
2. **`authenticateToken`**: Validates JWT bearer tokens, checks expiration, and mounts decoded user context on `req.user`.
3. **`requireRole(allowedRoles)`**: Authorizes endpoints strictly by user role.
4. **`enforceMakerChecker`**: Blocks loan origination officers from approving their own loans. Only branch managers or operations admins may sanction loans.
5. **`validateFarmerInput` / `validateLoanInput`**: Validates 10-digit Indian mobile numbers, positive land acreages, and automatically purges/masks raw 12-digit Aadhaar numbers to `XXXX-XXXX-last4`.
6. **`errorHandler`**: Centralized structured JSON error formatting with standard error codes and sanitized debugging output.

---

## 4. Service Layer Specifications

### 4.1 Resilience Engine (`resilienceService.js`)
Calculates an explainable 0–100 index evaluated across 7 weighted agronomic dimensions:
- **Irrigation Security** (20 pts): Perennial canal/river (20), borewell/drip (18), open well/tank (14), rainfed (8).
- **Crop Diversity** (15 pts): Multi-cropping / inter-cropping (15), monoculture (6).
- **Climate Exposure** (15 pts): Normal rainfall zone (15), excess zone (10), deficit/drought zone (7).
- **Credit & Leverage** (20 pts): Debt-to-income $< 25\%$ (20), $25-45\%$ (14), $> 45\%$ (7).
- **Allied Income Buffer** (15 pts): Dairy/poultry income $\ge ₹40,000$ (15), $₹10,000-40,000$ (10), negligible (4).
- **Soil & Agronomy** (10 pts): Soil Health Card issued & micro-nutrients balanced (9), pending testing (4).
- **Insurance Protection** (5 pts): PMFBY enrollment verified (5), uninsured (0).

**Confidence Penalty**: Missing critical verifications deduct 10% from `confidencePercent` and append structured warnings.

### 4.2 Repayment Planning Service (`plannerService.js`)
- Enforces official District Level Technical Committee (DLTC) Scale of Finance per acre (e.g., Sugarcane: ₹45,000/acre; Paddy: ₹32,000/acre).
- Calculates standard RBI Kisan Credit Card (KCC) buffers: $+10\%$ post-harvest consumption $+20\%$ asset maintenance.
- Computes bullet repayment schedules aligned with expected crop harvest dates.

---

## 5. Prototype Notice & Governance Disclaimer

> **IMPORTANT INSTITUTIONAL NOTICE**: AgriSahay is an academic and usability prototype developed for research and placement demonstration purposes. It does NOT claim integration with live core banking systems (Finacle, BaNCS), live UIDAI Aadhaar verification servers, live PMFBY National Crop Insurance Portals, or live India Meteorological Department (IMD) telemetry. All transactions, scores, and synchronizations operate within an isolated decision-support paradigm.
