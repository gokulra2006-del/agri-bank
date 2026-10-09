// Centralized I18n Engine for AgriSahay Banking
// Supports 10 Indian Languages: en, hi, kn, ta, te, mr, bn, ml, gu, pa
import { en } from '../locales/en.js';
import { hi } from '../locales/hi.js';
import { kn } from '../locales/kn.js';
import { ta } from '../locales/ta.js';
import { te } from '../locales/te.js';
import { mr } from '../locales/mr.js';
import { bn } from '../locales/bn.js';
import { ml } from '../locales/ml.js';
import { gu } from '../locales/gu.js';
import { pa } from '../locales/pa.js';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', dir: 'ltr' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी – Hindi', dir: 'ltr' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ – Kannada', dir: 'ltr' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ் – Tamil', dir: 'ltr' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు – Telugu', dir: 'ltr' },
  { code: 'mr', label: 'Marathi', native: 'मराठी – Marathi', dir: 'ltr' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা – Bengali', dir: 'ltr' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം – Malayalam', dir: 'ltr' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી – Gujarati', dir: 'ltr' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ – Punjabi', dir: 'ltr' }
];

export const DICTIONARIES = {
  en,
  hi,
  kn,
  ta,
  te,
  mr,
  bn,
  ml,
  gu,
  pa
};

// Track missing key warnings in development so we never spam the console
const warnedMissingKeys = new Set();

/**
 * Safely traverses an object given a dot-separated path (e.g. "dashboard.totalFarmers")
 */
function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

/**
 * Main translation function with fallback chain:
 * active language -> English fallback -> path key string
 * Supports variable interpolation {varName}
 */
export function t(key, vars = {}, lang = 'en') {
  if (!key) return '';

  let fallback = key;
  // If the second argument is a string (legacy call: t(key, lang) or fallback default text)
  if (typeof vars === 'string') {
    if (vars.length <= 5 && DICTIONARIES[vars]) {
      lang = vars;
      vars = {};
    } else {
      fallback = vars;
      vars = {};
    }
  }

  const activeDict = DICTIONARIES[lang] || DICTIONARIES.en;
  let text = getNestedValue(activeDict, key);

  // Fallback to English if missing in selected language
  if (text === undefined) {
    text = getNestedValue(DICTIONARIES.en, key);

    if (text === undefined) {
      // Key does not exist even in English dictionary
      try {
        const isDev = typeof process !== 'undefined' ? process.env?.NODE_ENV !== 'production' : false;
        if (isDev && !warnedMissingKeys.has(key)) {
          console.warn(`[i18n] Missing translation key: "${key}" in language "${lang}" and English fallback.`);
          warnedMissingKeys.add(key);
        }
      } catch (e) {
        // Safe in all browser and SSR environments
      }
      return fallback;
    }
  }

  // Interpolation: replace {variable} with provided values
  if (vars && typeof vars === 'object' && Object.keys(vars).length > 0) {
    return text.replace(/{([^{}]+)}/g, (match, varName) => {
      const trimmed = varName.trim();
      return vars[trimmed] !== undefined && vars[trimmed] !== null ? String(vars[trimmed]) : match;
    });
  }

  return text;
}

/**
 * Calculates translation completion metrics for each language against English master
 */
export function getLanguageCoverage() {
  const masterKeys = [];

  function collectKeys(obj, prefix = '') {
    for (const k in obj) {
      const fullPath = prefix ? `${prefix}.${k}` : k;
      if (typeof obj[k] === 'object' && obj[k] !== null) {
        collectKeys(obj[k], fullPath);
      } else {
        masterKeys.push(fullPath);
      }
    }
  }

  collectKeys(DICTIONARIES.en);
  const totalMaster = masterKeys.length;

  return SUPPORTED_LANGUAGES.map(lang => {
    if (lang.code === 'en') {
      return {
        ...lang,
        totalKeys: totalMaster,
        completedKeys: totalMaster,
        percentage: 100,
        missingKeys: [],
        reviewStatus: 'Approved (Master)'
      };
    }

    const dict = DICTIONARIES[lang.code] || {};
    let completed = 0;
    const missing = [];

    masterKeys.forEach(key => {
      const val = getNestedValue(dict, key);
      if (val !== undefined && val.trim() !== '') {
        completed++;
      } else {
        missing.push(key);
      }
    });

    const percentage = totalMaster > 0 ? Math.round((completed / totalMaster) * 100) : 0;
    const reviewStatus = percentage >= 95 ? 'Complete (Verified)' : 'Needs Native Speaker Review';

    return {
      ...lang,
      totalKeys: totalMaster,
      completedKeys: completed,
      percentage,
      missingKeys: missing,
      reviewStatus
    };
  });
}
