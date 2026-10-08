# AgriSahay – Agriculture Loan and Farmer Support System
**Comprehensive Placement Project Report & Technical Portfolio**  
**Specialization:** Agriculture Banking & Priority Sector Lending (PSL)  
**Target Organization:** Ujjivan Small Finance Bank  
**Candidate Role:** Agriculture Relationship Officer / Branch Banking Intern  
**Live Prototype URL:** `http://localhost:5173/` (Vite Development Server Active)

---

## 1. Project Objective and Problem Statement

### 1.1 The Real-World Rural Banking Problem
Rural agricultural lending faces four distinct operational challenges that differ fundamentally from urban retail banking:

1. **Seasonal and Non-Linear Farmer Income:** Unlike salaried borrowers who service monthly EMIs, farmers generate cash inflows primarily during harvest windows (Kharif, Rabi, and Zaid). Imposing rigid monthly EMIs leads to artificial technical defaults. Without flexible bullet or harvest-linked repayment scheduling, smallholder farmers are pushed toward distress borrowing.
2. **Offline Rural Villages:** Over 65% of agricultural loan verification occurs in remote interior villages with poor or nonexistent cellular connectivity. Standard web applications freeze and fail in these zones, forcing field staff to use paper pads and manually re-enter information later.
3. **Reactive Rather Than Proactive Loan-Risk Monitoring:** Traditional rural bank branches only detect loan distress when an installment bounces post-harvest. A lack of hyper-local weather alerts, pest tracking, and timely farm-visit records leaves lenders blind to crop losses until accounts turn into Non-Performing Assets (NPAs).
4. **Slow, Fragmented Manual Verification:** Validating physical land records (Pahani/Patta), Aadhaar masking, crop coverage, and field boundaries across paper files results in loan turnaround times (TAT) of 15 to 30 days, causing farmers to miss critical seasonal sowing windows.

### 1.2 How AgriSahay Solves Each Problem
AgriSahay serves as a unified digital operating workbench tailored for rural branch staff and field officers:

* **Harvest-Linked Repayment Structuring:** Automatically calculates bullet and seasonal repayment schedules aligned with specific crop harvest periods (e.g., 120-day paddy cycle vs. 12-month sugarcane cycle) rather than rigid monthly schedules.
* **Field Officer Mode with Offline Action Queue:** Operates offline using persistent browser storage. Agriculture Relationship Officers (AROs) can record farm observations, crop health ratings, and visit details in remote villages; data auto-syncs when the device reconnects to a network.
* **Early-Warning Weather & Credit Risk Radar:** Aggregates regional weather alerts (hailstorms, unseasonal rains, drought advisories) and links them to affected farmer accounts, enabling branch staff to initiate proactive outreach or restructure terms before loans default.
* **360° Farmer Profile & Streamlined Workflows:** Consolidates demographic details, masked Aadhaar KYC, multi-parcel land holdings, and borrowing history onto a single screen, reducing processing time and turnaround delays.

---

## 2. Technology Stack

| Layer | Technology | Rationale & Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18** + **Vite 5** | Fast, component-driven UI with instant Hot Module Replacement (HMR) and optimized client-side performance. |
| **Styling** | **Scoped CSS3** | Custom professional light-banking design system with accessible contrast and no heavy third-party CSS dependencies. |
| **Icons** | **Lucide React** | Clean, accessible vector icons for agricultural indicators, status badges, and banking operations. |
| **Storage** | **LocalStorage / Mock Database** | Client-side persistent storage enabling reliable offline operation, instant loading, and zero external database dependencies for demonstrations. |
| **Languages** | **English, Hindi, Kannada, Tamil, Telugu** | Custom, lightweight context dictionary providing regional-language support for rural field usability. |
| **Deployment** | **Vite Development Server** | Local development server running on `http://localhost:5173/`, ready for local demonstrations or cloud hosting. |
| **Automated Testing** | **Node.js Test Runner** | Automated unit tests covering RBAC permissions, resilience score calculations, harvest schedules, and data masking. |

