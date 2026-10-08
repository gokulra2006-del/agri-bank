# AgriSahay – 20 Placement Interview Questions & Answers

> **Position:** Agriculture Banking Officer / Management Trainee  
> **Company:** Ujjivan Small Finance Bank (Rural & Agriculture Banking)

---

### Q1: Why did you build AgriSahay instead of using a standard retail banking dashboard?
**Answer:** Standard retail banking relies on salaried cash-flows with monthly salaries and CIBIL bureau scores. Indian farmers, however, have seasonal, lumpy cash flows dependent on crop cycles, monsoons, and input costs. AgriSahay was built specifically to model agricultural realities: harvest-linked repayments, climate vulnerability, and field officer offline village workflows.

### Q2: What is the "Four-Eye Principle" and how did you implement it in your code?
**Answer:** The Four-Eye Principle (Maker-Checker) mandates that no single individual can initiate and approve a financial transaction. In AgriSahay's RBAC matrix, a Relationship Officer (Maker) can register farmers, record field inspections, and submit loan applications, but cannot approve them. The Branch Manager (Checker) is the sole authority with sanction permissions.

### Q3: Explain your Farmer Resilience Score. Why didn't you use a Black-Box AI model?
**Answer:** In agriculture credit, opaque black-box AI scores lead to arbitrary rejections and regulatory non-compliance. Our score is completely deterministic and transparent across 7 agronomic pillars totaling 100 points: Irrigation (20), Crop Diversity (15), Allied Dairy Income (15), Repayment Track Record (15), Soil Health (15), Crop Insurance (10), and Rainfall Volatility (10). Borrowers receive plain-language guidance explaining exactly why they were scored and what steps will improve their terms.

### Q4: How does your Harvest-Linked Repayment Planner reduce NPA (Non-Performing Asset) rates?
**Answer:** Forcing monthly EMIs during the sowing and vegetative stages causes unnecessary technical defaults because farmers have out-of-pocket input expenses and zero revenue. By aligning principal repayment with harvest and mandi sales windows (e.g. December for Kharif paddy/sugarcane), farmers service interest during growth and liquidate principal when liquidity is highest, drastically reducing overdue stress.

### Q5: How does AgriSahay ensure compliance with the Digital Personal Data Protection (DPDP) Act?
**Answer:** We enforce data minimization and strict privacy safeguards: (1) Aadhaar numbers are masked to `XXXX-XXXX-1234` across all screens and CSV exports; (2) Community Risk Heatmaps aggregate data at the village level without exposing individual farmer identities or loan amounts; (3) We maintain a dedicated Privacy Center with explicit consent logs and revocation options.

### Q6: How does the application function in remote rural areas with poor connectivity?
**Answer:** AgriSahay implements an offline-first transactional queue. When field officers travel to remote villages with no cellular connectivity, new farmer registrations and field visit notes are saved locally to an offline queue. Once network connectivity is restored, the queue syncs with an audit log timestamp.

### Q7: What is the purpose of the What-If Farm Simulator?
**Answer:** It is a proactive credit-risk stress-testing tool for Branch Managers. Before sanctioning, officers simulate adverse events such as a 40% drought, pest outbreak, or 20% mandi price decline. The system recalculates expected net revenue and recommends risk mitigations, such as PMFBY insurance coverage or phased disbursements.

### Q8: How did you test the application?
**Answer:** We built a dedicated headless test suite in Node.js (`tests/resilienceEngine.test.js` and `tests/climatePlatform.test.js`) containing 36 automated unit tests. The tests validate RBAC route enforcement, resilience score boundaries, harvest date arithmetic, Aadhaar masking, stress simulation yield reductions, and multilingual keyword extraction.

### Q9: How is the state managed across multiple components without Redux?
**Answer:** We implemented a modular client-side repository pattern in `src/data/mockStore.js`. It exposes dedicated getters, setters, schema validation, and auto-migration helpers (`agrisahay_version: "4.0"`). Component state is cleanly synchronized with standard React hooks (`useState`, `useEffect`) and local storage subscriptions.

### Q10: How did you handle multilingual localization?
**Answer:** We developed a lightweight, zero-dependency translation dictionary (`src/utils/i18n.js`) supporting 5 languages: English, Hindi, Kannada, Tamil, and Telugu. Translations cover navigation categories, KPI metrics, status badges, and table headers.

### Q11: What prevents duplicate farmer entries?
**Answer:** The registration form enforces client-side validation that checks the entered 10-digit mobile number and Aadhaar against existing records in `agrisahay_farmers`. If a duplicate is detected, an accessible error alert banner is rendered without resetting the form.

### Q12: How do you handle schema changes between application versions?
**Answer:** In `src/data/mockStore.js`, `checkStorageMigration()` validates the stored version tag against `STORAGE_VERSION = '4.0'`. If a user has stale schema from an older build, it safely flushes obsolete keys and re-populates baseline seed data while logging the migration event.

### Q13: What happens if a user's localStorage contains corrupted JSON?
**Answer:** All access passes through `getStorageItem(key, fallback)` which wraps `JSON.parse` in a `try...catch` block. If parsing throws a SyntaxError, the corrupted entry is automatically purged and the safe fallback data is restored.

### Q14: How does the Smart Notes Assistant work?
**Answer:** It is a deterministic rule-based NLP parser in `src/utils/climatePlatformUtils.js`. It scans field officer observation text in English and regional languages (like Kannada) for agronomic triggers such as "pest", "blast", "drip", or "healthy" and auto-generates structured risk summaries without third-party AI dependencies.

### Q15: How are loan documents managed in this prototype?
**Answer:** We store document metadata in `agrisahay_documents`, linking document type (e.g. 7/12 Land Extract, Chitta, Aadhaar, Crop Inspection Certificate), verification status, verification officer, and timestamp to the respective farmer and loan ID.

### Q16: How did you optimize bundle size and page loading?
**Answer:** We implemented React `lazy()` and `Suspense` with a custom `PageLoader` component across all 24 page routes. This code-splits the bundle, keeping the primary vendor bundle at ~285 kB and loading page chunks asynchronously on demand.

### Q17: What accessibility (a11y) standards did you incorporate?
**Answer:** All modals feature keyboard focus trapping, `Escape` key dismissal, focus restoration, `role="dialog"`, and `aria-modal="true"`. Form controls have explicit `aria-label` tags, error banners have `role="alert"`, and CSS includes high-contrast focus rings and `prefers-reduced-motion` queries.

### Q18: What is the early financial stress detection feature?
**Answer:** It classifies borrower overdue exposure into 3 tiers (Low, Moderate, High Stress) based on DPD (Days Past Due) and loan-to-income ratio, automatically suggesting supportive restructuring interventions rather than punitive recovery actions.

### Q19: Why did you choose Vite over Create React App?
**Answer:** Vite offers instant Hot Module Replacement (HMR) powered by native ES modules, significantly faster build times (under 30 seconds for 1,600+ modules), and cleaner Rollup chunk splitting for production deployment.

### Q20: If you were given 3 months to deploy this to production, what would you add?
**Answer:** (1) Replace `localStorage` with a secure Spring Boot / Node.js microservices backend and PostgreSQL database; (2) Integrate with UIDAI Aadhaar e-KYC and AgriStack / CUG API for real-time digital land record verification; (3) Connect to IMD (India Meteorological Department) weather APIs for automated hyper-local rainfall index triggers; (4) Implement Web Worker Background Sync for true PWA offline-to-online reconciliation.
