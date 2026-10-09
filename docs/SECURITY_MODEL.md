# AgriSahay Security Model & Governance Specification

## 1. Governance Principles

AgriSahay enforces strict financial and regulatory guardrails modeled after Indian commercial and Small Finance Banking best practices:

1. **Dual-Control (Maker-Checker Four-Eye Rule)**:
   - A single banking staff member cannot originate and unilaterally disburse credit.
   - Field Relationship Officers (`RELATIONSHIP_OFFICER`) can capture borrower profiles, evaluate Scale of Finance limits, and submit applications (Maker).
   - Only Branch Managers (`BRANCH_MANAGER`) or Credit Operations Admins (`ADMIN`) can approve and sanction credit (Checker).
   - If a Branch Manager creates a loan application, the server strictly prohibits self-approval (`loan.maker_officer_id !== req.user.id`).

2. **Role-Based Access Control (RBAC)**:
   - Evaluated server-side on every protected API route through `requireRole(allowedRoles)`.
   - Client-side navigation rendering (`src/utils/rbac.js`) hides unauthorized views.

| Capability | Relationship Officer | Branch Manager | Operations Admin | Usability Researcher |
| :--- | :---: | :---: | :---: | :---: |
| Register Farmers | Yes | Yes | Yes | No (Read-Only) |
| Originate Loans | Yes | Yes | No | No (Read-Only) |
| Sanction / Approve Loans | **No** | **Yes** | **Yes** | **No** |
| Disburse / Restructure | **No** | **Yes** | **Yes** | **No** |
| Access Raw Audit Trail | No | Yes | Yes | No |
| Access Telemetry & Verify Chain | No | Yes | Yes | Yes |
| Run Usability Pilots & Tasks | No | Yes | Yes | **Yes** |
| Export Anonymized Research Dataset | No | Yes | Yes | **Yes** |

---

## 2. Authentication & Session Lifecycles

- **Password Storage**: Passwords are hashed with **bcrypt** using a work factor / salt rounds of 10.
- **Token Generation**: Bearer tokens are signed using JSON Web Tokens (JWT) using HMAC-SHA256 with secret keys configured via `.env`.
- **Token Expiration**: Default token validity is 8 hours (`JWT_EXPIRES_IN=8h`). Expired tokens return `403 TOKEN_EXPIRED`, requiring re-authentication.

---

## 3. Data Privacy & DPDP Act 2023 Enforcement

- **Mandatory Aadhaar Masking**:
  Under UIDAI regulations and Section 8 of the DPDP Act 2023, raw 12-digit Aadhaar numbers are never accepted into persistent storage.
  The input validation middleware automatically intercepts any submitted 12-digit sequence and converts it to `XXXX-XXXX-last4`.
- **Consent Revocation**:
  Farmers retain the unconditional right to withdraw consent for data processing. Revocation updates the status in `consent_records` and immediately restricts further external sharing.
- **k-Anonymity & $N < 5$ Suppression in Research Exports**:
  When extracting research datasets, any demographic group (village cohort) containing fewer than 5 subjects is masked as `[Suppressed: N < 5]` to eliminate re-identification risks.
