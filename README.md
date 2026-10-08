# AgriSahay – Agriculture Loan and Farmer Support System

> **Academic Prototype Notice:** This project was developed as a placement showcase for **Ujjivan Small Finance Bank (Agriculture Banking Department)**. It is an academic demonstration prototype and is **not connected to a live banking system or real customer database**. All data displayed is simulated demo data.

---

## 🌾 Project Overview

Traditional retail banking products impose rigid monthly EMIs and conventional credit scoring onto seasonal agricultural borrowers. When monsoons delay, floods strike, or mandi commodity prices fluctuate, farmers face technical defaults despite fundamentally viable crops.

**AgriSahay** bridges this systemic gap. Built from the ground up for rural agriculture credit operations, it introduces:
- **Transparent 7-Factor Farmer Resilience Scoring** (replacing black-box credit models)
- **Harvest-Linked Repayment Planning** (matching repayment schedules to crop maturity and mandi sales)
- **Four-Eye Maker-Checker Governance** (strict role-based separation between field sourcing and loan sanctioning)
- **Offline-First Field Mobility** with regional language localization (English, Hindi, Kannada, Tamil, Telugu)
- **DPDP Act Compliance & Data Privacy** (strict Aadhaar masking and anonymized village heatmaps)

---

## 🚀 Quick Start & Local Execution

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Installation & Run
```bash
# Clone the repository
git clone https://github.com/gokulra2006-del/agri-bank.git
cd agri-bank

# Install project dependencies
npm install

# Run automated unit test suite (36 assertions)
npm test

# Launch Vite development server
npm run dev
```

Open your browser to: **`http://localhost:5173/`**

### Production Build
```bash
npm run build
```
Generates an optimized, code-split bundle in `dist/` with `React.lazy` chunks.

---

## 🏛️ System Architecture & Technology Stack

| Layer | Technology / Implementation | Details |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 & Vite 5 | SPA with ES modules, fast HMR, and dynamic code splitting |
| **Styling & Design System** | Pure CSS & CSS Variables | Professional light theme, zero heavy UI frameworks, responsive design |
| **Icons & Visuals** | Lucide React | High-contrast, lightweight SVG icon system |
| **State & Datastore** | Client-Side MockStore (v4.0) | Schema migration, JSON corruption auto-healing, and 17 domain stores |
| **Governance & Security** | RBAC Engine | Four-Eye principle: Branch Manager (BM), Relationship Officer (RO), Operations Admin (OA) |
| **Privacy & Masking** | Regex Masking Engine | Guaranteed Aadhaar masking (`XXXX-XXXX-1234`) across views & exports |
| **Multilingual Engine** | Localized i18n Dictionary | Zero-dependency translation across English, Hindi, Kannada, Tamil, Telugu |
| **Automated Testing** | Node.js Test Suites | Headless execution: `resilienceEngine.test.js` & `climatePlatform.test.js` |

---

## 🌟 Key Features & Domain Innovations

### 1. Transparent Farmer Resilience Scoring
Evaluates 7 objective agronomic pillars totaling 100 points:
- **Irrigation Access (20 pts):** Perennial borewell/canal vs. seasonal vs. rainfed
- **Crop Diversity (15 pts):** Multi-cropping vs. monoculture
- **Allied Dairy Income (15 pts):** Secondary livestock revenue stability
- **Repayment Track Record (15 pts):** On-time payment history
- **Soil Health (15 pts):** Soil health testing and organic carbon metrics
- **Insurance Coverage (10 pts):** Active PMFBY enrollment
- **Rainfall Volatility Exposure (10 pts):** Regional monsoon departure index

### 2. Harvest-Linked Repayment Planner
Replaces standard monthly EMIs with schedules tied to crop sowing date, vegetative duration, harvest date, and APMC mandi clearing buffers (+15 days). Provides transparent risk comparisons illustrating how bullet repayment suppresses NPA formation.

### 3. What-If Farm Shock Simulator
Allows credit underwriters to simulate shocks before disbursal:
- Severe Drought (-45% yield)
- Delayed Monsoon (-20% yield)
- Mandi Price Crash (-30% realization)
- Pest Outbreak (-35% yield)
- Input Cost Inflation (+25% expense)
Evaluates debt servicing capacity and suggests mitigating safeguards.

### 4. Field Officer Mode (Offline-First)
Designed for last-mile relationship officers traveling to remote villages. Includes:
- High-touch mobile interface
- Local offline transaction queue with sync counter
- Smart Notes Assistant with multilingual agronomic keyword extraction
- Direct GPS and crop stage capture

### 5. Regulatory Audit Log & DPDP Privacy Center
- **Audit Trail:** Immutable, searchable log tracking every creation, edit, sanction, and review with user persona and timestamp.
- **Privacy Center:** Explicit DPDP Act consent log, data portability passport export, and village-level anonymized heatmaps.

---

## 🧪 Automated Test Suite

AgriSahay includes an automated test harness covering core banking algorithms:

```bash
npm test
```

**Results: 36 Tests Passed (0 Failures)**
- ✅ RBAC maker-checker loan approval restrictions
- ✅ Resilience Score mathematical weighting and categorization
- ✅ Harvest repayment date calculations
- ✅ Aadhaar masking across 12-digit and edge-case inputs
- ✅ What-If stress test yield reduction formulas
- ✅ Multilingual agronomic keyword detection (English & Kannada)
- ✅ Early financial stress tier classification

---

## 📚 Project Documentation

Detailed guides and presentation materials are located in the [`docs/`](file:///c:/Users/gokul/Desktop/PROJECTS/agri_bnk/docs) directory:
- [Architecture & Data Specification](file:///c:/Users/gokul/Desktop/PROJECTS/agri_bnk/docs/ARCHITECTURE.md)
- [5-Minute & 10-Minute Live Demo Scripts](file:///c:/Users/gokul/Desktop/PROJECTS/agri_bnk/docs/DEMO_SCRIPT.md)
- [20 Placement Interview Questions & Answers](file:///c:/Users/gokul/Desktop/PROJECTS/agri_bnk/docs/INTERVIEW_PREP.md)
- [10-Slide Presentation Deck Outline](file:///c:/Users/gokul/Desktop/PROJECTS/agri_bnk/docs/PRESENTATION_OUTLINE.md)
- [Cloud Deployment Guide](file:///c:/Users/gokul/Desktop/PROJECTS/agri_bnk/DEPLOY.md)

---

## 📄 License & Academic Disclaimer

This project is an **academic prototype** created strictly for demonstration, evaluation, and educational purposes. It is not affiliated with, endorsed by, or connected to Ujjivan Small Finance Bank's live core banking infrastructure. All customer identities, land records, and account numbers are simulated demo artifacts.