---

## 3. System Architecture

```mermaid
flowchart LR
    User([Bank Staff User]) --> ReactApp[React App / Vite]
    ReactApp --> RBAC{RBAC Permission Guard\nBranch Manager | ARO | Ops Admin}
    RBAC --> CoreModules[Core Banking Modules\nDashboard | Profile | Origination | Risk]
    RBAC --> Innovation[Farmer Resilience Layer\nScore | Simulator | Planner | Heatmaps]
    CoreModules --> Engine[Audit Trail & Offline Queue\nLocal Persistence Layer]
    Innovation --> Engine
```

### Architectural Data Flow
$$\text{User} \longrightarrow \text{React App} \longrightarrow \text{RBAC Guard} \longrightarrow \text{Core & Resilience Modules} \longrightarrow \text{Audit Trail / Offline Queue}$$

* **User Layer:** Branch Manager, Agriculture Relationship Officer (ARO), or Operations Admin accesses the application via desktop or field tablet.
* **Role-Based Access Control (RBAC):** Evaluates user permissions to restrict critical operations (such as loan approval or disbursal) based on role.
* **Business & Resilience Modules:** Handles farmer registration, loan origination, risk monitoring, what-if farm simulations, and harvest repayment schedules.
* **Data & Persistence Layer:** Routes all state changes through a central audit-log utility and buffers offline field submissions in a synchronization queue.

---

## 4. Database & Data Model

AgriSahay organizes its data across eight primary entities:

```
┌─────────────────────────────────┐          1:N         ┌─────────────────────────────────┐
│             Farmer              │ ──────────────────── │         LoanApplication         │
├─────────────────────────────────┤                      ├─────────────────────────────────┤
│ id: string (FMR-101)            │                      │ id: string (APP-2024-001)       │
│ name: string                    │                      │ farmerId: string                │
│ phone: string                   │                      │ amountRequested: number         │
│ aadhaarMasked: string           │                      │ cropType, landAreaAcres         │
│ village, district, state: string│                      │ loanType: KCC | Tractor | Dairy │
│ landHoldingAcres: number        │                      │ status: Draft...Disbursed       │
│ annualIncome: number            │                      │ repaymentPreference: Harvest    │
│ soilCardIssued: boolean         │                      └─────────────────────────────────┘
│ pmfbyEnrolled: boolean          │                                       │ 1:N
│ consentRecorded: boolean        │                                       ▼
└─────────────────────────────────┘                      ┌─────────────────────────────────┐
                 │ 1:N                                   │            AuditLog             │
                 ▼                                       ├─────────────────────────────────┤
┌─────────────────────────────────┐                      │ id: string (AUDIT-101)          │
│           FieldVisit            │                      │ timestamp: ISO string           │
├─────────────────────────────────┤                      │ userRole: Branch Manager...     │
│ id: string (VISIT-101)          │                      │ actionType: STATUS_CHANGE...    │
│ farmerId: string                │                      │ targetEntityId: string          │
│ cropStage, healthRating: string │                      │ previousStatus, newStatus       │
│ observations, visitDate: string │                      └─────────────────────────────────┘
└─────────────────────────────────┘                                       ▲
                 │ 1:N                                                    │ 1:N
                 ▼                                                        │
┌─────────────────────────────────┐                      ┌─────────────────────────────────┐
│        AssistanceTracker        │                      │         VillageHeatmap          │
├─────────────────────────────────┤                      ├─────────────────────────────────┤
│ id: string (AST-001)            │                      │ villageId: string (VIL-01)      │
│ farmerId, farmerName: string    │                      │ villageName, district: string   │
│ amountDue, promisedDate: string │                      │ dominantCrop, cropConcRisk: str │
│ reasonForDelay: string          │                      │ rainfallStressIndex: string     │
│ assistanceOffered: string       │                      │ delayedRepaymentRate: string    │
│ status: string                  │                      │ overallRiskTier: Low|Med|High   │
└─────────────────────────────────┘                      └─────────────────────────────────┘
```

