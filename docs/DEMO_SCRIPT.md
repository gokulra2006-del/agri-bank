# AgriSahay – 5-Minute and 10-Minute Live Demo Scripts

> **Target Audience:** Placement Interviewers, Credit Committee, & Evaluators at Ujjivan Small Finance Bank (Agriculture Banking Division).  
> **Persona:** Enthusiastic candidate presenting a complete, climate-smart agricultural loan operations platform.

---

## ⏱️ 5-Minute High-Impact Presentation Script

### 0:00 - 0:45 | Introduction & Problem Context
* **Click path:** Open application at [Dashboard](file:///c:/Users/gokul/Desktop/PROJECTS/agri_bnk/src/pages/Dashboard.jsx).
* **Talking Points:**
  > *"Good morning. Traditional retail banking models fail in rural India because they force monthly EMIs onto seasonal crop cycles. When monsoons delay or pests strike, farmers face default despite viable yields. I built **AgriSahay** specifically for Ujjivan Small Finance Bank's Agriculture Banking operations to bridge this gap with transparent climate-resilience underwriting, harvest-linked repayment planning, and strict Four-Eye compliance."*

### 0:45 - 2:00 | Farmer Resilience Underwriting & Transparency
* **Click path:** Navigate to **Farmers** $\to$ click on **Basavaraj Patil (FAR-001)** $\to$ view **Resilience Card**.
* **Talking Points:**
  > *"Notice how we assess creditworthiness. Instead of an opaque algorithm, AgriSahay uses a transparent 7-factor agricultural resilience score totaling 100 points: irrigation access, crop diversity, dairy income, soil health, and rainfall exposure.*  
  > *For Basavaraj, who has drip irrigation and dairy income, the score is 98 (High Resilience). If we inspect a vulnerable rainfed farmer, the platform automatically flags climate safeguards like PMFBY insurance and phased loan disbursements."*

### 2:00 - 3:15 | Harvest-Linked Repayment & Stress Simulator
* **Click path:** Navigate to **Repayment Planner** $\to$ select **Sugarcane (Mandya Branch)**. Then click **Innovation Center** $\to$ **What-If Simulator**.
* **Talking Points:**
  > *"Here is our core innovation: the **Harvest-Linked Repayment Planner**. Rather than imposing a standard monthly EMI of ₹14,000 during the sowing season when cash flow is negative, the schedule places principal repayment immediately post-harvest in December.*  
  > *In the **What-If Simulator**, the Branch Manager can model a 40% drought or market price slump to verify whether the farmer's net yield can still service the debt, recommending a moratorium before default happens."*

### 3:15 - 4:15 | Governance, Privacy, & Four-Eye Verification
* **Click path:** Change role in topbar from **Branch Manager** to **Relationship Officer (RO)** $\to$ attempt to click **Approve Loan** or visit **Audit Log**.
* **Talking Points:**
  > *"AgriSahay enforces strict banking governance. Notice that when switched to Relationship Officer, loan sanctioning is disabled—preventing self-approval under the Four-Eye Principle. Furthermore, Aadhaar is masked everywhere as XXXX-XXXX-1234 in compliance with DPDP regulations, and village heatmaps aggregate risk without exposing personal borrower finances."*

### 4:15 - 5:00 | Zero-Reload Full-Page Translation Across 10 Languages
* **Click path:** 
  1. Open the [Dashboard](file:///c:/Users/gokul/Desktop/PROJECTS/agri_bnk/src/pages/Dashboard.jsx) in English.
  2. In the top navigation bar, switch the language to **Kannada (ಕನ್ನಡ – Kannada)**. Observe how every dashboard card, KPI, button, and navigation header immediately translates without page reload.
  3. Navigate to **Farmers Directory** and click **Basavaraj Patil** to inspect the fully localized 360° Profile.
  4. Switch language to **Hindi (हिन्दी – Hindi)** and open **Farmer Help Desk** (`/help-desk`) to show localized loan guidelines and FAQs.
  5. Refresh the browser page (`F5`) to demonstrate that the language preference is preserved from `localStorage`.
  6. Open **Settings** $\to$ click **Inspect Translation Coverage** (`/language-preview`) to showcase the live matrix of all 10 official languages with 100% key completion.
* **Talking Points:**
  > *"AgriSahay uses a centralized localization architecture rather than translating only the navigation menu. Every user-facing label, form, message, status, validation prompt, and help article is connected to a translation key. This allows branch staff to operate the complete workflow in their preferred regional language while preserving the internal banking data and permissions."*

---

## ⏱️ 10-Minute Comprehensive Deep-Dive Script

| Minute | Screen | Key Demonstration |
| :--- | :--- | :--- |
| **0:00 - 1:30** | Dashboard & Topbar | Multi-branch filtering, portfolio KPI breakdown, 10-language switcher (`en`, `hi`, `kn`, `ta`, `te`, `mr`, `bn`, `ml`, `gu`, `pa`). |
| **1:30 - 3:00** | Farmers & Profile | Farmer registration with duplicate phone validation, landholding verification, Aadhaar masking, 7-factor resilience breakdown. |
| **3:00 - 4:30** | Loan Applications & RBAC | Maker-Checker loan processing workflow. Relationship Officer submits loan; Branch Manager inspects, reviews land documents, and sanctions. |
| **4:30 - 6:00** | Repayment Planner & Simulator | Contrast standard monthly EMI vs. harvest-linked bullet payment. Run drought and pest stress scenarios with yield sensitivity charts. |
| **6:00 - 7:30** | Field Officer Mode & Offline Sync | Demonstrate offline village visit capture, photo attachments, and rule-based agricultural note extraction in regional vernacular. |
| **7:30 - 8:30** | Language Preview & Coverage | Open `/language-preview` to inspect the 10-language matrix and live component translation previews. |
| **8:30 - 9:30** | Audit Log & Privacy Center | Searchable regulatory audit trail, DPDP consent log, and CSV exports with masked personal identifiers. |
| **9:30 - 10:00** | Tech Stack, Tests, & Q&A | Review 48/48 passing automated unit tests, production bundle optimization, and wrap up. |
