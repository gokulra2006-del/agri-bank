-- ====================================================================
-- AgriSahay PostgreSQL Production Database Schema
-- Agricultural Lending, Climate Resilience & Pilot Evaluation Platform
-- ====================================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. Users & Authentication
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('ADMIN', 'BRANCH_MANAGER', 'RELATIONSHIP_OFFICER', 'AUDITOR', 'RESEARCHER')),
    branch_id VARCHAR(32) NOT NULL DEFAULT 'BR-MANDYA',
    phone_number VARCHAR(16),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- --------------------------------------------------------------------
-- 2. Farmers Directory (Aadhaar Masked)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS farmers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    gender VARCHAR(16) NOT NULL DEFAULT 'Male',
    village VARCHAR(128) NOT NULL,
    taluk VARCHAR(128) NOT NULL DEFAULT 'Mandya',
    district VARCHAR(128) NOT NULL DEFAULT 'Mandya',
    state VARCHAR(64) NOT NULL DEFAULT 'Karnataka',
    phone VARCHAR(16) NOT NULL,
    aadhaar_masked VARCHAR(20) NOT NULL CHECK (aadhaar_masked ~ '^XXXX-XXXX-[0-9]{4}$'),
    land_size_acres NUMERIC(6, 2) NOT NULL CHECK (land_size_acres > 0),
    land_type VARCHAR(64) NOT NULL DEFAULT 'Canal Irrigated',
    primary_crop VARCHAR(64) NOT NULL,
    secondary_crop VARCHAR(64) DEFAULT 'None',
    annual_income NUMERIC(12, 2) NOT NULL DEFAULT 0,
    allied_income NUMERIC(12, 2) NOT NULL DEFAULT 0,
    rainfall_zone VARCHAR(32) NOT NULL DEFAULT 'Medium',
    soil_card_issued BOOLEAN NOT NULL DEFAULT FALSE,
    pmfby_enrolled BOOLEAN NOT NULL DEFAULT FALSE,
    resilience_score INTEGER DEFAULT 50 CHECK (resilience_score BETWEEN 0 AND 100),
    resilience_confidence INTEGER DEFAULT 80 CHECK (resilience_confidence BETWEEN 0 AND 100),
    resilience_category VARCHAR(64) DEFAULT 'Moderate Resilience',
    created_by VARCHAR(64) REFERENCES users(id),
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 3. Loans & Four-Eye Sanctions
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS loans (
    id VARCHAR(64) PRIMARY KEY,
    farmer_id VARCHAR(64) NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    farmer_name VARCHAR(128) NOT NULL,
    loan_type VARCHAR(64) NOT NULL DEFAULT 'Kisan Credit Card (Crop Loan)',
    crop VARCHAR(64) NOT NULL,
    acreage NUMERIC(6, 2) NOT NULL,
    scale_of_finance_per_acre NUMERIC(10, 2) NOT NULL,
    applied_amount NUMERIC(12, 2) NOT NULL,
    sanctioned_amount NUMERIC(12, 2) DEFAULT 0,
    interest_rate NUMERIC(5, 2) NOT NULL DEFAULT 7.00,
    tenure_months INTEGER NOT NULL DEFAULT 12,
    status VARCHAR(32) NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Disbursed', 'Restructured', 'Closed')),
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE NOT NULL,
    repayment_model VARCHAR(32) NOT NULL DEFAULT 'BULLET_POST_HARVEST' CHECK (repayment_model IN ('BULLET_POST_HARVEST', 'BI_ANNUAL_HARVEST', 'MONTHLY_EMI')),
    maker_officer_id VARCHAR(64) REFERENCES users(id),
    checker_manager_id VARCHAR(64) REFERENCES users(id),
    sanction_date TIMESTAMP WITH TIME ZONE,
    disbursal_date TIMESTAMP WITH TIME ZONE,
    restructured_from_loan_id VARCHAR(64),
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 4. Harvest-Linked Repayment Installments
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS repayments (
    id VARCHAR(64) PRIMARY KEY,
    loan_id VARCHAR(64) NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    principal_due NUMERIC(12, 2) NOT NULL,
    interest_due NUMERIC(12, 2) NOT NULL,
    total_due NUMERIC(12, 2) NOT NULL,
    amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(32) NOT NULL DEFAULT 'Upcoming' CHECK (payment_status IN ('Upcoming', 'Paid', 'Overdue', 'Deferred', 'Waived')),
    paid_date TIMESTAMP WITH TIME ZONE,
    stage_label VARCHAR(64) NOT NULL DEFAULT 'Post-Harvest Mandi Realization',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 5. Field Visits & Geotagged Inspections
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS field_visits (
    id VARCHAR(64) PRIMARY KEY,
    farmer_id VARCHAR(64) NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    farmer_name VARCHAR(128) NOT NULL,
    officer_id VARCHAR(64) NOT NULL REFERENCES users(id),
    visit_date DATE NOT NULL,
    crop_stage VARCHAR(64) NOT NULL,
    crop_condition VARCHAR(32) NOT NULL CHECK (crop_condition IN ('Excellent', 'Good', 'Average', 'Poor', 'Stressed')),
    pest_risk_observed VARCHAR(32) NOT NULL DEFAULT 'None',
    irrigation_verified VARCHAR(64) NOT NULL,
    notes TEXT,
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    gps_accuracy_meters NUMERIC(6, 2),
    synced_from_offline BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 6. Credit Protection (PMFBY) & Crop Loss Cases
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS credit_protection_cases (
    id VARCHAR(64) PRIMARY KEY,
    loan_id VARCHAR(64) NOT NULL REFERENCES loans(id),
    farmer_id VARCHAR(64) NOT NULL REFERENCES farmers(id),
    farmer_name VARCHAR(128) NOT NULL,
    loss_cause VARCHAR(64) NOT NULL CHECK (loss_cause IN ('Unseasonal Rainfall', 'Localized Flood', 'Severe Drought Dry Spell', 'Pest Outbreak (Fall Armyworm/Blast)', 'Hailstorm')),
    incident_date DATE NOT NULL,
    intimated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    hours_to_intimation NUMERIC(5, 1) NOT NULL,
    estimated_damage_pct INTEGER NOT NULL CHECK (estimated_damage_pct BETWEEN 1 AND 100),
    surveyor_status VARCHAR(32) NOT NULL DEFAULT 'Assigned' CHECK (surveyor_status IN ('Intimated', 'Assigned', 'Survey_Completed', 'Approved', 'Restructuring_Initiated', 'Restructured')),
    surveyor_name VARCHAR(128),
    survey_date DATE,
    actual_assessed_damage_pct INTEGER,
    recommended_relief_amount NUMERIC(12, 2) DEFAULT 0,
    restructuring_recommended BOOLEAN DEFAULT FALSE,
    new_moratorium_months INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 7. Digital Personal Data Protection (DPDP) Consent Records
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS consent_records (
    id VARCHAR(64) PRIMARY KEY,
    farmer_id VARCHAR(64) NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    purpose VARCHAR(64) NOT NULL CHECK (purpose IN ('CREDIT_APPRAISAL', 'INSURANCE_PMFBY_UNDERWRITING', 'WEATHER_ADVISORY_SMS', 'CROSS_SELL_SCHEMES')),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'WITHDRAWN', 'EXPIRED')),
    consent_language VARCHAR(8) NOT NULL DEFAULT 'en',
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    withdrawn_at TIMESTAMP WITH TIME ZONE,
    expiry_date DATE NOT NULL,
    captured_by_officer_id VARCHAR(64) REFERENCES users(id),
    ip_or_device_id VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 8. Data Access & Correction Audit Records (DPDP)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS data_access_logs (
    id VARCHAR(64) PRIMARY KEY,
    farmer_id VARCHAR(64) NOT NULL REFERENCES farmers(id),
    accessed_by_user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    officer_name VARCHAR(128) NOT NULL,
    officer_role VARCHAR(32) NOT NULL,
    access_purpose VARCHAR(128) NOT NULL,
    access_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_correction_requests (
    id VARCHAR(64) PRIMARY KEY,
    farmer_id VARCHAR(64) NOT NULL REFERENCES farmers(id),
    field_name VARCHAR(64) NOT NULL,
    requested_value TEXT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reviewed_by_user_id VARCHAR(64) REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 9. Offline Synchronization Queue & Conflict Ledger
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS offline_sync_events (
    id VARCHAR(64) PRIMARY KEY,
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    officer_id VARCHAR(64) NOT NULL REFERENCES users(id),
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    action VARCHAR(32) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    payload_json JSONB NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SYNCING', 'SYNCED', 'FAILED', 'CONFLICT', 'RETRIED')),
    retry_count INTEGER NOT NULL DEFAULT 0,
    conflict_reason TEXT,
    resolved_by_user_id VARCHAR(64) REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMP WITH TIME ZONE
);

-- --------------------------------------------------------------------
-- 10. Notifications & Follow-Up Reminders
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    recipient_role VARCHAR(32) NOT NULL DEFAULT 'ALL',
    recipient_user_id VARCHAR(64) REFERENCES users(id),
    category VARCHAR(64) NOT NULL CHECK (category IN ('UPCOMING_REPAYMENT', 'FIELD_VISIT_DUE', 'MISSING_DOCUMENT', 'CROP_LOSS_REPORT', 'INSURANCE_DEADLINE', 'CONSENT_EXPIRY', 'FAILED_SYNC', 'MANAGER_APPROVAL', 'FARMER_FOLLOW_UP')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    language VARCHAR(8) NOT NULL DEFAULT 'en',
    channel VARCHAR(32) NOT NULL DEFAULT 'IN_APP' CHECK (channel IN ('IN_APP', 'SIMULATED_SMS', 'SIMULATED_EMAIL', 'SIMULATED_WHATSAPP')),
    delivery_status VARCHAR(32) NOT NULL DEFAULT 'QUEUED' CHECK (delivery_status IN ('QUEUED', 'SENT', 'DELIVERED', 'FAILED')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 11. Tamper-Evident Hash-Chained Audit Trail
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_events (
    id VARCHAR(64) PRIMARY KEY,
    sequence_num BIGSERIAL,
    action VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    user_role VARCHAR(32) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    previous_status VARCHAR(64) DEFAULT '-',
    new_status VARCHAR(64) DEFAULT '-',
    notes TEXT,
    prev_hash VARCHAR(64) NOT NULL,
    hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 12. Pilot Evaluation Study Tables (Brooke SUS 1986)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pilot_study_participants (
    id VARCHAR(64) PRIMARY KEY,
    participant_type VARCHAR(64) NOT NULL CHECK (participant_type IN ('Field Officer', 'Branch Manager', 'Agricultural Borrower', 'Compliance Auditor')),
    role_group VARCHAR(64) NOT NULL,
    preferred_language VARCHAR(8) NOT NULL DEFAULT 'kn',
    digital_literacy VARCHAR(32) NOT NULL CHECK (digital_literacy IN ('Low', 'Moderate', 'High')),
    informed_consent_signed BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pilot_study_tasks (
    id VARCHAR(64) PRIMARY KEY,
    participant_id VARCHAR(64) NOT NULL REFERENCES pilot_study_participants(id) ON DELETE CASCADE,
    task_code VARCHAR(32) NOT NULL CHECK (task_code IN ('T1_FARMER_REG', 'T2_FIELD_VISIT', 'T3_LOAN_REVIEW', 'T4_HARVEST_PLAN', 'T5_CROP_LOSS', 'T6_LANG_SEARCH')),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    completion_time TIMESTAMP WITH TIME ZONE NOT NULL,
    elapsed_seconds NUMERIC(8, 2) NOT NULL,
    error_count INTEGER NOT NULL DEFAULT 0,
    assistance_required BOOLEAN NOT NULL DEFAULT FALSE,
    task_status VARCHAR(32) NOT NULL DEFAULT 'SUCCESS' CHECK (task_status IN ('SUCCESS', 'ABANDONED', 'TIMED_OUT')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pilot_study_surveys (
    id VARCHAR(64) PRIMARY KEY,
    participant_id VARCHAR(64) NOT NULL REFERENCES pilot_study_participants(id) ON DELETE CASCADE,
    language VARCHAR(8) NOT NULL DEFAULT 'kn',
    sus_responses JSONB NOT NULL, -- Array of 10 ratings (1-5)
    sus_composite_score NUMERIC(5, 2) NOT NULL,
    sus_grade VARCHAR(8) NOT NULL,
    comprehension_rating INTEGER CHECK (comprehension_rating BETWEEN 1 AND 5),
    trust_rating INTEGER CHECK (trust_rating BETWEEN 1 AND 5),
    resilience_clarity_rating INTEGER CHECK (resilience_clarity_rating BETWEEN 1 AND 5),
    qualitative_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for high-frequency queries
CREATE INDEX IF NOT EXISTS idx_farmers_village ON farmers(village);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_repayments_due_date ON repayments(due_date);
CREATE INDEX IF NOT EXISTS idx_audit_sequence ON audit_events(sequence_num);
CREATE INDEX IF NOT EXISTS idx_sync_status ON offline_sync_events(status);
CREATE INDEX IF NOT EXISTS idx_consent_farmer ON consent_records(farmer_id);