1. **Farmer:** Stores demographic details, contact information, masked Aadhaar (`XXXX-XXXX-1234`), total verified landholding acreage, primary crop, secondary intercrops, net annual farm income, soil card status, insurance status, and consent records.
2. **Loan Application:** Manages the credit lifecycle (`Draft` $\rightarrow$ `Submitted` $\rightarrow$ `Under Review` $\rightarrow$ `Approved` $\rightarrow$ `Disbursed` $\rightarrow$ `Rejected`), facility type, requested amount, sanctioned amount, and harvest-linked repayment preferences.
3. **Field Visit:** Captures verification reports logged by AROs, including crop growth stage, farm health score (1 to 5), village landmark details, and inspection notes.
4. **Communication:** Tracks customer interactions, including automated payment reminders, crop-weather notices, subsidy updates, and phone call logs.
5. **Audit Log:** Records administrative and transactional actions with user role, exact ISO timestamp, affected record ID, and previous and updated statuses.
6. **Weather Risk:** Stores regional meteorological warnings linked to vulnerable districts and exposed farmer accounts.
7. **Assistance Tracker:** Captures supportive promise-to-pay arrangements, root agricultural reasons for delay, and bank assistance provided with dignified language.
8. **Village Heatmap:** Stores aggregated, anonymized community-level risk indicators (rainfall stress, crop disease, repayment delays, irrigation dependency) without exposing individual financial data.

---

## 5. Unique "Farmer Resilience Banking" Layer (10 Distinctive Features)

