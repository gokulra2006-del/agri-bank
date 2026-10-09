// Database Connection and Fallback Layer
import { config } from '../config/config.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// In-Memory Relational Engine for Standalone / Demo Pilot Run
class MemoryDatabase {
  constructor() {
    this.tables = {
      users: [],
      farmers: [],
      loans: [],
      repayments: [],
      field_visits: [],
      credit_protection_cases: [],
      consent_records: [],
      data_access_logs: [],
      data_correction_requests: [],
      offline_sync_events: [],
      notifications: [],
      audit_events: [],
      pilot_study_participants: [],
      pilot_study_tasks: [],
      pilot_study_surveys: []
    };
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;
    
    // Seed initial users with bcrypt hashed passwords
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Bank@123', salt);

    this.tables.users = [
      { id: 'USR-001', username: 'manager', email: 'manager@agribank.demo', password_hash: defaultPasswordHash, full_name: 'Suresh Gowda', role: 'BRANCH_MANAGER', branch_id: 'BR-MANDYA', is_active: true },
      { id: 'USR-002', username: 'officer', email: 'officer@agribank.demo', password_hash: defaultPasswordHash, full_name: 'Gokul Sharma', role: 'RELATIONSHIP_OFFICER', branch_id: 'BR-MANDYA', is_active: true },
      { id: 'USR-003', username: 'admin', email: 'admin@agribank.demo', password_hash: defaultPasswordHash, full_name: 'Pooja Hegde', role: 'ADMIN', branch_id: 'BR-HQ', is_active: true },
      { id: 'USR-004', username: 'auditor', email: 'auditor@agribank.demo', password_hash: defaultPasswordHash, full_name: 'R. K. Verma', role: 'AUDITOR', branch_id: 'BR-AUDIT', is_active: true },
      { id: 'USR-005', username: 'researcher', email: 'researcher@agribank.demo', password_hash: defaultPasswordHash, full_name: 'Dr. Ananya Rao', role: 'RESEARCHER', branch_id: 'BR-RESEARCH', is_active: true }
    ];

    // Seed baseline farmers
    this.tables.farmers = [
      {
        id: 'FAR-001',
        name: 'Basavaraj Patil',
        gender: 'Male',
        village: 'Kikkeri',
        taluk: 'K.R. Pet',
        district: 'Mandya',
        state: 'Karnataka',
        phone: '9845123456',
        aadhaar_masked: 'XXXX-XXXX-8921',
        land_size_acres: 4.5,
        land_type: 'Canal Irrigated',
        primary_crop: 'Sugarcane',
        secondary_crop: 'Paddy',
        annual_income: 380000,
        allied_income: 72000,
        rainfall_zone: 'Medium',
        soil_card_issued: true,
        pmfby_enrolled: true,
        resilience_score: 88,
        resilience_confidence: 90,
        resilience_category: 'High Resilience (Climate-Safe)',
        version: 1,
        created_at: new Date('2025-01-10').toISOString()
      },
      {
        id: 'FAR-002',
        name: 'Mallamma Gowda',
        gender: 'Female',
        village: 'Aladahalli',
        taluk: 'Maddur',
        district: 'Mandya',
        state: 'Karnataka',
        phone: '9448234567',
        aadhaar_masked: 'XXXX-XXXX-4512',
        land_size_acres: 1.8,
        land_type: 'Rainfed',
        primary_crop: 'Ragi',
        secondary_crop: 'None',
        annual_income: 140000,
        allied_income: 18000,
        rainfall_zone: 'Low',
        soil_card_issued: false,
        pmfby_enrolled: false,
        resilience_score: 42,
        resilience_confidence: 80,
        resilience_category: 'Vulnerable (Safeguards Required)',
        version: 1,
        created_at: new Date('2025-01-12').toISOString()
      },
      {
        id: 'FAR-003',
        name: 'Channappa Gowda',
        gender: 'Male',
        village: 'Bellur Cross',
        taluk: 'Nagamangala',
        district: 'Mandya',
        state: 'Karnataka',
        phone: '9900345678',
        aadhaar_masked: 'XXXX-XXXX-6734',
        land_size_acres: 3.2,
        land_type: 'Borewell Irrigated',
        primary_crop: 'Paddy',
        secondary_crop: 'Maize',
        annual_income: 260000,
        allied_income: 45000,
        rainfall_zone: 'Medium',
        soil_card_issued: true,
        pmfby_enrolled: true,
        resilience_score: 76,
        resilience_confidence: 90,
        resilience_category: 'High Resilience (Climate-Safe)',
        version: 1,
        created_at: new Date('2025-01-15').toISOString()
      }
    ];

    // Seed baseline loans
    this.tables.loans = [
      {
        id: 'LN-2025-001',
        farmer_id: 'FAR-001',
        farmer_name: 'Basavaraj Patil',
        loan_type: 'Kisan Credit Card (Crop Loan)',
        crop: 'Sugarcane',
        acreage: 4.5,
        scale_of_finance_per_acre: 45000,
        applied_amount: 200000,
        sanctioned_amount: 200000,
        interest_rate: 7.0,
        tenure_months: 12,
        status: 'Disbursed',
        sowing_date: '2025-02-15',
        expected_harvest_date: '2025-12-20',
        repayment_model: 'BULLET_POST_HARVEST',
        maker_officer_id: 'USR-002',
        checker_manager_id: 'USR-001',
        sanction_date: new Date('2025-02-20').toISOString(),
        disbursal_date: new Date('2025-02-22').toISOString(),
        version: 1,
        created_at: new Date('2025-02-18').toISOString()
      },
      {
        id: 'LN-2025-002',
        farmer_id: 'FAR-002',
        farmer_name: 'Mallamma Gowda',
        loan_type: 'Kisan Credit Card (Crop Loan)',
        crop: 'Ragi',
        acreage: 1.8,
        scale_of_finance_per_acre: 28000,
        applied_amount: 50000,
        sanctioned_amount: 0,
        interest_rate: 7.0,
        tenure_months: 6,
        status: 'Submitted',
        sowing_date: '2025-06-10',
        expected_harvest_date: '2025-10-30',
        repayment_model: 'BULLET_POST_HARVEST',
        maker_officer_id: 'USR-002',
        version: 1,
        created_at: new Date('2025-06-15').toISOString()
      }
    ];

    // Seed repayments
    this.tables.repayments = [
      {
        id: 'REP-001',
        loan_id: 'LN-2025-001',
        installment_number: 1,
        due_date: '2026-01-05',
        principal_due: 200000,
        interest_due: 12219,
        total_due: 212219,
        amount_paid: 0,
        payment_status: 'Upcoming',
        stage_label: 'Post-Harvest Mandi Realization',
        created_at: new Date().toISOString()
      }
    ];

    // Seed consent records
    this.tables.consent_records = [
      {
        id: 'CNS-001',
        farmer_id: 'FAR-001',
        purpose: 'CREDIT_APPRAISAL',
        status: 'ACTIVE',
        consent_language: 'kn',
        granted_at: new Date('2025-01-10').toISOString(),
        expiry_date: '2027-01-10',
        captured_by_officer_id: 'USR-002',
        ip_or_device_id: 'TAB-MANDYA-04'
      },
      {
        id: 'CNS-002',
        farmer_id: 'FAR-001',
        purpose: 'INSURANCE_PMFBY_UNDERWRITING',
        status: 'ACTIVE',
        consent_language: 'kn',
        granted_at: new Date('2025-01-10').toISOString(),
        expiry_date: '2027-01-10',
        captured_by_officer_id: 'USR-002',
        ip_or_device_id: 'TAB-MANDYA-04'
      }
    ];

    // Seed notifications
    this.tables.notifications = [
      {
        id: 'NTF-001',
        recipient_role: 'BRANCH_MANAGER',
        category: 'MANAGER_APPROVAL',
        title: 'Loan Sanction Pending',
        message: 'Application LN-2025-002 for Mallamma Gowda (₹50,000) requires credit committee review.',
        language: 'en',
        channel: 'IN_APP',
        delivery_status: 'DELIVERED',
        is_read: false,
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'NTF-002',
        recipient_role: 'RELATIONSHIP_OFFICER',
        category: 'UPCOMING_REPAYMENT',
        title: 'Harvest Realization Follow-up',
        message: 'Sugarcane harvest window active for Basavaraj Patil. Verify Mandi APMC liquidation.',
        language: 'kn',
        channel: 'SIMULATED_SMS',
        delivery_status: 'SENT',
        is_read: false,
        created_at: new Date(Date.now() - 7200000).toISOString()
      }
    ];

    // Seed initial genesis audit event
    const genesisHash = '0000000000000000';
    const initAudit = {
      id: 'AUD-INIT-001',
      sequence_num: 1,
      action: 'SYSTEM_GENESIS_INITIALIZED',
      user_id: 'USR-003',
      user_role: 'ADMIN',
      entity_id: 'CORE-SYS',
      entity_type: 'System Infrastructure',
      previous_status: '-',
      new_status: 'Online',
      notes: 'AgriSahay Secure Relational Database initialized in demo fallback mode.',
      prev_hash: genesisHash,
      hash: '0005784df2af080f',
      created_at: new Date('2025-01-01T00:00:00Z').toISOString()
    };
    this.tables.audit_events.push(initAudit);

    this.isInitialized = true;
  }
}

export const memoryDb = new MemoryDatabase();

// Connect and initialize
export async function getDb() {
  await memoryDb.init();
  return memoryDb;
}
