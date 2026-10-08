# AgriSahay – 10-Slide Presentation Deck Outline

> **Topic:** AgriSahay – Agriculture Loan and Farmer Support System  
> **Prepared For:** Ujjivan Small Finance Bank Placement Evaluation

---

### Slide 1: Title & Introduction
- **Headline:** AgriSahay: Climate-Smart Agriculture Loan & Farmer Support Platform
- **Sub-headline:** Tailored for Rural Banking & Seasonal Borrowers at Ujjivan Small Finance Bank
- **Presenter:** Candidate Name / Placement Student
- **Bullet points:**
  - Designed for seasonal agricultural cycles rather than rigid retail banking models
  - Transparent 7-factor underwriting, harvest-linked repayment schedules, and offline field mobility
  - Academic Prototype developed for evaluation

---

### Slide 2: The Ground Reality – Agriculture Banking Pain Points
- **Headline:** Why Conventional Banking Underwriting Fails in Rural India
- **Key Pain Points:**
  1. **Cash Flow Mismatch:** Monthly EMIs conflict with 4-to-6 month crop harvest cycles.
  2. **Climate Vulnerability:** Droughts, unseasonal rains, and pest attacks trigger unexpected defaults.
  3. **Connectivity Void:** Field officers in remote hamlets cannot access centralized online banking portals.
  4. **Opaque Credit Decisions:** Borrowers receive generic rejections without actionable pathways to creditworthiness.

---

### Slide 3: Solution Architecture & Governance
- **Headline:** AgriSahay Core Architecture & Four-Eye Principle
- **Diagram Summary:**
  - User Interface $\to$ RBAC Layer (Branch Manager, Relationship Officer, Operations Admin) $\to$ Domain Rule Engines $\to$ Client-Side Storage & Offline Queue
- **Governance Focus:**
  - Relationship Officers register farmers and record inspections; Branch Managers alone hold sanction authority.
  - Immutable regulatory audit trail with timestamped user attribution.

---

### Slide 4: Innovation 1 – The Transparent Farmer Resilience Score
- **Headline:** Underwriting That Promotes Agronomic Resilience Over Past Arrears
- **Key Metrics (0 to 100 Points):**
  - Irrigation Security (20 pts) & Soil Health (15 pts)
  - Crop Diversification (15 pts) & Allied Dairy Income (15 pts)
  - Repayment Track Record (15 pts), PMFBY Crop Insurance (10 pts), Rainfall Volatility (10 pts)
- **Outcome:** High-resilience borrowers receive interest rebates; vulnerable farmers receive climate safeguards instead of immediate rejections.

---

### Slide 5: Innovation 2 – Harvest-Linked Repayment Planning
- **Headline:** Aligning Repayments with Crop Maturity and Mandi Sales
- **Visual Comparison:**
  - *Standard Banking:* ₹14,000 monthly EMI starting at sowing (High default risk).
  - *AgriSahay:* Minimal interest-only service during vegetative stage; principal bullet payment upon harvest in Mandi season.
- **Benefit:** Drastically suppresses early Non-Performing Asset (NPA) formation.

---

### Slide 6: Innovation 3 – What-If Farm Simulator & Climate Safeguards
- **Headline:** Pre-Disbursal Climate Stress-Testing
- **Features:**
  - Real-time simulation of a 40% drought, pest blight, or 20% mandi price decline.
  - Automatic calculation of net income impact and debt service capacity.
  - Policy recommendations: Emergency moratoriums, restructured repayment schedules, and phased disbursements.

---

### Slide 7: Field Operations & Vernacular Offline Experience
- **Headline:** Empowering the Last-Mile Relationship Officer
- **Key Capabilities:**
  - **Field Officer Mode:** Mobile-first interface with large touch targets.
  - **Offline Sync:** Automatic queuing of registrations and inspections when visiting zero-connectivity villages.
  - **Multilingual Support:** Instant localization in English, Hindi, Kannada, Tamil, and Telugu.
  - **Smart Notes Assistant:** Deterministic keyword extraction from regional inspection notes.

---

### Slide 8: Privacy, Security, & DPDP Compliance
- **Headline:** Regulatory Compliance Built-in from Day One
- **Safeguards:**
  - 100% masked Aadhaar presentation (`XXXX-XXXX-1234`) across all pages, modals, and exports.
  - Village-Level Community Heatmaps aggregate climate stress without exposing individual borrower identities.
  - Dedicated Privacy Center with DPDP consent records and revocation mechanisms.

---

### Slide 9: Technical Rigor & Automated QA
- **Headline:** Production-Ready Engineering & Test Coverage
- **Highlights:**
  - React 18 + Vite SPA with code-splitting (`React.lazy` and `Suspense`) keeping vendor bundle under 290 kB.
  - 36 Automated Unit Tests passing across RBAC, Resilience Engine, Harvest Date Math, and Privacy.
  - Zero external API dependencies; resilient client datastore with versioning and auto-healing.

---

### Slide 10: Conclusion & Roadmap for Ujjivan SFB
- **Headline:** The Future of Rural Banking at Ujjivan
- **Summary:**
  - AgriSahay proves that digital agriculture banking can be equitable, resilient, and compliant.
- **Production Integration Roadmap:**
  - Microservices backend with Core Banking System (Finacle) integration.
  - AgriStack API for digital land record validation.
  - Automated satellite and weather index insurance triggers.
- **Q&A Session Invitation.**
