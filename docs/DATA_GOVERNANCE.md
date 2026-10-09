# AgriSahay Data Governance & Regulatory Compliance Architecture

---

## 1. Compliance Mandate: Digital Personal Data Protection (DPDP) Act, 2023
AgriSahay treats agricultural borrowers as **Data Principals** and the Small Finance Bank as a **Data Fiduciary**. The platform enforces statutory privacy protections:

1. **Clear Purpose Specification:** Data collected during onboarding (Aadhaar, land RTC, crop photos) is strictly bound to agricultural credit appraisal and crop insurance claims.
2. **Explicit Informed Consent:** Farmer consent is collected per purpose with granular toggles (Credit Appraisal, Insurance Underwriting, Weather Advisory). Consent can be reviewed or revoked in the Farmer Consent Center.
3. **Data Principal Rights:** Farmers can request data corrections, download portable copies of their farm records, or review access logs.
4. **Staff Access Accounting:** Every view of a farmer profile or sensitive document by bank staff is recorded in an immutable staff access log with officer ID, timestamp, and business purpose.

---

## 2. PII Protection & Aadhaar Masking Standards
Under RBI and UIDAI directives:
- Full 12-digit Aadhaar numbers must never be displayed or stored in plaintext.
- **Masking Format:** Always formatted as `XXXX-XXXX-1234` (only the final 4 digits visible).
- **Export Sanitization:** All CSV and document print exports enforce identical masking rules.

---

## 3. Cryptographic Hash-Chained Audit Trail

### 3.1 Prototype Design Notice
> **Important Prototype Scope Notice:**  
> This feature demonstrates a tamper-evident audit trail design using forward hash chaining in local prototype memory. A production banking deployment requires server-side append-only storage, digital signature infrastructure (PKI/HSM), role-based physical access controls, and independent compliance audit infrastructure.

### 3.2 Hash Chaining Mechanism
Each audit log entry $E_i$ incorporates the cryptographic hash of the preceding entry $H(E_{i-1})$:

$$H(E_i) = \text{Hash}\Big(H(E_{i-1}) \mathbin{\Vert} \text{ID}_i \mathbin{\Vert} \text{Action}_i \mathbin{\Vert} \text{Role}_i \mathbin{\Vert} \text{Timestamp}_i \mathbin{\Vert} \text{Entity}_i \mathbin{\Vert} \text{OldStatus}_i \mathbin{\Vert} \text{NewStatus}_i \mathbin{\Vert} \text{Notes}_i\Big)$$

For the first entry in the chain, $H(E_0) = \text{GENESIS\_HASH} = \text{"0000000000000000"}$.

```mermaid
flowchart LR
    G["Genesis Hash (0000000000000000)"] --> E1["Entry #1: Farmer Registered"]
    E1 -->|Hash 1| E2["Entry #2: Field Visit Logged"]
    E2 -->|Hash 2| E3["Entry #3: Loan Approved"]
    E3 -->|Hash 3| E4["Entry #4: Repayment Logged"]
```

### 3.3 Verification & Tamper Detection
The Audit Log interface provides a **"Verify Audit Chain Integrity"** button. The integrity algorithm walks the chain in chronological order:
1. Verifies that `entry.prevHash` matches the preceding entry's hash.
2. Re-computes the entry's content hash and verifies bit-for-bit equality.
3. If an unauthorized modification occurs, the engine instantly detects the broken link, flags the exact entry ID, and alerts the compliance officer.

---

## 4. Regulatory Record Retention Schedule

Under Reserve Bank of India (RBI) Master Directions and Banking Regulation Act, 1949:

| Record Category | Retention Period | Storage Protocol | Post-Retention Action |
| :--- | :--- | :--- | :--- |
| **Active Loan Records & Title Deeds** | 8 Years after full account closure | High-durability encrypted store | Secure archival / cryptographic erasure |
| **Rejected / Withdrawn Applications** | 3 Years from rejection date | Restricted compliance archive | De-identification / deletion |
| **Audit Log Trail** | 10 Years minimum | Tamper-evident append-only store | Permanent compliance backup |
| **DPDP Consent Revocation Notices** | 5 Years from date of revocation | Compliance audit ledger | Retained for regulatory dispute resolution |
| **PMFBY Crop Loss Intimations** | 5 Years from claim settlement date | Credit protection archive | Archived with state insurance portal logs |
