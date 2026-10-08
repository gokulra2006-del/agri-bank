# AgriSahay – Deployment & Hosting Guide

This guide details instructions for building, testing, and deploying **AgriSahay – Agriculture Loan and Farmer Support System** across popular cloud hosting providers.

---

## 🛠️ Local Development & Build Verification

### 1. Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher

### 2. Install & Run Locally
```bash
# Clone the repository
git clone https://github.com/gokulra2006-del/agri-bank.git
cd agri-bank

# Install dependencies
npm install

# Run automated test suite (36 unit tests)
npm test

# Start the Vite development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
npm run build
```
This produces an optimized production bundle inside the `dist/` directory with code-split route chunks.

---

## 🌐 Deploy to Vercel (Recommended)

1. Sign in to [Vercel](https://vercel.com) using your GitHub account.
2. Click **Add New...** $\to$ **Project**.
3. Import your repository: `https://github.com/gokulra2006-del/agri-bank.git`.
4. Configure Project Settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **Deploy**. Vercel will build and assign an instant production URL with automatic HTTPS and global edge CDN.

---

## 🌐 Deploy to Netlify

### Option A: Via Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod --dir=dist
```

### Option B: Via Netlify Web Dashboard
1. Connect Netlify to your GitHub account.
2. Select repository `agri-bank`.
3. Set the build parameters:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Click **Deploy Site**.

*Note: For single-page app (SPA) client-side routing on Netlify, an optional `_redirects` file with `/*  /index.html  200` can be placed in `public/`.*

---

## 🌐 Deploy to GitHub Pages

Because `vite.config.js` is configured with `base: './'`, AgriSahay supports GitHub Pages subpath deployment out of the box.

1. Install `gh-pages` if desired, or use GitHub Actions:
```bash
npm install --save-dev gh-pages
```
2. Add deploy script to `package.json`:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```
3. Run:
```bash
npm run deploy
```
4. In your GitHub repository settings, navigate to **Pages** and verify that source is set to branch `gh-pages` / `root`.

---

## 🔒 Security & Data Hygiene Check Before Deployment

- [x] No live API keys, private tokens, or secrets in codebase.
- [x] All personal data (Aadhaar) strictly masked (`XXXX-XXXX-1234`).
- [x] All farmer records marked as demo data with the compliant academic prototype disclaimer.
- [x] Schema auto-healing and versioning configured to handle diverse browser environments.
