# AgriSahay – Architecture & Technical Design Specification

> **Academic Prototype Notice:** This document describes the system architecture for **AgriSahay – Agriculture Loan and Farmer Support System**, an academic prototype developed for the Ujjivan Small Finance Bank placement project (Agriculture Banking Department). It is designed for demonstration and evaluation purposes only and is not connected to a live banking core or production customer database.

---

## 1. High-Level Architecture Overview

AgriSahay is architected as an offline-first, client-rendered Single Page Application (SPA) leveraging modern React 18 and Vite. It mirrors enterprise core-banking workflows through deterministic rule engines, role-based governance, and a transactional client-side mock datastore.

```
+-----------------------------------------------------------------------------------------+
|                                    User Interface Tier                                   |
|  [Responsive Topbar & Sidebar]  [Role Switcher]  [5-Language Selector]  [Branch Filter] |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                               Governance & Security (RBAC)                              |
|  • BM (Branch Manager): Full Approval, Disbursal, Overrides, Audit Viewer               |
|  • RO (Relationship Officer): Field Visits, Sowing Inputs, Applications, Offline Sync   |
|  • OA (Operations Admin): Document Verification, Data Exports, Audit Monitoring         |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                                      Domain Engines                                     |
|  +------------------------+  +------------------------+  +----------------------------+ |
|  | Resilience Engine      |  | Repayment Planner      |  | Smart Notes Assistant      | |
|  | • 7 Agricultural Pts   |  | • Harvest bullet loans |  | • Multilingual keywords    | |
|  | • 0-100 Scoring Scale  |  | • Monsoon moratorium   |  | • Rule-based extraction    | |
|  +------------------------+  +------------------------+  +----------------------------+ |
|  +------------------------+  +------------------------+  +----------------------------+ |
|  | What-If Farm Simulator |  | Village Heatmap Engine |  | Aadhaar Privacy Masker     | |
|  | • Drought/Pest Scenarios| | • Anonymized aggregates|  | • XXXX-XXXX-1234 format    | |
|  +------------------------+  +------------------------+  +----------------------------+ |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                           Persistence & Offline Transaction Layer                       |
|  • MockStore (Schema v4.0 with Auto-Healing & Migration Check)                          |
|  • Indexed Keys: 17 Domains (Farmers, Loans, Field Visits, Audits, Assistance, etc.)   |
|  • Offline Queue: IndexedDB / LocalStorage queue with sync timestamps                   |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Role-Based Access Control (RBAC) & Governance Matrix

AgriSahay implements the **Four-Eye Principle** mandated by standard banking compliance: the maker (Relationship Officer) cannot approve or disburse their own loan applications. Only the Branch Manager retains credit sanction authority.

| View / Function | Branch Manager (`bm`) | Relationship Officer (`ro`) | Operations Admin (`oa`) | Policy / Enforcement Rationale |
| :--- | :---: | :---: | :---: | :--- |
| **Executive Dashboard** | Read / Filter | Read / Filter | Read / Filter | Unified portfolio view filtered by branch |
| **Farmer Directory & Registration** | Read / Edit | Read / Create / Edit | Read Only | Field officers register farmers; Ops verifies |
| **Farmer Profile & Resilience Card** | Read / Re-score | Read / Re-score | Read Only | Transparent 7-factor agricultural resilience score |
| **Loan Applications** | Full (Approve/Reject) | Create / Submit | Read / Review Docs | **Four-Eye:** RO cannot approve loans |
| **Loan Sanction / Disbursal** | **Authorized** | **Denied** | **Denied** | Maker-checker separation of duty |
| **Field Officer Mode (Offline Sync)**| Read | **Full Access** | Read Only | Mobile-optimized for village visits |
| **Harvest Repayment Planner** | Read / Plan | Read / Plan | Read Only | Generates harvest-aligned bullet repayment |
| **What-If Farm Simulator** | Read / Simulate | Read / Simulate | Read / Simulate | Stress-tests yield drops and price volatility |
| **Audit Log Trail** | **Authorized** | **Denied** | **Authorized** | Immutable regulatory audit tracking |
| **Reports & Compliance Export** | Read / CSV Export | Read Only | Read / CSV Export | Exports with guaranteed Aadhaar masking |
| **Data Reset / Emergency Recovery** | **Authorized** | **Denied** | **Denied** | Safe sandbox reset button with confirmation |

---

## 3. Storage Schema & Storage Keys (v4.0)

All application state is maintained in `localStorage` through `src/data/mockStore.js`. Schema versioning auto-migrates and heals corrupt state.

| Storage Key | Data Structure | Description |
| :--- | :--- | :--- |
| `agrisahay_version` | `String` (`"4.0"`) | Schema migration tag; triggers cache purge when updated |
| `agrisahay_farmers` | `Array<FarmerObject>` | 32 pre-populated Indian farmers across 4 branches |
| `agrisahay_loans` | `Array<LoanObject>` | 44 loan accounts across 6 lifecycle statuses |
| `agrisahay_repayments` | `Array<RepaymentObject>` | Repayment schedules and collections |
| `agrisahay_documents` | `Array<DocObject>` | Document metadata (Land records, KYC, Chitta) |
| `agrisahay_field_visits` | `Array<VisitObject>` | Field verifications, GPS coordinates, crop photos |
| `agrisahay_communications` | `Array<CommObject>` | SMS and WhatsApp notices (advisories, reminders) |
| `agrisahay_audit_log` | `Array<AuditObject>` | Immutable audit records (`action`, `actor`, `timestamp`) |
| `agrisahay_weather_alerts` | `Array<AlertObject>` | Simulated meteorological warnings by district |
| `agrisahay_notifications` | `Array<NotificationObject>`| In-app alerts for pending approvals and stress alerts |
| `agrisahay_current_role` | `String` (`"bm" \| "ro" \| "oa"`) | Active user persona |
| `agrisahay_current_branch` | `String` (`"all" \| branchId`) | Active operational branch filter |
| `agrisahay_language` | `String` (`en \| hi \| kn \| ta \| te`)| Active localized language dictionary |
| `agrisahay_offline_queue` | `Array<QueueItem>` | Unsynced transactions queued when offline |
| `agrisahay_assistance_tracker`| `Array<AssistancePlan>` | Restructuring and crop insurance relief plans |
| `agrisahay_farmer_consents` | `Array<ConsentRecord>` | DPDP Act compliant consent revocations |
| `agrisahay_village_heatmaps` | `Array<HeatmapDistrict>` | Anonymized village-level climate and stress aggregates |

---

## 4. Resilience Engine & Scoring Mathematics

The Farmer Resilience Score replaces opaque credit-scoring algorithms with transparent, agronomist-aligned criteria:

$$\text{Score} = \sum_{i=1}^{7} W_i \cdot S_i \in [0, 100]$$

1. **Irrigation Security (20 pts):** Perennial Borewell/Canal = 20, Seasonal Canal = 14, Tank = 10, Pure Rainfed = 4.
2. **Crop Diversity (15 pts):** $\ge 3$ crops / Multi-cropping = 15, 2 crops = 10, Monoculture = 4.
3. **Secondary Allied Income (15 pts):** Active Dairy / Poultry = 15, Seasonal allied = 9, Farm only = 3.
4. **Repayment Track Record (15 pts):** Flawless 100% on-time = 15, Minor delay ($<30$ days) = 10, Default history = 3.
5. **Soil Health Assessment (15 pts):** Tested with high organic carbon = 15, Medium = 10, Untested/Degraded = 4.
6. **Insurance Protection (10 pts):** Active PMFBY enrollment = 10, Partial = 6, Uninsured = 0.
7. **Rainfall Volatility Exposure (10 pts):** Normal monsoon = 10, Moderate deficit = 6, Severe drought = 2.

**Risk Classification Tiers:**
- **High Resilience ($\ge 75$):** Eligible for preferential 0.50% interest rebate and single-tranche disbursals.
- **Moderate Resilience ($55 - 74$):** Standard agricultural credit terms with seasonal review.
- **Vulnerable ($< 55$):** Mandatory climate safeguards (PMFBY integration, 3-tranche disbursal, and repayment holiday contingency).

---

## 5. Security & DPDP Act Compliance

- **Aadhaar Masking:** Strictly formatted as `XXXX-XXXX-1234` across tables, profiles, exports, and reports.
- **Village-Level Anonymization:** Heatmap aggregates never render names, loan amounts, or individual phone numbers.
- **Client-Side Data Isolation:** Zero network transmission of borrower financial or biometric data.