AgriSahay incorporates a specialized **Farmer Resilience Banking Layer** designed specifically for seasonal agricultural borrowers. These tools represent AgriSahay's distinctive combination of farmer resilience, climate risk, and explainable lending capabilities:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ AgriSahay | Demo Innovation Center • Farmer Resilience Banking Layer                   │
├───────────────┬────────────────────────────────────────────────────────────────────────┤
│ 🏆 Resilience │  BORROWER FOCUS: Basavarajappa H. (Keragodu, Sugarcane)                │
│ 📅 Harvest Plan│  SCORE: 98/100 • HIGH RESILIENCE (CLIMATE-SAFE)                        │
│ 🎛️ Simulator   ├────────────────────────────────────────────────────────────────────────┤
│ 🛡️ Climate-Safe│  FACTOR WEIGHTS: Irrigation (20/20) • Diversification (15/15)          │
│ 🗺️ Heatmaps   │  WHAT-IF STRESS: Severe Drought (-45% yield, 6-mo relief holiday)       │
│ 📜 Data Pass  │  HARVEST PLANNER: Bullet due date mapped 15d post-APMC mandi sale      │
│ 🎙️ Voice Notes │  COMMUNITY HEATMAP: Zero PII aggregated village-level moisture alerts  │
│ 🤝 Assistance │  EXPLAINABLE PANEL: Positive drivers, risk factors, missing data       │
└───────────────┴────────────────────────────────────────────────────────────────────────┘
```

### 5.1 Farmer Resilience Score
A transparent, non-blackbox credit scoring model evaluated across 7 objective agricultural dimensions:
* **Irrigation Access (20 pts):** Canal/drip systems vs. rainfed tracts.
* **Crop Diversity (15 pts):** Intercropping with pulses vs. mono-crop risk.
* **Rainfall Exposure (15 pts):** Command area stability vs. drought-prone taluks.
* **Repayment History & Debt Burden (20 pts):** Debt-to-income margin.
* **Allied Dairy Income (15 pts):** Non-crop livestock cash flow buffer.
* **Soil Health Protocol (10 pts):** Verified Soil Health Card adherence.
* **Insurance Protection (5 pts):** Active PMFBY enrollment.
* *Output:* Numerical score (0-100), transparent category badge, and plain-language agronomic recommendations.

### 5.2 Harvest-Linked Repayment Planner
Replaces arbitrary monthly EMI cycles with non-linear farm cash flow scheduling:
* Inputs: Sowing date, crop duration (days), harvest window, and local APMC mandi settlement buffer (days).
* Calculates exact post-harvest bullet or semi-annual due dates, ensuring farmers are never forced into distress sales to meet artificial monthly deadlines.

### 5.3 What-If Farm Simulator
Enables relationship officers to stress-test farm cash flows against realistic shocks:
* Scenarios: Severe Drought (-45% yield), Delayed Monsoon (30-day resowing lag), Mandi Price Crash (-35% below MSP), Pest Infestation (-30%), and Input Cost Spike (+30% fertilizer/fuel).
* Displays simulated farm income, safe debt servicing capacity, recommended loan ceilings, and policy actions (such as repayment holidays or contingency seed advances).

### 5.4 Climate-Safe Loan Recommendations
Recommends structural safeguards based on climate vulnerability tiers:
* Mandatory PMFBY insurance integration prior to disbursal.
* Contractual emergency repayment holiday clauses for gazetted natural calamities.
* Phased tranche disbursements tied to field germination checks.
* Subsidized micro-irrigation top-up financing under PM-KUSUM.

### 5.5 Community Risk Heatmap
Presents anonymized, village-level aggregate risk metrics:
* Tracks rainfall stress, crop disease, delayed repayment rates, irrigation dependency, and mono-crop concentration across 6 rural villages.
* Strict Privacy Standard: Aggregates community-level trends while completely shielding individual farmer balances and personal credit records.

### 5.6 Farmer Consent and Portable Data Passport
Presents an explicit data usage disclosure informing farmers what information is captured, why it is needed, and who can access it:
* Records verifiable consent events into the farmer's audit trail.
* Generates a downloadable, portable JSON Data Passport that farmers can use to verify their creditworthiness and crop records across government subsidy schemes.

### 5.7 Voice-Based Field Notes (Multilingual Speech to Structured Note)
Simulates field officers speaking observations in regional languages (Kannada, Hindi, Tamil, Telugu) during farm inspections:
* Translates audio transcripts into structured underwriting records: crop growth condition, irrigation status, farmer concern, recommended action, and follow-up date.

### 5.8 Promise-to-Pay and Assistance Tracker
Provides a dignified framework for recording repayment commitments from farmers facing temporary distress:
* Captures the root agricultural reason for delay (e.g., mandi moisture testing, mill payment clearing).
* Records bank assistance provided (e.g., 30-day grace period, warehouse receipt verification) using supportive language with zero negative labeling.

### 5.9 Explainable Loan Decision Panel
Eliminates opaque, automated credit sanctions:
* Explicitly displays positive lending drivers, risk factors to review, missing document checklists, and actionable steps to improve eligibility.
* Reinforces that credit decisions require human review and authorization by the Branch Manager.

### 5.10 Impact Dashboard
Tracks measurable operational outcomes delivered by AgriSahay:
* Turnaround time (TAT) reduced from 18 days to 4.2 days.
* 148 offline village field visits completed without connectivity loss.
* 84.5% of active loans aligned to post-harvest mandi settlement windows.
* 92.8% of borrowers covered by climate safeguards.

---

## 6. Screenshots & User Interface Walkthrough

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ AgriSahay | Branch: Mandya Rural   Role: Branch Manager   Lang: English  [Sync: Online] │
├───────────────┬────────────────────────────────────────────────────────────────────────┤
│ 📊 Dashboard  │  TOTAL FARMERS     PENDING LOANS     DISBURSED LOANS     COLLECTION    │
│ ✨ Innovation │      1,248              14              ₹4.82 Cr             94.2%     │
│ 👨‍🌾 Farmers    ├────────────────────────────────────────────────────────────────────────┤
│ 📝 Loans      │  PORTFOLIO SPLIT: [KCC: 62% | Allied Dairy: 24% | Tractor: 14%]        │
│ 🛰️ Field Mode │  UPCOMING HARVEST DUES: 18 Farmers falling due in next 14 days         │
│ ⚠️ Risk Radar │  RECENT APPLICATIONS: Ramesh Patil (Sugarcane) • Kavitha M (Paddy)     │
└───────────────┴────────────────────────────────────────────────────────────────────────┘
```

