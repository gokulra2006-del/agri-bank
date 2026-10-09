import React, { useState } from 'react';
import { Settings, Globe, Shield, Bell, User, RotateCcw, CheckCircle2 } from 'lucide-react';
import { getSettings, saveSettings, resetDemoData, getBranches } from '../data/mockStore';

export default function SettingsPage({ onNavigate, onLangChange }) {
  const [settings, setSettingsState] = useState(getSettings());
  const [saveToast, setSaveToast] = useState(false);
  const branches = getBranches();

  const handleSave = (e) => {
    e.preventDefault();
    saveSettings(settings);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '48rem' }}>
      {/* Toast Alert */}
      {saveToast && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '0.375rem', padding: '0.75rem 1rem', fontSize: '0.8125rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} />
          Settings updated successfully.
        </div>
      )}

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
          Branch Desk & System Preferences
        </h1>
        <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          Manage logged officer profile, active operating branch, language locale, and demo data state
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* User Profile Config */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} color="#1e3a8a" />
            Credit Officer Profile
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                Officer Name
              </label>
              <input
                type="text"
                value={settings.officerName}
                onChange={(e) => setSettingsState({ ...settings, officerName: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                Designation / Role
              </label>
              <input
                type="text"
                value={settings.officerRole}
                onChange={(e) => setSettingsState({ ...settings, officerRole: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Operating Branch Config */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} color="#15803d" />
            Operating Branch Scope
          </h3>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
              Active Operating Branch
            </label>
            <select
              value={settings.activeBranchId}
              onChange={(e) => setSettingsState({ ...settings, activeBranchId: e.target.value })}
              style={{ width: '100%' }}
            >
              <option value="ALL">All Branches (Consolidated View)</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.district}, {b.state}) - {b.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Language & Local Support */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Globe size={18} color="#2563eb" />
              Language & Regional Localization
            </h3>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('language-preview')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  borderRadius: '6px',
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Inspect Translation Coverage (10 Languages) →
              </button>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
              Application Interface Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => {
                const newLang = e.target.value;
                setSettingsState({ ...settings, language: newLang });
                if (onLangChange) onLangChange(newLang);
              }}
              style={{ width: '100%' }}
            >
              <option value="en">English (Banking Standard)</option>
              <option value="hi">हिन्दी – Hindi (Regional Banking)</option>
              <option value="kn">ಕನ್ನಡ – Kannada (Rural Desk)</option>
              <option value="ta">தமிழ் – Tamil (Rural Desk)</option>
              <option value="te">తెలుగు – Telugu (Rural Desk)</option>
              <option value="mr">मराठी – Marathi (Rural Desk)</option>
              <option value="bn">বাংলা – Bengali (Rural Desk)</option>
              <option value="ml">മലയാളം – Malayalam (Rural Desk)</option>
              <option value="gu">ગુજરાતી – Gujarati (Rural Desk)</option>
              <option value="pa">ਪੰਜਾਬੀ – Punjabi (Rural Desk)</option>
            </select>
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', display: 'block' }}>
              Multi-language support for farmer notices, branch field interactions, and full-page UI translation across 10 official Indian languages.
            </span>
          </div>
        </div>

        {/* Notifications Preference */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} color="#d97706" />
            Alerts & Automation Preferences
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.smsReminders}
                onChange={(e) => setSettingsState({ ...settings, smsReminders: e.target.checked })}
              />
              Enable automated SMS reminders for harvest due dates
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.emailAlerts}
                onChange={(e) => setSettingsState({ ...settings, emailAlerts: e.target.checked })}
              />
              Send daily MIS summary alerts to Branch Credit Manager
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              if (window.confirm("Are you sure you want to reset all demo data back to default initial values?")) {
                resetDemoData();
              }
            }}
            style={{ color: '#dc2626' }}
          >
            <RotateCcw size={15} />
            Reset Demo Data to Initial State
          </button>

          <button type="submit" className="btn btn-primary">
            Save System Settings
          </button>
        </div>
      </form>
    </div>
  );
}
