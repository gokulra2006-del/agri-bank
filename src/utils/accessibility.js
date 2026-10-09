// Pure Accessibility and Native Speech Synthesis Utility for AgriSahay
// Uses browser-native Web Speech API (speechSynthesis) only. Zero external dependencies or network APIs.

export const BCP47_VOICE_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  ml: 'ml-IN',
  gu: 'gu-IN',
  pa: 'pa-IN'
};

export function getIndicSpeechVoiceTag(langCode = 'en') {
  return BCP47_VOICE_MAP[langCode] || 'en-IN';
}

/**
 * Reads aloud text in the target language using browser Web Speech API.
 * @param {string} text - Text to speak
 * @param {string} langCode - Language code ('en', 'hi', 'kn', etc.)
 * @param {Function} onStatus - Callback for status updates
 */
export function speakText(text, langCode = 'en', onStatus = null) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onStatus) onStatus({ supported: false, message: 'Web Speech API is not supported in this browser environment.' });
    return false;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  if (!text || text.trim() === '') return false;

  const utterance = new SpeechSynthesisUtterance(text);
  const targetTag = BCP47_VOICE_MAP[langCode] || 'en-IN';
  utterance.lang = targetTag;
  utterance.rate = 0.95; // Slightly slower, clearer speech for rural accessibility

  // Attempt to locate a matched voice
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang === targetTag || v.lang.startsWith(langCode));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onstart = () => {
    if (onStatus) onStatus({ isSpeaking: true, message: 'Speaking...' });
  };

  utterance.onend = () => {
    if (onStatus) onStatus({ isSpeaking: false, message: 'Finished.' });
  };

  utterance.onerror = (e) => {
    if (onStatus) {
      onStatus({
        isSpeaking: false,
        error: true,
        message: 'Speech synthesis encountered an issue or native language voice is not installed on your operating system.'
      });
    }
  };

  try {
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    if (onStatus) onStatus({ isSpeaking: false, error: true, message: err.message });
    return false;
  }
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Plain-language rural glossary definitions for "Explain this term" buttons.
 */
export const RURAL_BANKING_TERMS = {
  loan: {
    term: 'Loan (ಸಾಲ / कर्ज)',
    explanation: 'Money provided by the bank for your crop cultivation that is returned after harvest.',
    simpleAnalogy: 'Like advance water or seed given upfront to harvest your crop, returned with a small agreed fee.'
  },
  interest: {
    term: 'Interest Rate (ಬಡ್ಡಿ / ब्याज)',
    explanation: 'A transparent small percentage charged by the bank for using the money during the crop season.',
    simpleAnalogy: 'The subsidized cost of renting funds for 6-12 months (e.g. ₹7 per year for every ₹100).'
  },
  emi: {
    term: 'EMI / Installment (ಕಂತು / किस्त)',
    explanation: 'A scheduled payment. In AgriSahay, installments are harvest-linked so you pay only after Mandi sales.',
    simpleAnalogy: 'Payment scheduled on your crop arrival date, not during vegetative growing months.'
  },
  insurance: {
    term: 'Crop Insurance (PMFBY) (ವಿಮೆ / फसल बीमा)',
    explanation: 'Protection scheme where if flood, drought or pests damage your crop, you receive money for the loss.',
    simpleAnalogy: 'A security umbrella protecting your family if natural weather destroys the crop.'
  },
  claim: {
    term: 'Insurance Claim (ವಿಮಾ ಕ್ಲೇಮ್ / बीमा दावा)',
    explanation: 'A formal notification sent to the insurance company within 72 hours of flood or drought damage to get compensation.',
    simpleAnalogy: 'Reporting your damaged crop plot to the bank so surveyors can inspect and pay your relief.'
  },
  consent: {
    term: 'Consent (ಸಮ್ಮತಿ / सहमति)',
    explanation: 'Your explicit permission given to the bank under India’s DPDP Act to verify your land or Aadhaar.',
    simpleAnalogy: 'Your agreement before the bank opens or shares your farm details.'
  },
  collateral: {
    term: 'Collateral / Hypothecation (ಭದ್ರತೆ / बंधक)',
    explanation: 'Agricultural loans under ₹1.6 Lakh under RBI rules do not require land mortgage, only standing crop hypothecation.',
    simpleAnalogy: 'Security commitment that the harvest produce will service the bank advance.'
  },
  overdue: {
    term: 'Overdue (ಮೀರಿದ ದಿನಾಂಕ / अतिदेय)',
    explanation: 'When the agreed harvest payment date has passed without payment or without intimating a loss event.',
    simpleAnalogy: 'A deferred date where you should speak with your relationship officer for a moratorium.'
  }
};
