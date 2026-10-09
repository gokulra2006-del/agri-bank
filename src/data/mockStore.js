// LocalStorage backed reactive mock data store for AgriSahay

import {
  INITIAL_BRANCHES,
  INITIAL_STAFF,
  INITIAL_FARMERS,
  INITIAL_LOANS,
  INITIAL_REPAYMENTS,
  INITIAL_DOCUMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_FIELD_VISITS,
  INITIAL_COMMUNICATIONS,
  INITIAL_WEATHER_RISKS,
  INITIAL_VILLAGE_HEATMAPS,
  INITIAL_ASSISTANCE_TRACKER,
  INITIAL_CLIMATE_SCENARIOS,
  INITIAL_CREDIT_CLAIMS,
  INITIAL_SYNC_CONFLICTS,
  INITIAL_TRANSLATION_REVIEWS,
  CROP_CALENDAR,
  GOV_SCHEMES
} from './mockData.js';

const STORAGE_KEYS = {
  VERSION: 'agrisahay_storage_version',
  FARMERS: 'agrisahay_farmers',
  LOANS: 'agrisahay_loans',
  REPAYMENTS: 'agrisahay_repayments',
  DOCUMENTS: 'agrisahay_documents',
  NOTIFICATIONS: 'agrisahay_notifications',
  BRANCHES: 'agrisahay_branches',
  STAFF: 'agrisahay_staff',
  FIELD_VISITS: 'agrisahay_field_visits',
  COMMUNICATIONS: 'agrisahay_communications',
  OFFLINE_QUEUE: 'agrisahay_offline_queue',
  SETTINGS: 'agrisahay_settings',
  AUDIT_LOGS: 'agrisahay_audit_logs',
  ASSISTANCE_TRACKER: 'agrisahay_assistance_tracker',
  VILLAGE_HEATMAPS: 'agrisahay_village_heatmaps',
  CONSENT_RECORDS: 'agrisahay_consent_records',
  CREDIT_CLAIMS: 'agrisahay_credit_protection_claims',
  CROP_LOSS_EVENTS: 'agrisahay_crop_loss_events',
  SYNC_CONFLICTS: 'agrisahay_sync_conflicts',
  STUDY_PARTICIPANTS: 'agrisahay_study_participants',
  STUDY_TIMINGS: 'agrisahay_study_task_timings',
  STUDY_SURVEYS: 'agrisahay_study_surveys',
  STUDY_SAMPLE_ACTIVE: 'agrisahay_study_sample_active',
  TRANSLATION_REVIEWS: 'agrisahay_translation_reviews',
  RESILIENCE_OVERRIDES: 'agrisahay_resilience_overrides',
  ACCESSIBILITY_SETTINGS: 'agrisahay_accessibility_settings',
  DATA_ACCESS_LOG: 'agrisahay_data_access_log',
  DATA_CORRECTION_REQUESTS: 'agrisahay_data_correction_requests'
};

const CURRENT_VERSION = '6.0';

// Safe storage initialization & migration
const checkStorageMigration = () => {
  try {
    if (typeof localStorage === 'undefined') return;
    const version = localStorage.getItem(STORAGE_KEYS.VERSION);
    if (!version || version !== CURRENT_VERSION) {
      // Clear legacy/incompatible storage from previous phases
      try {
        localStorage.clear();
      } catch (clearErr) {
        Object.values(STORAGE_KEYS).forEach(k => {
          try { localStorage.removeItem(k); } catch (e) {}
        });
      }
      localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
    }
  } catch (e) {
    console.error('Migration check error:', e);
  }
};
checkStorageMigration();

const getStorageItem = (key, defaultVal) => {
  try {
    if (typeof localStorage === 'undefined') return defaultVal;
    const item = localStorage.getItem(key);
    if (!item) return defaultVal;
    const parsed = JSON.parse(item);
    // Sanity check: if default is array, parsed must be array
    if (Array.isArray(defaultVal) && !Array.isArray(parsed)) {
      setStorageItem(key, defaultVal);
      return defaultVal;
    }
    return parsed;
  } catch (e) {
    console.error('LocalStorage read error (auto-healing):', e);
    // Auto-heal corrupt storage
    try {
      setStorageItem(key, defaultVal);
    } catch (saveErr) { /* ignore */ }
    return defaultVal;
  }
};

