# AgriSahay REST API Specification

## 1. Overview & Base URL

All requests must use standard JSON payloads and include appropriate HTTP headers.

- **Base URL**: `http://localhost:5000/api`
- **Default Port**: `5000` (configurable via `PORT` in `.env`)
- **Authentication**: `Authorization: Bearer <JWT_TOKEN>`

---

## 2. Authentication & Session Endpoints

### `POST /auth/login`
Authenticates a user and returns a signed JWT token.
- **Request Body**:
  ```json
  {
    "username": "manager",
    "password": "Bank@123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "USR-001",
      "username": "manager",
      "full_name": "Suresh Gowda",
      "role": "BRANCH_MANAGER",
      "branch_id": "BR-MANDYA"
    }
  }
  ```

### `GET /auth/me`
Returns details of the currently authenticated session.
- **Headers**: `Authorization: Bearer <TOKEN>`

---

## 3. Farmers & DPDP Data Access Endpoints

### `GET /farmers`
Lists farmers filtered by search query or branch.
- **Query Params**: `search`, `village`, `branchId`
- **Audit Side-Effect**: Records data access audit log under DPDP Act requirements.

### `GET /farmers/:id`
Retrieves full farmer profile, live explainable resilience score, and factor breakdown.

### `POST /farmers`
Registers a new farmer profile.
- **Required Roles**: `RELATIONSHIP_OFFICER`, `BRANCH_MANAGER`, `ADMIN`
- **Request Body**:
  ```json
  {
    "name": "Basavaraju Gowda",
    "phone": "9845123456",
    "village": "Kyathanahalli",
    "taluk": "Pandavapura",
    "district": "Mandya",
    "land_size_acres": 4.5,
    "land_type": "Canal Irrigated",
    "primary_crop": "Sugarcane",
    "secondary_crop": "Ragi",
    "annual_income": 320000,
    "soil_card_issued": true,
    "pmfby_enrolled": true,
    "aadhaar_masked": "XXXX-XXXX-8921"
  }
  ```

---

## 4. Loan Applications & Maker-Checker Dual Control

### `GET /loans`
Lists agricultural loan applications.

### `POST /loans`
Submits a new loan application. Automatically validates DLTC Scale of Finance limits.
- **Required Roles**: `RELATIONSHIP_OFFICER`, `BRANCH_MANAGER`

### `POST /loans/:id/sanction`
Approves or sanctions a loan application.
- **Required Roles**: `BRANCH_MANAGER`, `ADMIN`
- **Dual-Control Restriction**: Maker officer cannot approve their own application.
- **Request Body**:
  ```json
  {
    "action": "APPROVED", // "APPROVED" or "REJECTED"
    "sanctioned_amount": 180000,
    "notes": "Approved in Sanction Committee per Scale of Finance recommendations."
  }
  ```

---

## 5. Offline Sync & Idempotency Endpoints

### `POST /sync/batch`
Processes queued offline events recorded during village field visits.
- **Request Body**:
  ```json
  {
    "events": [
      {
        "idempotency_key": "c3b9b46e-1d54-4a57-8b09-cf8cf325db19",
        "device_id": "TAB-MANDYA-01",
        "entity_type": "FIELD_VISIT",
        "operation": "CREATE",
        "client_timestamp": "2026-10-09T08:30:00Z",
        "version": 1,
        "payload": {
          "farmer_id": "FAR-001",
          "crop_stage": "Vegetative Growth",
          "health_rating": "Good",
          "notes": "Drip irrigation active. Crop stands healthy."
        }
      }
    ]
  }
  ```
- **Response**: Returns batch status with processed counts and conflict flags.

---

## 6. PMFBY Credit Protection Endpoints

### `POST /credit-protection/intimate-loss`
Logs localized crop loss within the 72-hour statutory window.
- **Request Body**:
  ```json
  {
    "loan_id": "LN-2026-001",
    "farmer_id": "FAR-001",
    "peril_type": "Hailstorm / Inundation",
    "loss_percentage": 50,
    "loss_date": "2026-10-08",
    "notes": "Severe localized hailstorm damaged standing sugarcane."
  }
  ```

---

## 7. Pilot Usability Evaluation Endpoints

### `GET /pilot/aggregates`
Returns anonymized task timing metrics (T1–T6), Brooke (1986) SUS score averages, and error rates.

### `POST /pilot/participants`
Enrolls an anonymous usability study participant.

### `POST /pilot/tasks`
Records a task stopwatch trial with duration in seconds, success status, and error count.

### `POST /pilot/surveys`
Submits a 10-item System Usability Scale (SUS) survey on a 1–5 Likert scale.

---

## 8. Privacy-Preserving Research Export Endpoints

### `GET /export/research-dataset?format=json`
Exports de-identified research dataset with direct PII stripped and village cohorts with $N < 5$ suppressed under DPDP Act privacy guidelines.

---

## 9. Operations Telemetry & Chain Verification

### `GET /ops/telemetry`
Returns active uptime, memory utilization, table record counts, sync queue telemetry, and average approval turnaround times (TAT).

### `GET /ops/audit-verify`
Cryptographically verifies the forward hash-chain of all historical audit events against the genesis hash.
