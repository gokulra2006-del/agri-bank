# AgriSahay Relational Database Schema Specification

## 1. Relational Design Summary

The AgriSahay backend database consists of 15 relational entities designed for **PostgreSQL 14+**. The schema enforces strict entity relationships, check constraints, foreign keys, and indexes for fast queries and tamper-evident auditing.

```
                    +-----------------------+
                    |        users          |
                    +-----------+-----------+
                                |
             +------------------+------------------+
             |                                     |
             v                                     v
+-----------------------+              +-----------------------+
|        farmers        |<-------------|         loans         |
+-----------+-----------+              +-----------+-----------+
            |                                      |
            |                                      |
            +----------------+                     +----------------+
            |                |                     |                |
            v                v                     v                v
+-----------------------+  +------------------+  +-------------+  +-------------------------+
|    consent_records    |  | field_visits     |  | repayments  |  | credit_protection_cases |
+-----------------------+  +------------------+  +-------------+  +-------------------------+
```

---

## 2. Table Catalog

| Table Name | Description | Key Security Constraints |
| :--- | :--- | :--- |
| `users` | Bank staff & system user accounts | `role` enum, `password_hash` (bcrypt), `is_active` |
| `farmers` | Farmer profiles & agronomic parameters | `phone` check regex, `land_size_acres > 0`, `aadhaar_masked` |
| `loans` | Agricultural credit applications | `applied_amount >= 5000`, `repayment_model` enum, `status` enum |
| `repayments` | Repayment ledger & receipts | `amount > 0`, `mode` check, `receipt_hash` |
| `field_visits` | GPS and agronomic crop inspection logs | `health_rating` enum, `crop_stage` text |
| `credit_protection_cases` | PMFBY claim intimation & surveyor audits | `statutory_window_hours <= 72`, `loss_percentage <= 100` |
| `consent_records` | DPDP Act 2023 digital consent logs | `status` check, purpose flags, withdrawal timestamp |
| `data_access_logs` | Access ledger for farmer data queries | Captures `user_id`, `farmer_id`, `purpose`, `timestamp` |
| `data_correction_requests` | Farmer requests to rectify records | `status` check (`PENDING`, `APPROVED`, `REJECTED`) |
| `offline_sync_events` | Queue of offline device synchronization | `idempotency_key UNIQUE`, `status` check |
| `notifications` | Multichannel alerts & follow-ups | 9 category enums, regional language template codes |
| `audit_events` | Cryptographic forward hash-chained log | `prev_hash` & `hash` checksums, `sequence_num` |
| `pilot_study_participants` | Usability research cohort records | Anonymized `P001` format, digital literacy enum |
| `pilot_study_tasks` | Task duration stopwatch records | `duration_seconds >= 0`, `status` check |
| `pilot_study_surveys` | Brooke (1986) 10-item SUS responses | 10 Likert scores (1 to 5), calculated `sus_score` |

---

## 3. Cryptographic Audit Chain Mechanics

Every record inserted into `audit_events` links to its preceding entry:

$$\text{hash}_n = \text{Hash}\left(\text{hash}_{n-1} \parallel \text{id} \parallel \text{action} \parallel \text{user\_role} \parallel \text{created\_at} \parallel \text{entity\_id} \parallel \text{entity\_type} \parallel \text{notes}\right)$$

Where:
- $\text{hash}_0 = \text{"0000000000000000"}$ (Genesis Hash)
- An alteration of any character in an existing record alters its computed hash, immediately breaking all subsequent hash chain links upon running `verifyServerAuditChain()`.

---

## 4. DPDP Act 2023 Schema Compliance Features

1. **Strict Aadhaar Masking**: The `farmers` table stores only `aadhaar_masked VARCHAR(20)`. No raw 12-digit Aadhaar numbers are persisted or cached.
2. **Purpose-Bound Consent**: The `consent_records` table specifies granular boolean purposes (`purpose_credit_assessment`, `purpose_satellite_monitoring`, `purpose_scheme_sharing`).
3. **Data Access Transparency**: Every read query directed to `/api/farmers` automatically logs a record in `data_access_logs`.
