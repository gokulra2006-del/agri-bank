# AgriSahay – Agriculture Loan and Farmer Support System

> **Academic Prototype Notice:** This project was developed as a placement showcase for **Ujjivan Small Finance Bank (Agriculture Banking Department)**. It is an academic demonstration prototype and is **not connected to a live banking system or real customer database**. All data displayed is simulated demo data.

---

## 🌾 Project Overview

Traditional retail banking products impose rigid monthly EMIs and conventional credit scoring onto seasonal agricultural borrowers. When monsoons delay, floods strike, or mandi commodity prices fluctuate, farmers face technical defaults despite fundamentally viable crops.

**AgriSahay** bridges this systemic gap. Built from the ground up for rural agriculture credit operations, it introduces:
- **Transparent 7-Factor Farmer Resilience Scoring** (replacing black-box credit models)
- **Harvest-Linked Repayment Planning** (matching repayment schedules to crop maturity and mandi sales)
- **Four-Eye Maker-Checker Governance** (strict role-based separation between field sourcing and loan sanctioning)
- **Offline-First Field Mobility** with comprehensive 10-language regional localization (English, Hindi, Kannada, Tamil, Telugu, Marathi, Bengali, Malayalam, Gujarati, Punjabi)
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

# Run automated unit test suite (48 assertions across resilience, climate & i18n)
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
| **Styling & Design System** | Pure CSS & Indic Font Stack | Professional light theme, zero heavy UI frameworks, native Indic typography |
| **Icons & Visuals** | Lucide React | High-contrast, lightweight SVG icon system |
| **State & Datastore** | Client-Side MockStore (v4.0) | Schema migration, JSON corruption auto-healing, and 17 domain stores |
| **Governance & Security** | RBAC Engine | Four-Eye principle: Branch Manager (BM), Relationship Officer (RO), Operations Admin (OA) |
| **Privacy & Masking** | Regex Masking Engine | Guaranteed Aadhaar masking (`XXXX-XXXX-1234`) across views & exports |
| **Multilingual Engine** | Zero-Dependency i18n Core | Static pre-compiled dictionaries across 10 Indian languages with fallback chain |
| **Automated Testing** | Node.js Test Suites | Headless execution: `resilienceEngine.test.js`, `climatePlatform.test.js`, `i18n.test.js` |

---

## 🌐 10-Language Full-Page Translation System

AgriSahay features a zero-reload, full-page translation architecture supporting 10 major Indian languages:
1. **English** (`en`)
2. **हिन्दी – Hindi** (`hi`)
3. **ಕನ್ನಡ – Kannada** (`kn`)
4. **தமிழ் – Tamil** (`ta`)
5. **తెలుగు – Telugu** (`te`)
6. **मराठी – Marathi** (`mr`)
7. **বাংলা – Bengali** (`bn`)
8. **മലയാളം – Malayalam** (`ml`)
9. **ગુજરાતી – Gujarati** (`gu`)
10. **ਪੰਜਾਬੀ – Punjabi** (`pa`)

### Multilingual Architectural Guarantees:
- **Instant Full-Page Switching:** Changing language in the Topbar translates the entire UI immediately via React Context (`LanguageProvider`), with no page reload.
- **Static Dictionaries (No Cloud APIs):** Zero external translation APIs, zero API keys, and zero runtime machine translation latency.
- **Bulletproof Fallback Chain:** If a key is absent in a regional dictionary, it seamlessly falls back to English (`en`), and finally to the path string with development warnings.
- **Protected Data Invariant:** Financial tokens (`₹` Indian Rupee), Aadhaar masks (`XXXX-XXXX-1234`), loan identifiers, farmer personal names, and village names are never corrupted by translation routines.
- **Native Indic Typography:** Built-in font fallbacks for Devanagari, Kannada, Tamil, Telugu, Bengali, Malayalam, Gujarati, and Gurmukhi with adjusted line-height (`1.6`) to prevent vowel-sign (matra) clipping.
- **Language Preview Portal (`/language-preview`):** Dedicated matrix dashboard tracking translation coverage percentages, missing keys, and native speaker verification statuses.

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

AgriSahay includes an automated test harness covering core banking algorithms and i18n rules:

```bash
npm test
```

**Results: 48 Tests Passed (0 Failures)**
- ✅ RBAC maker-checker loan approval restrictions
- ✅ Resilience Score mathematical weighting and categorization
- ✅ Harvest repayment date calculations
- ✅ Aadhaar masking across 12-digit and edge-case inputs
- ✅ What-If stress test yield reduction formulas
- ✅ Multilingual agronomic keyword detection (English & Kannada)
- ✅ Early financial stress tier classification
- ✅ 10 regional dictionary compilation & validation
- ✅ English fallback chain for missing keys
- ✅ Dynamic token interpolation (`{count}`, `{name}`, `{date}`)
- ✅ Coverage percentage calculations
- ✅ Absolute preservation of Aadhaar masking & ₹ currency symbols across translations

---

## 📚 Project Documentation

Detailed guides and presentation materials are located in the [`docs/`](file:///c:/Users/gokul/Desktop/PROJECTS/agri_bnk/docs) directory:
- [10-Language i18n Architecture Guide](file:///c:/Users/gokul/Desktop/PROJECTS/agri_bnk/docs/I18N_ARCHITECTURE.md)
- [Agricultural Banking Translation Glossary](file:///c:/Users/gokul/Desktop/PROJECTS/agri_bnk/docs/TRANSLATION_GLOSSARY.md)
- [Architecture & Data Specification](file:///c:/Users/gokul/Desktop/PROJECTS/agri_bnk/docs/ARCHITECTURE.md)
- [5-Minute & 10-Minute Live Demo Scripts](file:///c:/Users/gokul/Desktop/PROJECTS/agri_bnk/docs/DEMO_SCRIPT.md)
- [26 Placement Interview Questions & Answers](file:///c:/Users/gokul/Desktop/PROJECTS/agri_bnk/docs/INTERVIEW_PREP.md)
- [10-Slide Presentation Deck Outline](file:///c:/Users/gokul/Desktop/PROJECTS/agri_bnk/docs/PRESENTATION_OUTLINE.md)
- [Cloud Deployment Guide](file:///c:/Users/gokul/Desktop/PROJECTS/agri_bnk/DEPLOY.md)

---

## 📄 License & Academic Disclaimer

This project is an **academic prototype** created strictly for demonstration, evaluation, and educational purposes. It is not affiliated with, endorsed by, or connected to Ujjivan Small Finance Bank's live core banking infrastructure. All customer identities, land records, and account numbers are simulated demo artifacts.