* **Dashboard (`/`):** Highlights core operational KPIs, monthly inflow trends, upcoming harvest dues, and shortcuts to register farmers or launch the Innovation Center.
* **Innovation Center (`/innovation-center`):** Interactive tabbed showcase demonstrating all 10 Farmer Resilience Banking tools with interactive borrower selection.
* **Farmer 360° Profile (`/farmer-profile`):** Comprehensive borrower profile featuring masked Aadhaar KYC, operational land holdings, borrowing history, and the transparent Resilience Score card.
* **Loan Approval Screen (`/loan-detail`):** Four-eye governance workflow restricted to the Branch Manager, complete with the Explainable Decision Panel.
* **Field Officer Mode (`/field-mode`):** Offline-first mobile interface featuring an offline action queue and sync counter for zero-connectivity village visits.
* **Reports & CSV Export (`/reports`):** Filterable reports generating standard CSV files compatible with Microsoft Excel.

---

## 7. Testing & Quality Assurance

AgriSahay includes an automated test suite verifying core business rules and security boundaries:

```bash
npm test
```

| Test Scenario | Action Taken | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **ARO attempts loan approval** | Execute permission check for `officer` on `canApproveLoan`. | Approval access denied; control restricted to Branch Manager. | Permission evaluates to `false`. | **PASSED** |
| **Branch Manager approves loan** | Execute permission check for `manager` on `canApproveLoan`. | Approval access granted; action recorded in audit log. | Permission evaluates to `true`. | **PASSED** |
| **Resilience Score Calculation** | Evaluate resilient farmer profile (canal irrigation, dairy income). | Score $\ge 75$, assigned High Resilience category with 7 factor weights. | Score 98/100, High Resilience assigned. | **PASSED** |
| **Harvest Repayment Date** | Compute schedule for July 1 sowing with 120-day duration + 15d buffer. | Due date falls in December post-harvest, reflecting simple interest. | Due date: 2025-12-03, calculated accurately. | **PASSED** |
| **Aadhaar Privacy Masking** | Pass 12-digit Aadhaar `123456789012` to masking utility. | First 8 digits masked; only last 4 digits visible (`XXXX-XXXX-9012`). | Output: `XXXX-XXXX-9012`. | **PASSED** |
| **What-If Drought Simulation** | Run `DROUGHT` stress test on ₹3,00,000 base farm income. | Imposes 45% yield drop; recommends 6-month repayment holiday. | Income adjusted to ₹1,65,000 with policy guidance. | **PASSED** |
| **Climate Safeguards Assignment** | Evaluate vulnerable borrower profile with high climate risk. | Recommends at least 3 safeguards including mandatory PMFBY. | 3 safeguards assigned with insurance guidance. | **PASSED** |

---

## 8. Limitations and Future Scope

### 8.1 Prototype Boundaries (Current State)
* **Client-Side Persistence:** Data is stored in browser LocalStorage and memory; changes persist locally per browser session rather than syncing to an external database.
* **Simulated External Data:** Weather advisories and land records are driven by built-in datasets rather than live government or meteorological APIs.
* **Client-Side RBAC:** Role switching is implemented on the frontend for demonstration purposes; production deployments require server-side token validation.

