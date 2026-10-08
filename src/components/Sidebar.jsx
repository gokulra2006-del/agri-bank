import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calculator,
  CalendarCheck2,
  Calendar,
  Landmark,
  FolderOpen,
  Building2,
  BarChart3,
  Bell,
  Settings,
  HelpCircle,
  Wheat,
  X,
  Compass,
  ShieldAlert,
  CloudSun,
  History,
  LifeBuoy,
  Sparkles
} from 'lucide-react';
import { hasRouteAccess } from '../utils/rbac';
import { t } from '../utils/i18n';

export default function Sidebar({ currentPage, setCurrentPage, isOpen, onClose, currentRole = 'manager', currentLang = 'en' }) {
  const allNavItems = [
    { id: 'dashboard', labelKey: 'nav_dashboard', defaultLabel: 'Dashboard', icon: LayoutDashboard },
    { id: 'innovation-center', labelKey: 'nav_innovation_center', defaultLabel: 'Innovation Center', icon: Sparkles },
    { id: 'field-mode', labelKey: 'nav_field_mode', defaultLabel: 'Field Officer Mode', icon: Compass },
    { id: 'farmers', labelKey: 'nav_farmers', defaultLabel: 'Farmers', icon: Users },
    { id: 'loans', labelKey: 'nav_loans', defaultLabel: 'Loan Applications', icon: FileText },
    { id: 'eligibility', labelKey: 'nav_eligibility', defaultLabel: 'Eligibility Assessment', icon: Calculator },
    { id: 'repayments', labelKey: 'nav_repayments', defaultLabel: 'Repayments', icon: CalendarCheck2 },
    { id: 'risk-monitoring', labelKey: 'nav_risk_monitoring', defaultLabel: 'Credit Risk Radar', icon: ShieldAlert },
    { id: 'weather-risk', labelKey: 'nav_weather_risk', defaultLabel: 'Weather & Crop Risk', icon: CloudSun },
    { id: 'crop-calendar', labelKey: 'nav_crop_calendar', defaultLabel: 'Crop Calendar', icon: Calendar },
    { id: 'schemes', labelKey: 'nav_schemes', defaultLabel: 'Schemes & Insurance', icon: Landmark },
    { id: 'documents', labelKey: 'nav_documents', defaultLabel: 'Documents Vault', icon: FolderOpen },
    { id: 'branches', labelKey: 'nav_branches', defaultLabel: 'Branches & Staff', icon: Building2 },
    { id: 'reports', labelKey: 'nav_reports', defaultLabel: 'Reports & Export', icon: BarChart3 },
    { id: 'audit-log', labelKey: 'nav_audit_log', defaultLabel: 'Audit Trail', icon: History },
    { id: 'help-desk', labelKey: 'nav_help_desk', defaultLabel: 'Farmer Help Desk', icon: LifeBuoy },
    { id: 'notifications', labelKey: 'nav_notifications', defaultLabel: 'Notifications', icon: Bell },
    { id: 'settings', labelKey: 'nav_settings', defaultLabel: 'Settings', icon: Settings },
  ];

  // RBAC filtered items
  const navItems = allNavItems.filter(item => hasRouteAccess(currentRole, item.id));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            zIndex: 40,
            display: 'block'
          }}
          className="mobile-backdrop"
        />
      )}

      <aside
        style={{
          width: '260px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 45,
          transition: 'transform 0.2s ease-in-out',
          transform: isOpen ? 'translateX(0)' : 'translateX(0)'
        }}
        className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
      >
        {/* Brand / Header */}
        <div
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.25rem',
            borderBottom: '1px solid #e2e8f0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              <Wheat size={18} />
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1e3a8a', letterSpacing: '-0.01em', display: 'block' }}>
                AgriSahay
              </span>
              <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', marginTop: '-2px' }}>
                Rural Credit & Farmer Desk
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="mobile-close-btn"
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0.5rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', padding: '0.5rem 0.75rem', letterSpacing: '0.05em' }}>
            Main Operations
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {navItems.map((item) => {
              const active = currentPage === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    if (onClose) onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.8125rem',
                    fontWeight: active ? 600 : 500,
                    color: active ? '#15803d' : '#334155',
                    backgroundColor: active ? '#f0fdf4' : 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Icon size={17} color={active ? '#15803d' : '#64748b'} />
                  <span style={{ flex: 1 }}>{t(item.labelKey, currentLang)}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Prototype context footer card */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <div style={{ padding: '0.625rem', backgroundColor: '#ffffff', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#15803d' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#1e3a8a' }}>Ujjivan SFB Project</span>
            </div>
            <p style={{ fontSize: '0.675rem', color: '#64748b', lineHeight: 1.3 }}>
              Agriculture Banking Desk for small & marginal farmers.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
