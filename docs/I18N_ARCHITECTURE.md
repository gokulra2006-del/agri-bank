# AgriSahay – Multilingual Localization Architecture & Translation System

> **Academic Prototype Notice:** This specification details the centralized localization architecture powering **AgriSahay – Agriculture Loan and Farmer Support System**, an academic prototype built for the Ujjivan Small Finance Bank placement project.

---

## 1. Executive Summary & Objective

In Indian rural banking, field officers, credit underwriters, and farmers communicate across multiple regional vernaculars. Rigid English-only or partial menu translations create severe operational friction and risk misunderstandings during loan sanctioning.

AgriSahay implements a **Zero-Reload Full-Page Translation System** supporting **10 official Indian languages**:
1. **English (`en`)** – Master Reference Locale
2. **Hindi (`hi`)** – हिन्दी
3. **Kannada (`kn`)** – ಕನ್ನಡ
4. **Tamil (`ta`)** – தமிழ்
5. **Telugu (`te`)** – తెలుగు
6. **Marathi (`mr`)** – मराठी
7. **Bengali (`bn`)** – বাংলা
8. **Malayalam (`ml`)** – മലയാളം
9. **Gujarati (`gu`)** – ગુજરાતી
10. **Punjabi (`pa`)** – ਪੰਜਾਬੀ

---

## 2. Localization Architecture

```
+-----------------------------------------------------------------------------------------+
|                                    React Context Tier                                   |
|   <LanguageProvider> -> useTranslation() -> [currentLang, setLanguage, t(key, vars)]   |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                                  Fallback & Resolution Chain                            |
|         Requested Key -> Active Language Dict -> English Master -> Key Path String      |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                               Interpolation & Dynamic Tokens                            |
|       Safe token substitution: {name}, {count}, {amount}, {time}, {farmerName}           |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                                DOM, Document & Storage Sync                             |
|  • document.documentElement.lang = currentLang                                          |
|  • document.documentElement.dir = "ltr" (RTL-ready)                                     |
|  • localStorage['agrisahay_settings'].language                                          |
|  • Toast confirmation banner (aria-live="polite")                                       |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Translation Dictionaries Organization

Translation keys are grouped hierarchically into functional modules:
- `common`: Universal UI controls (`appName`, `save`, `cancel`, `delete`, `search`, `filter`, `status`, `showingCount`, `itemsPending`, `lastSynced`)
- `navigation`: Navigation groups and individual route links
- `dashboard`: Overview KPI metrics, seasonal pipeline cards, and inflow trends
- `farmers`: Registration form, directory tables, search and delete confirmation modals
- `farmerProfile`: 360° farmer view, KYC landholdings, financial details, and 7-factor resilience card
- `loans`: Loan origination pipeline, product types, and application modal
- `loanDetail`: Sanction approvals, four-eye maker-checker notices, and terms
- `fieldOfficer`: Mobile ARO portal, crop emergence checks, and geocoded inspections
- `risk`: Credit risk radar, what-if stress simulator, and village risk heatmaps
- `reports`: Regulatory exports and masked Aadhaar privacy notices
- `audit`: Immutable audit ledger table headers and actor roles
- `helpDesk`: Step-by-step 4-stage loan guide and farmer financial literacy FAQs
- `settings`: Officer profile, branch scope, language switcher, and demo data resets
- `languagePreview`: Key completion status matrix and interactive translation inspector
- `validation`: Accessible form input validation errors
- `accessibility`: ARIA screen reader labels

---

## 4. Protected Banking Data Invariants

Under strict banking compliance guidelines, the localization engine **never translates or mutates sensitive core data**:
1. **Borrower Names & Identifiers:** E.g., `Basavarajappa H.`, `FAR-001`, `LN-2025-001` remain unchanged.
2. **Aadhaar Privacy Masking:** Aadhaar numbers remain strictly masked as `XXXX-XXXX-1234` in all languages.
3. **Currency Invariant:** Indian Rupee formatting (`₹`) is maintained across all locales using standard Indian grouping (`1,50,000`).
4. **Internal Audit Action Codes:** Immutable audit records store standardized English action codes (`LOAN_SANCTIONED`, `FIELD_VISIT_COMPLETED`) while translating display representations.

---

## 5. How to Add a New Language

Adding an 11th language (e.g., Odia `or`, Assamese `as`, or Urdu `ur` for RTL) requires 4 simple steps:
1. **Create Dictionary:** Create `src/locales/<lang_code>.js` structured identically to `src/locales/en.js`.
2. **Register in `src/utils/i18n.js`:**
   - Import the dictionary: `import { ur } from '../locales/ur.js';`
   - Add to `SUPPORTED_LANGUAGES`: `{ code: 'ur', label: 'Urdu', native: 'اردو – Urdu', dir: 'rtl' }`
   - Add to `DICTIONARIES`: `ur`
3. **Verify with Automated Tests:**
   ```bash
   node tests/i18n.test.js
   ```
4. **Inspect in UI:** Navigate to `/language-preview` to review key completion coverage.