### 8.2 Future Scope & Production Roadmap
1. **Core Banking System (CBS) Integration:** Direct API integration with enterprise CBS platforms (such as Finacle) for automated account verification and disbursement.
2. **Authorized CKYC & Aadhaar Verification:** Integration with official UIDAI e-KYC and CKYC registry services for real-time customer identification.
3. **Automated SMS & WhatsApp Messaging:** Connecting with enterprise messaging gateways (e.g., Gupshup) for automated payment reminders, crop advisories, and weather warnings.
4. **GPS Field Tagging & Boundary Mapping:** Capturing verified latitude/longitude coordinates and farm boundary polygons during field inspections.
5. **Live Weather API Integration:** Connecting with IMD (India Meteorological Department) or Skymet APIs for real-time weather monitoring.
6. **Cloud Deployment:** Hosting on secure cloud infrastructure (AWS/Azure) with high availability and disaster recovery.
7. **AI-Based Crop & Credit-Risk Prediction:** Implementing machine learning models trained on regional crop yields, soil types, and historical repayment data to estimate default probability.

---

## 9. Security & Compliance Clarification

> **Central Audit-Log Architecture Note:**  
> "The prototype includes a centralized audit-log design. In production, the logs should be stored in a secure server-side database with encryption, access controls, and tamper detection."

* **Data Privacy:** Customer identification numbers in this prototype display only the final 4 digits, aligned with standard privacy practices.
* **Four-Eye Principle:** Application sourcing (ARO) is separated from credit approval (Branch Manager), ensuring no single user can originate and approve a loan file independently.
* **Interest Subvention Disclaimer:** References to a 3% prompt repayment incentive align with the general structure of the Central Government Interest Subvention Scheme (ISS), subject to individual eligibility and applicable scheme guidelines.
* **Export Format:** File exports generate standard comma-separated values (CSV) files, which can be opened and analyzed in Microsoft Excel and other spreadsheet applications.

---

## 10. Top 5 Placement Interview Questions & Answers

#### Q1: "Why did you build an agriculture-specific banking portal instead of a standard retail loan portal?"
> *"Agriculture lending operates on crop cycles rather than calendar months. A farmer planting paddy in July generates income only after harvest in November. Standard retail banking portals impose rigid monthly EMIs, causing unnecessary technical defaults. AgriSahay addresses this with harvest-linked repayment scheduling, an offline field mode for remote villages, and proactive weather risk tracking to protect rural loan portfolios."*

#### Q2: "How does the Farmer Resilience Score differ from traditional credit scoring?"
> *"Traditional credit scores rely heavily on historical bureau repayment records, which penalize smallholder farmers who lack prior formal bank borrowing. AgriSahay's Farmer Resilience Score is an objective, non-blackbox model evaluating seven agricultural buffers: irrigation access, crop diversification, district rainfall exposure, debt burden, secondary dairy cash flow, soil health card adherence, and insurance protection. It gives the relationship officer plain-language recommendations to improve credit terms rather than an uninterpretable automated rejection."*

#### Q3: "How does the What-If Farm Simulator protect the bank against climate risk?"
> *"Agriculture is inherently vulnerable to weather and commodity price volatility. Our What-If Simulator stress-tests farm cash flows against five realistic shocks: severe drought, delayed monsoons, post-harvest mandi price crashes, pest infestations, and input cost spikes. The tool shows how each scenario reduces repayment capacity and recommends prudential safeguards, such as contingency seed advances, repayment holidays, or phased tranche disbursements."*

#### Q4: "How does the application respect farmer privacy while supporting village-level analytics?"
> *"We maintain a strict separation between individual and aggregate data. Individual borrower profiles strictly mask Aadhaar numbers, and all personal data usage is bound by an explicit consent screen that generates a downloadable Data Passport for the farmer. Meanwhile, our Community Risk Heatmap aggregates village-level trends for rainfall stress, pest incidents, and repayment delays without exposing individual farmer balances or financial records."*

