import React, { useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  Building,
  User,
  ShieldCheck,
  Check,
  ChevronDown
} from 'lucide-react';
import { getBranches, getSettings, saveSettings } from '../data/mockStore';

export default function Topbar({
  onToggleSidebar,
  notifications = [],
  onOpenNotifications,
  onSearch,
  currentRole = 'manager',
  onRoleChange = () => {},
  currentLang = 'en',
  onLangChange = () => {}
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const branches = getBranches();
  const [settings, setSettingsState] = useState(getSettings());
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleBranchChange = (e) => {
    const updated = { ...settings, activeBranchId: e.target.value };
    saveSettings(updated);
    setSettingsState(updated);
    window.location.reload();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchTerm);
  };

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 30
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '480px' }}>
        <button
          onClick={onToggleSidebar}
          className="topbar-toggle-btn"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#475569', display: 'flex', alignItems: 'center' }}
          title="Toggle Navigation"
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>

        {/* Global Search Input */}
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
          />
          <input
            type="text"
            placeholder="Search farmer name, loan ID, village..."
            value={searchTerm}
            aria-label="Search farmer name, loan ID, or village"
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (onSearch) onSearch(e.target.value);
            }}
            style={{
              paddingLeft: '2.25rem',
              paddingRight: '0.75rem',
              paddingTop: '0.45rem',
              paddingBottom: '0.45rem',
              width: '100%',
              fontSize: '0.8125rem',
              backgroundColor: '#f8fafc'
            }}
          />
        </form>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Branch Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }} className="branch-selector-wrapper">
          <Building size={16} color="#64748b" />
          <select
            value={settings.activeBranchId}
            onChange={handleBranchChange}
            aria-label="Select active branch"
            style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              padding: '0.35rem 0.6rem',
              backgroundColor: '#f8fafc'
            }}
          >
            <option value="ALL">All Branches (Consolidated)</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.district})
              </option>
            ))}
          </select>
        </div>

        {/* Demo Role Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#f0fdf4', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', border: '1px solid #bbf7d0' }}>
          <ShieldCheck size={15} color="#15803d" />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Demo Role:</span>
          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value)}
            aria-label="Select demo role"
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.2rem 0.4rem',
              backgroundColor: '#ffffff',
              borderColor: '#86efac',
              color: '#14532d'
            }}
          >
            <option value="manager">Branch Manager</option>
            <option value="officer">Relationship Officer (Field)</option>
            <option value="admin">Operations Admin</option>
            <option value="researcher">Field Researcher / Evaluator</option>
          </select>
        </div>

        {/* Accessibility & Voice Settings Button */}
        {onOpenAccessibility && (
          <button
            onClick={onOpenAccessibility}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '0.375rem',
              padding: '0.3rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
            title="Accessibility, Text Scaling & Voice Settings"
            aria-label="Open Accessibility and Voice Settings"
          >
            <span>♿</span>
            <span className="hidden-mobile">A11y</span>
          </button>
        )}

        {/* Language Selector (10 Indian Languages) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <select
            value={currentLang}
            onChange={(e) => onLangChange(e.target.value)}
            aria-label="Select interface language"
            style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              padding: '0.35rem 0.5rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '0.375rem',
              color: '#1e293b',
              cursor: 'pointer'
            }}
            title="Interface Language"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी – Hindi</option>
            <option value="kn">ಕನ್ನಡ – Kannada</option>
            <option value="ta">தமிழ் – Tamil</option>
            <option value="te">తెలుగు – Telugu</option>
            <option value="mr">मराठी – Marathi</option>
            <option value="bn">বাংলা – Bengali</option>
            <option value="ml">മലയാളം – Malayalam</option>
            <option value="gu">ગુજરાતી – Gujarati</option>
            <option value="pa">ਪੰਜਾਬੀ – Punjabi</option>
          </select>
        </div>

        {/* Notifications Icon with Badge */}
        <button
          onClick={onOpenNotifications}
          style={{
            position: 'relative',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            color: '#475569',
            borderRadius: '0.375rem'
          }}
          title="Notifications & Alerts"
          aria-label="View notifications and alerts"
        >
          <Bell size={19} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '18px',
                height: '18px',
                backgroundColor: '#dc2626',
                color: 'white',
                borderRadius: '50%',
                fontSize: '0.65rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* User profile dropdown pill */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#1e3a8a',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 600
              }}
            >
              GS
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.1 }} className="user-info-text">
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a', display: 'block' }}>
                Gokul Sharma
              </span>
              <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>
                Agri Credit Officer
              </span>
            </div>
            <ChevronDown size={14} color="#64748b" />
          </button>

          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '115%',
                width: '230px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                padding: '0.75rem',
                zIndex: 50
              }}
            >
              <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a', display: 'block' }}>Gokul Sharma</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>gokul.s@agribank.demo</span>
                <div style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ShieldCheck size={12} color="#15803d" />
                  <span style={{ fontSize: '0.65rem', color: '#15803d', fontWeight: 600 }}>Role: Agri Credit Trainee</span>
                </div>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', padding: '0.25rem 0' }}>
                Active Branch: <strong>{settings.activeBranchId === 'ALL' ? 'All Mandya Hubs' : settings.activeBranchId}</strong>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', marginTop: '0.5rem' }}
                onClick={() => setShowProfileMenu(false)}
              >
                Close Menu
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
