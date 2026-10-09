import React, { useState } from 'react';
import { Globe, CheckCircle2, AlertCircle, ArrowLeft, Layers, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { getLanguageCoverage, SUPPORTED_LANGUAGES, t } from '../utils/i18n';
import StatusBadge from '../components/StatusBadge';

export default function LanguagePreviewPage({ onNavigate }) {
  const { currentLang, setLanguage } = useTranslation();
  const [previewLang, setPreviewLang] = useState(currentLang);
  const coverageData = getLanguageCoverage();

  const activeCoverage = coverageData.find(c => c.code === previewLang) || coverageData[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button
            onClick={() => onNavigate && onNavigate('settings')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#1e3a8a',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 600,
              padding: 0,
              marginBottom: '0.5rem'
            }}
          >
            <ArrowLeft size={16} />
            {t('common.back', {}, currentLang)}
          </button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
            {t('languagePreview.title', {}, currentLang)}
          </h1>
          <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            {t('languagePreview.subtitle', {}, currentLang)}
          </p>
        </div>

        {/* Preview Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <Globe size={18} color="#15803d" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
            Inspect Script:
          </span>
          <select
            value={previewLang}
            onChange={(e) => setPreviewLang(e.target.value)}
            style={{
              padding: '0.35rem 0.6rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              border: '1px solid #94a3b8',
              borderRadius: '6px',
              backgroundColor: '#f8fafc'
            }}
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.native} ({lang.label})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Language Completion Status Matrix */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} color="#2563eb" />
          {t('languagePreview.coverageCardTitle', {}, currentLang)}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {coverageData.map((cov) => {
            const isInspected = cov.code === previewLang;
            const isCurrentApp = cov.code === currentLang;

            return (
              <div
                key={cov.code}
                onClick={() => setPreviewLang(cov.code)}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  border: isInspected ? '2px solid #15803d' : '1px solid #e2e8f0',
                  backgroundColor: isInspected ? '#f0fdf4' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                    {cov.native}
                  </span>
                  {cov.percentage === 100 ? (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#15803d', backgroundColor: '#dcfce7', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                      100%
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#b45309', backgroundColor: '#fef3c7', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                      {cov.percentage}%
                    </span>
                  )}
                </div>

                <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                  <div
                    style={{
                      width: `${cov.percentage}%`,
                      height: '100%',
                      backgroundColor: cov.percentage === 100 ? '#16a34a' : '#d97706'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
                  <span>{cov.completedKeys}/{cov.totalKeys} keys</span>
                  <span>{cov.reviewStatus}</span>
                </div>

                {isCurrentApp && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.6875rem', color: '#15803d', fontWeight: 600 }}>
                    ● Active App Locale
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Option to apply this preview language to the entire app */}
        {previewLang !== currentLang && (
          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#eff6ff', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
            <span style={{ fontSize: '0.8125rem', color: '#1e40af', fontWeight: 500 }}>
              Viewing preview for <strong>{activeCoverage.native}</strong>. Would you like to switch the entire application interface to this language?
            </span>
            <button
              onClick={() => setLanguage(previewLang)}
              className="btn btn-primary btn-sm"
            >
              Apply to Whole Application
            </button>
          </div>
        )}
      </div>

      {/* Side-by-Side Component Translation Inspector */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
          {t('languagePreview.sampleComponentsTitle', {}, currentLang)}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Sample Buttons */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.75rem' }}>
              {t('languagePreview.sampleButtons', {}, currentLang)}
            </h4>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-sm">
                {t('common.save', {}, previewLang)}
              </button>
              <button className="btn btn-secondary btn-sm">
                {t('common.cancel', {}, previewLang)}
              </button>
              <button className="btn btn-danger btn-sm">
                {t('common.delete', {}, previewLang)}
              </button>
              <button className="btn btn-blue btn-sm">
                {t('common.submit', {}, previewLang)}
              </button>
            </div>
          </div>

          {/* Sample Status Badges */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.75rem' }}>
              {t('languagePreview.sampleStatuses', {}, currentLang)}
            </h4>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <StatusBadge status={t('languagePreview.statusApproved', {}, previewLang)} />
              <StatusBadge status={t('languagePreview.statusSubmitted', {}, previewLang)} />
              <StatusBadge status={t('languagePreview.statusDisbursed', {}, previewLang)} />
              <StatusBadge status={t('languagePreview.statusRejected', {}, previewLang)} />
              <StatusBadge status={t('languagePreview.statusOverdue', {}, previewLang)} />
            </div>
          </div>

          {/* Sample Form Elements */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.75rem' }}>
              {t('languagePreview.sampleForm', {}, currentLang)}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                  {t('farmers.colName', {}, previewLang)}
                </label>
                <input
                  type="text"
                  readOnly
                  value="Basavaraj Patil"
                  style={{ width: '100%', fontSize: '0.8125rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                  {t('loans.appliedAmtLabel', {}, previewLang)}
                </label>
                <input
                  type="text"
                  readOnly
                  value="₹ 1,50,000"
                  style={{ width: '100%', fontSize: '0.8125rem' }}
                />
              </div>
            </div>
          </div>

          {/* Sample Alerts & Dynamic Interpolation */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.75rem' }}>
              {t('languagePreview.sampleAlerts', {}, currentLang)}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', color: '#166534' }}>
                ✓ {t('common.lastSynced', { time: '5m' }, previewLang)}
              </div>
              <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '6px', color: '#92400e' }}>
                ⚠ {t('common.itemsPending', { count: 3 }, previewLang)}
              </div>
              <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', color: '#1e40af' }}>
                ℹ {t('common.showingCount', { count: 32 }, previewLang)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
