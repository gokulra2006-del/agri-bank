# AgriSahay Deployment & Operations Guide

## 1. Prerequisites

- **Node.js**: Version 18.0.0 or higher (Node 20+ Recommended)
- **npm**: Version 9.0.0 or higher
- **PostgreSQL**: Version 14+ (Optional; standalone demo runs in-memory if omitted)
- **Web Browser**: Chrome, Edge, Firefox, or Safari with modern CSS Grid support

---

## 2. Environment Configuration

Copy the sample environment file and configure variables:
```bash
cp .env.example .env
```

Key variables in `.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super_secret_jwt_key_replace_in_production_2026
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/agrisahay_db
USE_MEMORY_FALLBACK=true
PRIVACY_THRESHOLD_N=5
```

---

## 3. Database Migration

To provision tables in PostgreSQL:
```bash
npm run migrate
```
This runs `server/database/migrate.js`, executing `server/database/schema.sql` against the configured `DATABASE_URL`. If no database server is present, the script gracefully logs fallback instructions.

---

## 4. Running the Development Stack

### Starting the Secure Express Backend:
```bash
npm run server
```
Server starts on `http://localhost:5000`.

### Starting the Vite Frontend:
```bash
npm run dev
```
Client starts on `http://localhost:5173`.

### Running All Automated Tests:
```bash
npm test
```
Executes all 5 test suites (118 automated tests passing).

---

## 5. Production Build

To build the client for production:
```bash
npm run build
```
Generates optimized static bundles in `dist/`.

---

## 6. Docker Deployment (Optional Reference)

```dockerfile
# Multi-stage production Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
EXPOSE 5000
CMD ["node", "server/index.js"]
```