const setStorageItem = (key, val) => {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
};

export const STORES = { ...STORAGE_KEYS };

export const loadStore = (key, defaultVal = null) => {
  const storageKey = STORAGE_KEYS[key] || key;
  return getStorageItem(storageKey, defaultVal);
};

export const updateStore = (key, val) => {
  const storageKey = STORAGE_KEYS[key] || key;
  setStorageItem(storageKey, val);
};

export const getFarmers = () => getStorageItem(STORAGE_KEYS.FARMERS, INITIAL_FARMERS);
export const saveFarmers = (farmers) => setStorageItem(STORAGE_KEYS.FARMERS, farmers);

export const getLoans = () => getStorageItem(STORAGE_KEYS.LOANS, INITIAL_LOANS);
export const saveLoans = (loans) => setStorageItem(STORAGE_KEYS.LOANS, loans);

export const getRepayments = () => getStorageItem(STORAGE_KEYS.REPAYMENTS, INITIAL_REPAYMENTS);
export const saveRepayments = (repayments) => setStorageItem(STORAGE_KEYS.REPAYMENTS, repayments);

export const getDocuments = () => getStorageItem(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
export const saveDocuments = (docs) => setStorageItem(STORAGE_KEYS.DOCUMENTS, docs);

export const getNotifications = () => getStorageItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
export const saveNotifications = (notifs) => setStorageItem(STORAGE_KEYS.NOTIFICATIONS, notifs);

export const getBranches = () => getStorageItem(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES);
export const getStaff = () => getStorageItem(STORAGE_KEYS.STAFF, INITIAL_STAFF);

export const getFieldVisits = () => getStorageItem(STORAGE_KEYS.FIELD_VISITS, INITIAL_FIELD_VISITS);
export const saveFieldVisits = (visits) => setStorageItem(STORAGE_KEYS.FIELD_VISITS, visits);

export const getCommunications = () => getStorageItem(STORAGE_KEYS.COMMUNICATIONS, INITIAL_COMMUNICATIONS);
export const saveCommunications = (comms) => setStorageItem(STORAGE_KEYS.COMMUNICATIONS, comms);

export const getOfflineQueue = () => getStorageItem(STORAGE_KEYS.OFFLINE_QUEUE, []);
export const saveOfflineQueue = (queue) => setStorageItem(STORAGE_KEYS.OFFLINE_QUEUE, queue);

export const getAssistanceTracker = () => getStorageItem(STORAGE_KEYS.ASSISTANCE_TRACKER, INITIAL_ASSISTANCE_TRACKER);
export const saveAssistanceTracker = (list) => setStorageItem(STORAGE_KEYS.ASSISTANCE_TRACKER, list);

export const getVillageHeatmaps = () => getStorageItem(STORAGE_KEYS.VILLAGE_HEATMAPS, INITIAL_VILLAGE_HEATMAPS);
export const saveVillageHeatmaps = (maps) => setStorageItem(STORAGE_KEYS.VILLAGE_HEATMAPS, maps);

export const getConsentRecords = () => getStorageItem(STORAGE_KEYS.CONSENT_RECORDS, {});
export const saveConsentRecords = (records) => setStorageItem(STORAGE_KEYS.CONSENT_RECORDS, records);

export const getCreditClaims = () => getStorageItem(STORAGE_KEYS.CREDIT_CLAIMS, INITIAL_CREDIT_CLAIMS);
export const saveCreditClaims = (claims) => setStorageItem(STORAGE_KEYS.CREDIT_CLAIMS, claims);

export const getCropLossEvents = () => getStorageItem(STORAGE_KEYS.CROP_LOSS_EVENTS, []);
export const saveCropLossEvents = (events) => setStorageItem(STORAGE_KEYS.CROP_LOSS_EVENTS, events);

export const getSyncConflicts = () => getStorageItem(STORAGE_KEYS.SYNC_CONFLICTS, INITIAL_SYNC_CONFLICTS);
export const saveSyncConflicts = (conflicts) => setStorageItem(STORAGE_KEYS.SYNC_CONFLICTS, conflicts);

export const getStudyParticipants = () => getStorageItem(STORAGE_KEYS.STUDY_PARTICIPANTS, []);
export const saveStudyParticipants = (p) => setStorageItem(STORAGE_KEYS.STUDY_PARTICIPANTS, p);

export const getStudyTimings = () => getStorageItem(STORAGE_KEYS.STUDY_TIMINGS, []);
export const saveStudyTimings = (t) => setStorageItem(STORAGE_KEYS.STUDY_TIMINGS, t);

export const getStudySurveys = () => getStorageItem(STORAGE_KEYS.STUDY_SURVEYS, []);
export const saveStudySurveys = (s) => setStorageItem(STORAGE_KEYS.STUDY_SURVEYS, s);

export const isStudySampleActive = () => getStorageItem(STORAGE_KEYS.STUDY_SAMPLE_ACTIVE, false);
export const setStudySampleActive = (bool) => setStorageItem(STORAGE_KEYS.STUDY_SAMPLE_ACTIVE, Boolean(bool));

export const clearStudyData = () => {
  setStorageItem(STORAGE_KEYS.STUDY_PARTICIPANTS, []);
  setStorageItem(STORAGE_KEYS.STUDY_TIMINGS, []);
  setStorageItem(STORAGE_KEYS.STUDY_SURVEYS, []);
  setStorageItem(STORAGE_KEYS.STUDY_SAMPLE_ACTIVE, false);
};

export const getTranslationReviews = () => getStorageItem(STORAGE_KEYS.TRANSLATION_REVIEWS, INITIAL_TRANSLATION_REVIEWS);
export const saveTranslationReviews = (r) => setStorageItem(STORAGE_KEYS.TRANSLATION_REVIEWS, r);

export const getResilienceOverrides = () => getStorageItem(STORAGE_KEYS.RESILIENCE_OVERRIDES, {});
export const saveResilienceOverrides = (o) => setStorageItem(STORAGE_KEYS.RESILIENCE_OVERRIDES, o);

export const getAccessibilitySettings = () => {
  const defaults = {
    textSize: 'normal',
    fontSize: 'normal',
    highContrast: false,
    reducedMotion: false,
    lowBandwidthMode: false,
    farmerHelpMode: false,
    voiceSpeechEnabled: true
  };
  const val = getStorageItem(STORAGE_KEYS.ACCESSIBILITY_SETTINGS, defaults);
  return { ...defaults, ...(val && typeof val === 'object' ? val : {}) };
};
export const saveAccessibilitySettings = (s) => setStorageItem(STORAGE_KEYS.ACCESSIBILITY_SETTINGS, s);

export const getDataAccessLog = () => getStorageItem(STORAGE_KEYS.DATA_ACCESS_LOG, [
  { id: 'DAL-01', farmerId: 'FAR-001', accessedBy: 'Ramesh Kumar (ARO)', role: 'officer', timestamp: new Date(Date.now() - 3600000).toISOString(), purpose: 'KCC Pre-Disbursal Land Inspection' },
  { id: 'DAL-02', farmerId: 'FAR-006', accessedBy: 'Suresh Gowda (BM)', role: 'manager', timestamp: new Date(Date.now() - 7200000).toISOString(), purpose: 'Credit Sanction Committee Review' }
]);

export const logDataAccess = ({ farmerId, accessedBy, role, purpose }) => {
  try {
    const existing = getDataAccessLog();
    const entry = {
      id: `DAL-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      farmerId,
      accessedBy,
      role,
      timestamp: new Date().toISOString(),
      purpose: purpose || 'Operational File Review'
    };
    const updated = [entry, ...existing].slice(0, 300);
    setStorageItem(STORAGE_KEYS.DATA_ACCESS_LOG, updated);
  } catch (e) { /* ignore */ }
};

export const getDataCorrections = () => getStorageItem(STORAGE_KEYS.DATA_CORRECTION_REQUESTS, [
  {
    id: 'CORR-01',
    farmerId: 'FAR-002',
    farmerName: 'Lakshmi Devi',
    field: 'Land Survey Number',
    requestedCorrection: 'Correction from 41/A to 41/B per updated Patta Bhoomi passbook',
    status: 'Pending Verification',
    raisedBy: 'Lakshmi Devi (Farmer)',
    raisedAt: '2026-08-20'
  }
]);
export const saveDataCorrections = (corrections) => setStorageItem(STORAGE_KEYS.DATA_CORRECTION_REQUESTS, corrections);

export const getClimateScenarios = () => INITIAL_CLIMATE_SCENARIOS;
export const getWeatherRisks = () => INITIAL_WEATHER_RISKS;

export const getSettings = () => {
  const defaults = {
    language: 'en',
    demoRole: 'manager',
    isOfflineMode: false,
    activeBranchId: 'ALL',
    officerName: 'Gokul Sharma',
    officerRole: 'Agri Credit Processing Unit',
    emailAlerts: true,
    smsReminders: true
  };
  const val = getStorageItem(STORAGE_KEYS.SETTINGS, defaults);
  return { ...defaults, ...(val && typeof val === 'object' ? val : {}) };
};
export const saveSettings = (settings) => setStorageItem(STORAGE_KEYS.SETTINGS, settings);

// Helper for resetting demo state
export const resetDemoData = () => {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.clear();
    } catch (clearErr) {}
    Object.values(STORAGE_KEYS).forEach(k => {
      try {
        localStorage.removeItem(k);
      } catch (e) { /* ignore */ }
    });
  }
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
};

// Scale of Finance & Assessment Rule Engine
export const calculateAgriEligibility = ({ landSize, crop, annualIncome, alliedIncome = 0, existingLoanBurden = 0 }) => {
  const cropInfo = CROP_CALENDAR.find(c => c.cropName.toLowerCase().includes((crop || '').toLowerCase())) || {
    scaleOfFinancePerAcre: 35000,
    cropName: crop || 'General Agricultural'
  };

  const scalePerAcre = cropInfo.scaleOfFinancePerAcre;
  const baseScaleLoan = Math.round(Number(landSize || 0) * scalePerAcre);
  
  // RBI KCC Guidelines: 10% towards post-harvest/household + 20% maintenance
  const kccBuffer = Math.round(baseScaleLoan * 0.30);
  const rawEligibleAmount = baseScaleLoan + kccBuffer;

  const totalHouseholdIncome = Number(annualIncome || 0) + Number(alliedIncome || 0);
  const burden = Number(existingLoanBurden || 0);
  
  // Net cash flow available for debt servicing (assumed 50% max safe FOIR - Fixed Obligation to Income Ratio)
  const maxRepaymentCapacity = Math.max(0, Math.round(totalHouseholdIncome * 0.5) - burden);
  
  const recommendedLoan = Math.min(rawEligibleAmount, maxRepaymentCapacity > 0 ? maxRepaymentCapacity * 2 : rawEligibleAmount);

  let riskCategory = 'Low Risk';
  let riskColor = 'green';
  let reasons = [];

  const incomeToLoanRatio = totalHouseholdIncome > 0 ? (recommendedLoan / totalHouseholdIncome).toFixed(2) : 0;

  if (burden > totalHouseholdIncome * 0.4) {
    riskCategory = 'Requires Manual Review';
    riskColor = 'red';
    reasons.push('High prior debt burden exceeds 40% of annual farm income.');
  } else if (Number(landSize) < 1.0 && burden > 20000) {
    riskCategory = 'Medium Risk';
    riskColor = 'amber';
    reasons.push('Marginal landholding under 1 acre with outstanding liabilities.');
  } else if (incomeToLoanRatio > 1.2) {
    riskCategory = 'Medium Risk';
    riskColor = 'amber';
    reasons.push('Proposed loan amount exceeds 120% of net annual agricultural income.');
  } else {
    reasons.push('Sufficient land backing, safe debt-to-income margin, and Scale of Finance conformity.');
  }

  return {
    cropName: cropInfo.cropName,
    scalePerAcre,
    baseScaleLoan,
    kccBuffer,
    rawEligibleAmount,
    totalHouseholdIncome,
    existingLoanBurden: burden,
    maxRepaymentCapacity,
    recommendedLoan,
    incomeToLoanRatio,
    riskCategory,
    riskColor,
    reasons
  };
};

export const formatINR = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN');
};

export const maskAadhaar = (val) => {
  if (!val) return 'XXXX-XXXX-0000';
  const clean = String(val).replace(/[^0-9]/g, '');
  if (clean.length >= 4) {
    const last4 = clean.slice(-4);
    return `XXXX-XXXX-${last4}`;
  }
  return 'XXXX-XXXX-8921';
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch (e) {
    return dateStr;
  }
};
