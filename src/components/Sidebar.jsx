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
  Sparkles,
  TrendingUp,
  Sliders,
  MapPin,
  Lock,
  ShieldCheck,
  RefreshCw,
  Scale,
  Activity,
  Server,
  Radio
} from 'lucide-react';
import { hasRouteAccess } from '../utils/rbac';
import { t } from '../utils/i18n';

export default function Sidebar({ currentPage, setCurrentPage, isOpen, onClose, currentRole = 'manager', currentLang = 'en' }) {
  // Navigation organized into clean logical functional groups with multilingual support
  const navSections = [
    {
      groupKey: 'navigation.overviewGroup',
      defaultGroupLabel: 'Overview & Analytics',
      items: [
        { id: 'dashboard', labelKey: 'navigation.dashboard', defaultLabel: 'Dashboard', icon: LayoutDashboard },
        { id: 'impact-dashboard', labelKey: 'navigation.impactDashboard', defaultLabel: 'Impact Dashboard', icon: TrendingUp },
        { id: 'innovation-center', labelKey: 'navigation.innovationCenter', defaultLabel: 'Innovation Center', icon: Sparkles }
      ]
    },
    {
      groupKey: 'navigation.farmersCreditGroup',
      defaultGroupLabel: 'Farmers & Credit',
      items: [
        { id: 'farmers', labelKey: 'navigation.farmers', defaultLabel: 'Farmers Directory', icon: Users },
        { id: 'loans', labelKey: 'navigation.loans', defaultLabel: 'Loan Applications', icon: FileText },
        { id: 'eligibility', labelKey: 'navigation.eligibility', defaultLabel: 'Eligibility Assessment', icon: Calculator },
        { id: 'repayments', labelKey: 'navigation.repayments', defaultLabel: 'Repayments Ledger', icon: CalendarCheck2 },
        { id: 'repayment-planner', labelKey: 'navigation.repaymentPlanner', defaultLabel: 'Harvest Repayment Planner', icon: Calendar },
        { id: 'credit-protection', labelKey: 'navigation.creditProtection', defaultLabel: 'Credit Protection (PMFBY)', icon: ShieldCheck }
      ]
    },
    {
      groupKey: 'navigation.fieldOpsGroup',
      defaultGroupLabel: 'Field Operations',
      items: [
        { id: 'field-mode', labelKey: 'navigation.fieldMode', defaultLabel: 'Field Officer Mode', icon: Compass },
        { id: 'sync-monitor', labelKey: 'navigation.syncMonitor', defaultLabel: 'Sync Monitor & Telemetry', icon: Radio },
        { id: 'conflict-center', labelKey: 'navigation.conflictCenter', defaultLabel: 'Offline Conflict Center', icon: RefreshCw },
        { id: 'documents', labelKey: 'navigation.documents', defaultLabel: 'Documents Vault', icon: FolderOpen },
        { id: 'crop-calendar', labelKey: 'navigation.cropCalendar', defaultLabel: 'Crop Calendar', icon: Calendar },
        { id: 'branches', labelKey: 'navigation.branches', defaultLabel: 'Branches & Staff', icon: Building2 }
      ]
    },
    {
      groupKey: 'navigation.climateRiskGroup',
      defaultGroupLabel: 'Climate Risk & Resilience',
      items: [
        { id: 'risk-monitoring', labelKey: 'navigation.riskMonitoring', defaultLabel: 'Credit Risk Radar', icon: ShieldAlert },
        { id: 'risk-simulator', labelKey: 'navigation.riskSimulator', defaultLabel: 'What-If Risk Simulator', icon: Sliders },
        { id: 'village-heatmap', labelKey: 'navigation.villageHeatmap', defaultLabel: 'Village Risk Heatmap', icon: MapPin },
        { id: 'weather-risk', labelKey: 'navigation.weatherRisk', defaultLabel: 'Weather & Crop Risk', icon: CloudSun }
      ]
    },
    {
      groupKey: 'navigation.researchGroup',
      defaultGroupLabel: 'Research & Evaluation',
      items: [
        { id: 'research-dashboard', labelKey: 'navigation.researchDashboard', defaultLabel: 'Research Evaluation Lab', icon: Activity },
        { id: 'fairness-dashboard', labelKey: 'navigation.fairnessDashboard', defaultLabel: 'Fairness & Bias Audit', icon: Scale }
      ]
    },
    {
      groupKey: 'navigation.governanceGroup',
      defaultGroupLabel: 'Governance & Support',
      items: [
        { id: 'schemes', labelKey: 'navigation.schemes', defaultLabel: 'Schemes & Subsidies', icon: Landmark },
        { id: 'privacy-center', labelKey: 'navigation.privacyCenter', defaultLabel: 'Farmer Consent & Privacy', icon: Lock },
        { id: 'admin-ops', labelKey: 'navigation.adminOps', defaultLabel: 'Admin Operations', icon: Server },
        { id: 'reports', labelKey: 'navigation.reports', defaultLabel: 'Reports & Export', icon: BarChart3 },
        { id: 'audit-log', labelKey: 'navigation.auditLog', defaultLabel: 'Audit Trail', icon: History },
        { id: 'helpDesk', labelKey: 'navigation.helpDesk', defaultLabel: 'Farmer Help Desk', icon: LifeBuoy },
        { id: 'notifications', labelKey: 'navigation.notifications', defaultLabel: 'Notifications', icon: Bell },
        { id: 'settings', labelKey: 'navigation.settings', defaultLabel: 'Settings', icon: Settings },
        { id: 'language-preview', labelKey: 'navigation.languagePreview', defaultLabel: 'Language Preview & Coverage', icon: Sparkles }
      ]
    }
  ];

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
          transition: 'transform 0.2s ease-in-out'
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
            aria-label="Close navigation sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Grouped Navigation list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0.5rem' }}>
          {navSections.map((section, sIdx) => {
            const filteredItems = section.items.filter(item => hasRouteAccess(currentRole, item.id));
            if (filteredItems.length === 0) return null;

            return (
              <div key={sIdx} style={{ marginBottom: '0.875rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', padding: '0.25rem 0.75rem', letterSpacing: '0.05em' }}>
                  {t(section.groupKey, {}, currentLang)}
                </div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  {filteredItems.map((item) => {
                    const active = currentPage === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        aria-current={active ? 'page' : undefined}
                        onClick={() => {
                          setCurrentPage(item.id);
                          if (onClose) onClose();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.5rem 0.75rem',
                          minHeight: '40px',
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
                      >
                        <Icon size={16} color={active ? '#15803d' : '#64748b'} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t(item.labelKey, {}, currentLang)}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            );
          })}
        </div>

        {/* Academic Prototype Footer Notice */}
        <div
          style={{
            padding: '0.75rem 1rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            fontSize: '0.6875rem',
            color: '#64748b',
            lineHeight: 1.4
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600, color: '#0f172a' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            Demo Academic Prototype
          </div>
          <span style={{ display: 'block', marginTop: '0.2rem' }}>
            For demonstration only. Not connected to a live banking system.
          </span>
        </div>
      </aside>
    </>
  );
}