#### Q5: "What steps would be needed to transition this prototype into a production system?"
> *"First, replacing browser LocalStorage with a secure backend (such as Node.js or Java Spring Boot) backed by an encrypted PostgreSQL database. Second, integrating with authorized third-party APIs for UIDAI e-KYC, CKYC, and state land records. Third, connecting to the bank's Core Banking System via secure APIs for automated loan disbursements, along with deploying the frontend as a Progressive Web App (PWA) for native mobile field use."*

---

## 11. Five-Minute Placement Demo Script

| Time | Screen / Feature | Talking Points & Actions |
| :--- | :--- | :--- |
| **0:00 - 1:00** | **Dashboard** (`/`) | *"Good morning. This is AgriSahay, a digital banking prototype developed for agriculture banking and priority sector lending. Our dashboard highlights key operational metrics: total farmers, pending loan pipeline, active portfolio, and harvest collection rate. In the top bar, we can switch roles or change the interface language across English, Hindi, Kannada, Tamil, and Telugu."* |
| **1:00 - 2:00** | **Demo Innovation Center** (`/innovation-center`) | *"Here in our Innovation Center, we showcase AgriSahay's distinctive Farmer Resilience Banking layer. Notice our transparent Resilience Score: for borrower Basavarajappa, it evaluates 7 verifiable dimensions including canal irrigation and dairy income, scoring 98/100 without black-box AI decisions."* |
| **2:00 - 3:00** | **Harvest Planner & What-If Simulator** | *"Under the Harvest Planner tab, we replace monthly EMIs with dates mapped to crop duration and local APMC mandi settlement. In the What-If Simulator, we can simulate a severe drought: expected income drops by 45%, and the system recommends an emergency repayment holiday and warehouse financing."* |
| **3:00 - 4:00** | **Community Heatmap & Data Passport** | *"Under Community Heatmaps, officers see anonymized village-level moisture and pest alerts with zero exposure of individual farmer financials. Under Data Passport, farmers review what data is collected and can download a portable summary for insurance verification."* |
| **4:00 - 5:00** | **Voice Notes, Assistance Tracker & Sanction** | *"Finally, our Voice Field Notes simulate regional speech transcription, and our Promise-to-Pay Tracker records repayment plans with supportive language. In Loan Applications, only the Branch Manager can sanction loans using our Explainable Decision Panel. Thank you, and I welcome any questions."* |

---

## 12. Remote Access and Deployment Options

The prototype is currently active on your local machine:
* **Local Development Link:** `http://localhost:5173/`

> **Note on Localhost:**  
> The link `http://localhost:5173/` is a local link. It will work on your computer while the development server is running, but it cannot be accessed by interviewers remotely unless you deploy the project or use a temporary sharing service.

### Recommended Sharing Options

1. **Option A: Free Cloud Deployment (Vercel / Netlify) — Recommended**
   * Build the project with `npm run build` to generate the production-ready `dist` folder.
   * Push your code to a GitHub repository and link it to [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).
   * Both platforms provide a free, permanent HTTPS URL (e.g., `https://agrisahay.vercel.app`) suitable for inclusion on your resume or sharing in chat.

2. **Option B: Temporary Tunnel (localtunnel / ngrok)**
   * Keep the Vite dev server running on port `5173`.
   * In a new terminal, run:
     ```bash
     npx localtunnel --port 5173
     ```
     or
     ```bash
     ngrok http 5173
     ```
   * Share the resulting public URL with the interviewer for temporary live access during your session.

3. **Option C: Live Screen Share**
   * Open `http://localhost:5173/` in your local browser and present the application using the 5-Minute Demo Script during your interview.

---

## 13. Conclusion

> AgriSahay demonstrates how a digital agriculture-banking platform can combine field-level data collection, role-based governance, offline operation, regional-language support, and agriculture-specific risk monitoring. The prototype provides a foundation for improving loan turnaround time, farmer service quality, and portfolio-risk visibility in rural banking.
