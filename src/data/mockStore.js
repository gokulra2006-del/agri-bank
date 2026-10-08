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
  VILLAGE_HEATMAPS: 'agrisahay_village_heatmaps'
};

const CURRENT_VERSION = '2.2';

// Safe storage initialization & migration
const checkStorageMigration = () => {
  try {
    const version = localStorage.getItem(STORAGE_KEYS.VERSION);
    if (!version || version !== CURRENT_VERSION) {
      localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
    }
  } catch (e) {
    console.error('Migration check error:', e);
  }
};
checkStorageMigration();

const getStorageItem = (key, defaultVal) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    console.error('LocalStorage read error:', e);
    return defaultVal;
  }
};

const setStorageItem = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
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

export const getClimateScenarios = () => INITIAL_CLIMATE_SCENARIOS;

export const getWeatherRisks = () => INITIAL_WEATHER_RISKS;

export const getSettings = () => getStorageItem(STORAGE_KEYS.SETTINGS, {
  language: 'en', // 'en', 'hi', 'kn', 'ta', 'te'
  demoRole: 'manager', // 'manager', 'officer', 'admin'
  isOfflineMode: false,
  activeBranchId: 'ALL',
  officerName: 'Gokul Sharma',
  officerRole: 'Agri Credit Processing Unit',
  emailAlerts: true,
  smsReminders: true
});
export const saveSettings = (settings) => setStorageItem(STORAGE_KEYS.SETTINGS, settings);

// Helper for resetting demo state
export const resetDemoData = () => {
  localStorage.removeItem(STORAGE_KEYS.FARMERS);
  localStorage.removeItem(STORAGE_KEYS.LOANS);
  localStorage.removeItem(STORAGE_KEYS.REPAYMENTS);
  localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
  localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  localStorage.removeItem(STORAGE_KEYS.BRANCHES);
  localStorage.removeItem(STORAGE_KEYS.STAFF);
  localStorage.removeItem(STORAGE_KEYS.FIELD_VISITS);
  localStorage.removeItem(STORAGE_KEYS.COMMUNICATIONS);
  localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
  localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.VERSION);
  window.location.reload();
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
