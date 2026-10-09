# AgriSahay Empirical Research Protocol

**Official Study Title:**  
*AgriSahay: An Explainable, Offline-First, Multilingual and Climate-Aware Agriculture Lending Platform for Inclusive Rural Credit Delivery*

**Academic / Placement Context:**  
Small Finance Bank Placement Project & Applied Rural Banking Research Prototype

---

## 1. Research Motivation & Problem Statement
Smallholder farmers in semi-arid and rainfed belts across India face compounding structural barriers to formal institutional credit:
1. **Opaque and Inflexible Credit Underwriting:** Traditional credit scoring relies on urban-centric bureau history and rigid monthly Equal Monthly Installment (EMI) schedules that disregard the seasonal gestation of agricultural cash flows.
2. **Connectivity Deserts:** Over 60% of rural farm visits occur in low-connectivity or zero-network shadow zones, resulting in paper-based duplicate origination and synchronization collisions.
3. **Linguistic Exclusion:** Banking interfaces are predominantly English or formal state-register vernaculars that use complex financial terminology inaccessible to marginal agriculturalists.
4. **Climate Exposure & Delayed Claim Settlements:** Increasing frequency of unseasonal rains and localized dry spells triggers crop failure, while paper-based loss intimation under PMFBY often exceeds the mandatory 72-hour window.

AgriSahay introduces an explainable, offline-first, multilingual, and climate-aware digital architecture designed to evaluate whether these barriers can be mitigated empirically.

---

## 2. Research Questions (RQ1 – RQ7)

| ID | Research Question | Primary Metric | Target Benchmark |
| :--- | :--- | :--- | :--- |
| **RQ1** | **Task Efficiency:** Does a guided, offline-first digital field workflow reduce end-to-end loan application origination time compared to traditional paper-and-branch procedures? | Elapsed task completion time (seconds) | $\ge 40\%$ reduction across 6 core tasks |
| **RQ2** | **Explainability & Transparency:** Does the Explainable Farmer Resilience Index improve credit officer confidence and borrower comprehension over opaque scorecards? | 5-point Likert comprehension score & override justification audit | Mean rating $\ge 4.2 / 5.0$ |
| **RQ3** | **Repayment Feasibility:** How does harvest-linked bullet/tranche repayment scheduling alter projected borrower default probability under simulated climate stress? | Cumulative monthly cash flow surplus & deficit frequency | Zero mid-season cash deficit months |
| **RQ4** | **Linguistic Accessibility:** Can native Indic scripts (10 languages) combined with Web Speech synthesis reduce borrower cognitive load and comprehension friction? | Reading & audio comprehension check score | $\ge 85\%$ accuracy on core financial terms |
| **RQ5** | **Offline Conflict Resolution:** Can deterministic 3-way reconciliation prevent data loss during multi-officer field data synchronization? | Conflict resolution success rate & zero unhandled collisions | $100\%$ atomic merge completion |
| **RQ6** | **Credit Protection Acceleration:** Does mobile-first PMFBY loss intimation with simulated GPS/photo verification reduce claim initiation latency within the 72-hour statutory deadline? | Intimation submission timestamp delta | $100\%$ intimated within $< 48$ hours |
| **RQ7** | **System Usability:** What is the standardized System Usability Scale (SUS) score of the platform across diverse user cohorts (officers, managers, farmers)? | Brooke (1986) 10-item composite SUS score | SUS $\ge 75$ (Grade A, "Good" to "Excellent") |

---

## 3. Participant Cohorts & Sampling Methodology

The protocol establishes four distinct user cohorts to evaluate multi-stakeholder usability:

1. **Cohort A: Field Relationship Officers ($N = 15$)**
   - Profile: Field staff operating mobile tablets/smartphones in rural taluks.
   - Evaluation Focus: Offline field visit logging, crop photo tagging, conflict resolution, stopwatch task completion.
2. **Cohort B: Branch Credit Managers ($N = 10$)**
   - Profile: Underwriters with discretionary sanction authority.
   - Evaluation Focus: Four-eye maker-checker review, resilience score explainability, factor weight audits, discretionary score overrides.
3. **Cohort C: Agricultural Borrowers / Farmers ($N = 20$)**
   - Profile: Smallholder and marginal cultivators (landholding $< 2.0$ ha) with varying digital literacy.
   - Evaluation Focus: Multilingual UI readability, Web Speech audio explanations, harvest cash flow curve clarity, DPDP consent comprehension.
4. **Cohort D: Operations & Audit Officers ($N = 5$)**
   - Profile: Compliance, internal audit, and risk controllers.
   - Evaluation Focus: Tamper-evident cryptographic audit chain verification, DPDP staff access logs, demographic fairness audits.

---

## 4. Standard Benchmark Tasks (Protocol T1 – T6)

| Task Code | Task Name | Operational Definition | Traditional Manual Baseline | AgriSahay Target |
| :--- | :--- | :--- | :--- | :--- |
| `T1_FARMER_REG` | Farmer Registration | Record demographics, plot size, irrigation, and Aadhaar consent | 1,200 sec (20 min) | $\le 600$ sec (10 min) |
| `T2_FIELD_VISIT` | Field Inspection | Conduct geotagged crop verification, pest notes, offline sync | 960 sec (16 min) | $\le 480$ sec (8 min) |
| `T3_LOAN_REVIEW` | Credit Underwriting | Inspect resilience factors, adjust credit limit, maker-checker sanction | 1,800 sec (30 min) | $\le 720$ sec (12 min) |
| `T4_HARVEST_PLAN` | Repayment Planning | Align installments with crop maturity date and APMC realization | 900 sec (15 min) | $\le 360$ sec (6 min) |
| `T5_CROP_LOSS` | PMFBY Claim Intimation | Log localized flood/drought event with mandatory metadata | 1,500 sec (25 min) | $\le 420$ sec (7 min) |
| `T6_LANG_SEARCH` | Multilingual Search | Switch language to native dialect, locate term and play audio explanation | 600 sec (10 min) | $\le 180$ sec (3 min) |

---

## 5. Ethical Considerations & Consent Protocol
1. **Voluntary Informed Consent:** Every participant must acknowledge an informed consent dialog before timer activation or survey submission.
2. **Data Minimization:** No real personally identifiable information (PII) or active bank account credentials are used. All Aadhaar numbers are masked (`XXXX-XXXX-1234`).
3. **Right to Withdraw:** Participants can withdraw from the study at any point without impacting their evaluation or role context.
4. **Differential Privacy / k-Anonymity:** Any cohort analysis with fewer than 5 respondents ($N < 5$) is automatically suppressed from aggregated reporting to prevent deductive re-identification.
