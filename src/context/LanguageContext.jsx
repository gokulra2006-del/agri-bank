import React, { createContext, useContext, useState, useEffect } from 'react';
import { t as translate, SUPPORTED_LANGUAGES, DICTIONARIES } from '../utils/i18n';
import { getSettings, saveSettings } from '../data/mockStore';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const initialSettings = getSettings();
  const [currentLang, setCurrentLangState] = useState(initialSettings.language || 'en');
  const [langToast, setLangToast] = useState(null);

  // Sync document lang, direction and fonts
  useEffect(() => {
    document.documentElement.lang = currentLang;
    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLang);
    document.documentElement.dir = (langObj && langObj.dir) || 'ltr';
  }, [currentLang]);

  const setLanguage = (langCode) => {
    const validLang = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
    if (!validLang) return;

    setCurrentLangState(langCode);

    // Persist to storage
    const current = getSettings();
    saveSettings({ ...current, language: langCode });

    // Show friendly temporary notification banner
    const langName = validLang.native || validLang.label;
    setLangToast(`Language switched to ${langName}`);
    setTimeout(() => {
      setLangToast(null);
    }, 3000);
  };

  const t = (key, vars = {}) => {
    return translate(key, vars, currentLang);
  };

  return (
    <LanguageContext.Provider value={{ currentLang, setLanguage, t, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {langToast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#15803d',
            color: '#ffffff',
            padding: '0.625rem 1rem',
            borderRadius: '6px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <span>✓</span>
          <span>{langToast}</span>
        </div>
      )}
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback for non-provider usage (e.g. headless tests)
    return {
      currentLang: 'en',
      setLanguage: () => {},
      t: (key, vars = {}) => translate(key, vars, 'en'),
      supportedLanguages: SUPPORTED_LANGUAGES
    };
  }
  return context;
}
