# AgriSahay – Agriculture Loan and Farmer Support System
*Academic Prototype for Demonstration Purposes Only. Not connected to a live banking system.*

This project was built for a placement interview with **Ujjivan Small Finance Bank (Agriculture Banking Department)**. It showcases practical rural credit underwriting, seasonal cash flow alignment, branch lifecycle management, and a dedicated **Farmer Resilience Banking** layer.

---

## 1. Quick Start & Execution

```bash
# Navigate to project folder
cd agri_bnk

# Install dependencies (if not already installed)
npm install

# Run automated test suite (RBAC, Resilience Score, Repayment dates, Data masking)
npm test

# Start development server
npm run dev
```

Open **`http://localhost:5173/`** in your browser.

---

## 2. Distinctive Innovation Center: Farmer Resilience Banking Layer

AgriSahay incorporates a dedicated **Demo Innovation Center** (`/innovation-center`) highlighting 10 capabilities designed for seasonal agriculture:

1. **Farmer Resilience Score:** A transparent, non-blackbox scoring model evaluated across 7 objective agricultural dimensions (irrigation access, crop diversity, rainfall exposure, repayment history, dairy/secondary income, soil health, and insurance protection). Includes plain-language recommendations to improve terms.
2. **Harvest-Linked Repayment Planner:** Replaces rigid monthly EMIs with dates customized to sowing duration, harvest windows, and local APMC mandi settlement clearing (+15 days buffer) to prevent distress sales.
3. **What-If Farm Shock Simulator:** Enables relationship officers to stress-test farm cash flows against five realistic shocks (severe drought, delayed monsoons, post-harvest mandi price crashes, pest infestations, and input cost spikes) to evaluate income erosion and debt service capacity.
4. **Climate-Safe Loan Safeguards:** Recommends structural safeguards based on climate vulnerability tiers, such as mandatory PMFBY insurance, contractual emergency repayment holidays, phased tranche disbursements, and micro-irrigation financing.
5. **Community Risk Heatmap:** Displays anonymized village-level aggregate trends for rainfall stress, pest incidents, irrigation dependency, and crop concentration across 6 rural villages while strictly shielding individual farmer PII.
6. **Farmer Consent & Portable Data Passport:** Discloses data collection scopes, records verifiable consent events in the audit trail, and generates a downloadable JSON Data Passport for the farmer.
7. **Voice-Based Field Notes:** Simulates field officers recording farm observations in regional languages (Kannada, Hindi, Tamil, Telugu), automatically converted into structured underwriting records.
8. **Promise-to-Pay and Assistance Tracker:** Captures repayment commitments from farmers facing temporary distress using dignified, supportive language with zero negative labeling.
9. **Explainable Loan Decision Panel:** Explicitly displays positive drivers, risk factors, missing data, and steps to improve eligibility, reinforcing that credit decisions require human Branch Manager authorization.
10. **Rural Impact Dashboard:** Tracks measurable operational outcomes, including turnaround time reduction from 18 to 4.2 days, 148 offline village visits completed, and 84.5% harvest-aligned repayment schedules.

---

## 3. Core Architecture & Modules

* **Executive Dashboard:** Branch KPIs, monthly inflow trends, upcoming harvest dues, and quick shortcuts.
* **Role-Based Access Control (RBAC):** Strict permissions separating Branch Manager (sanctioning authority), Agriculture Relationship Officer (field sourcing), and Operations Admin.
* **Farmer 360° Profile:** Comprehensive borrower records with masked Aadhaar (`XXXX-XXXX-1234`), landholdings, credit history, and the transparent Resilience Score card.
* **Loan Applications Pipeline:** End-to-end lifecycle (`Draft` $\rightarrow$ `Submitted` $\rightarrow$ `Under Review` $\rightarrow$ `Approved` $\rightarrow$ `Disbursed` $\rightarrow$ `Rejected`) with Scale of Finance validation and automatic harvest repayment schedule generation.
* **Field Officer Mode (ARO Workspace):** Offline-first mobile interface featuring an offline action queue and sync counter for zero-connectivity village visits.
* **Central Audit Trail:** Centralized logging capturing all user roles, actions, timestamps, and status transitions with one-click CSV export.
* **Multilingual Support (i18n):** Zero-dependency regional dictionary supporting English, Hindi, Kannada, Tamil, and Telugu.
* **MIS Reports & CSV Export:** Excel-compatible data export for loan portfolios, repayment schedules, and farmer directories.

---

## 4. Automated Testing

Run the automated test runner:
```bash
npm test
```

Verifies:
* RBAC permission boundaries and Four-Eye governance
* Farmer Resilience Score calculation and factor weighting
* Harvest-linked repayment schedule date calculations
* Aadhaar 8-digit privacy masking
* What-If farm stress simulation logic
* Climate safeguard assignment rules

---

## 5. Security & Academic Disclaimer

* **Prototype Clarification:** The prototype includes a centralized audit-log design. In production, logs should be stored in a secure server-side database with encryption, access controls, and tamper detection.
* **Remote Access Note:** The link `http://localhost:5173/` runs locally. For remote interview access, deploy via Vercel/Netlify or use a temporary tunnel (`npx localtunnel --port 5173`).
* **Disclaimer:** Academic prototype developed for placement demonstration purposes. Not connected to a live banking system.
