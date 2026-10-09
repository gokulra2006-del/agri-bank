import React, { useState, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import NotificationPanel from './components/NotificationPanel';

// Lazy Loaded Pages for Performance & Route-Level Code Splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Farmers = lazy(() => import('./pages/Farmers'));
const FarmerProfile = lazy(() => import('./pages/FarmerProfile'));
const LoanApplications = lazy(() => import('./pages/LoanApplications'));
const LoanDetail = lazy(() => import('./pages/LoanDetail'));
const Eligibility = lazy(() => import('./pages/Eligibility'));
const Repayments = lazy(() => import('./pages/Repayments'));
const CropCalendar = lazy(() => import('./pages/CropCalendar'));
const SchemesInsurance = lazy(() => import('./pages/SchemesInsurance'));
const Documents = lazy(() => import('./pages/Documents'));
const BranchesStaff = lazy(() => import('./pages/BranchesStaff'));
const Reports = lazy(() => import('./pages/Reports'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const FieldOfficerMode = lazy(() => import('./pages/FieldOfficerMode'));
const RiskMonitoring = lazy(() => import('./pages/RiskMonitoring'));
const WeatherRiskPanel = lazy(() => import('./pages/WeatherRiskPanel'));
const AuditLogPage = lazy(() => import('./pages/AuditLogPage'));
const HelpDesk = lazy(() => import('./pages/HelpDesk'));
const InnovationCenter = lazy(() => import('./pages/InnovationCenter'));
const RepaymentPlannerPage = lazy(() => import('./pages/RepaymentPlannerPage'));
const RiskSimulatorPage = lazy(() => import('./pages/RiskSimulatorPage'));
const VillageHeatmapPage = lazy(() => import('./pages/VillageHeatmapPage'));
const PrivacyCenterPage = lazy(() => import('./pages/PrivacyCenterPage'));
const ImpactDashboardPage = lazy(() => import('./pages/ImpactDashboardPage'));
const LanguagePreviewPage = lazy(() => import('./pages/LanguagePreviewPage'));
const CreditProtectionCenter = lazy(() => import('./pages/CreditProtectionCenter'));
const ConflictCenterPage = lazy(() => import('./pages/ConflictCenterPage'));
const FairnessDashboardPage = lazy(() => import('./pages/FairnessDashboardPage'));
const ResearchDashboardPage = lazy(() => import('./pages/ResearchDashboardPage'));
const SyncMonitorPage = lazy(() => import('./pages/SyncMonitorPage'));
const AdminOpsPage = lazy(() => import('./pages/AdminOpsPage'));

import AccessibilityModal from './components/AccessibilityModal';

const PageLoader = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '360px', gap: '0.75rem', color: '#64748b' }} role="status" aria-live="polite">
    <div style={{ width: '2.25rem', height: '2.25rem', border: '3px solid #e2e8f0', borderTopColor: '#15803d', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Loading banking module...</span>
  </div>
);

// RBAC & Access Restriction
import AccessDenied from './components/AccessDenied';
import { hasRouteAccess, ROLES } from './utils/rbac';
import { logAudit } from './utils/audit';

// Central Data Store
import {
  getFarmers,
  saveFarmers,
  getLoans,
  saveLoans,
  getRepayments,
  saveRepayments,
  getDocuments,
  saveDocuments,
  getNotifications,
  saveNotifications,
  getFieldVisits,
  saveFieldVisits,
  getCommunications,
  saveCommunications,
  getSettings,
  saveSettings,
  getBranches,
  getAssistanceTracker,
  saveAssistanceTracker,
  getVillageHeatmaps,
  saveVillageHeatmaps,
  loadStore,
  updateStore,
  STORES
} from './data/mockStore';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [showA11yModal, setShowA11yModal] = useState(false);

  // App Settings, Role, Language, and Offline states
  const [settings, setSettingsState] = useState(getSettings());
  const currentRole = settings.demoRole || 'manager';
  const currentLang = settings.language || 'en';
  const isOfflineMode = Boolean(settings.isOfflineMode);

  // Accessibility Settings
  const [a11ySettings, setA11ySettings] = useState(() => loadStore(STORES.ACCESSIBILITY_SETTINGS) || {
    fontSize: 'normal',
    highContrast: false,
    lowBandwidth: false,
    farmerHelpMode: false,
    speechRate: 0.9
  });

  const handleUpdateA11ySettings = (newSettings) => {
    setA11ySettings(newSettings);
    updateStore(STORES.ACCESSIBILITY_SETTINGS, newSettings);
  };

  // Deep selection IDs
  const [selectedFarmerId, setSelectedFarmerId] = useState(null);
  const [selectedLoanId, setSelectedLoanId] = useState(null);

  // Application Data States
  const [farmers, setFarmersState] = useState(getFarmers());
  const [loans, setLoansState] = useState(getLoans());
  const [repayments, setRepaymentsState] = useState(getRepayments());
  const [documents, setDocumentsState] = useState(getDocuments());
  const [notifications, setNotificationsState] = useState(getNotifications());
  const [visits, setVisitsState] = useState(getFieldVisits());
  const [communications, setCommunicationsState] = useState(getCommunications());
  const [assistanceList, setAssistanceListState] = useState(getAssistanceTracker());
  const [villageHeatmaps, setVillageHeatmapsState] = useState(getVillageHeatmaps());
  const branches = getBranches();

  // Role and Language change handlers
  const handleRoleChange = (newRole) => {
    const updated = { ...settings, demoRole: newRole };
    saveSettings(updated);
    setSettingsState(updated);
    logAudit({
      action: 'DEMO_ROLE_SWITCHED',
      userRole: ROLES[newRole.toUpperCase()] || newRole,
      entityId: `ROLE-${newRole.toUpperCase()}`,
      entityType: 'User Authorization',
      previousStatus: currentRole,
      newStatus: newRole,
      notes: `Switched demo role context to ${ROLES[newRole.toUpperCase()] || newRole}`
    });
  };

  const handleLangChange = (newLang) => {
    const updated = { ...settings, language: newLang };
    saveSettings(updated);
    setSettingsState(updated);
  };

  const handleToggleOffline = () => {
    const updated = { ...settings, isOfflineMode: !isOfflineMode };
    saveSettings(updated);
    setSettingsState(updated);
    logAudit({
      action: 'NETWORK_MODE_TOGGLED',
      userRole: ROLES[currentRole.toUpperCase()] || currentRole,
      entityId: 'CONN-MODE',
      entityType: 'Network Simulation',
      previousStatus: isOfflineMode ? 'Offline' : 'Online',
      newStatus: !isOfflineMode ? 'Offline' : 'Online',
      notes: `Field device network mode switched to ${!isOfflineMode ? 'Offline' : 'Online'}.`
    });
  };

  // Farmer Handlers
  const handleAddFarmer = (newFarmer) => {
    const updated = [newFarmer, ...farmers];
    saveFarmers(updated);
    setFarmersState(updated);

    logAudit({
      action: 'FARMER_REGISTERED',
      userRole: ROLES[currentRole.toUpperCase()] || currentRole,
      entityId: newFarmer.id,
      entityType: 'Farmer Profile',
      previousStatus: 'None',
      newStatus: 'Registered',
      notes: `Registered borrower ${newFarmer.name} (${newFarmer.village}, ${newFarmer.primaryCrop}, ${newFarmer.landSize} Acres)`
    });
  };

  const handleUpdateFarmer = (updatedFarmer) => {
    const updated = farmers.map(f => f.id === updatedFarmer.id ? updatedFarmer : f);
    saveFarmers(updated);
    setFarmersState(updated);

    logAudit({
      action: 'FARMER_PROFILE_UPDATED',
      userRole: ROLES[currentRole.toUpperCase()] || currentRole,
      entityId: updatedFarmer.id,
      entityType: 'Farmer Profile',
      previousStatus: 'Active',
      newStatus: 'Updated',
      notes: `Updated demographics/land details for ${updatedFarmer.name}`
    });
  };

  const handleDeleteFarmer = (farmerId) => {
    const target = farmers.find(f => f.id === farmerId);
    const updatedFarmers = farmers.filter(f => f.id !== farmerId);
    saveFarmers(updatedFarmers);
    setFarmersState(updatedFarmers);

    const updatedLoans = loans.filter(l => l.farmerId !== farmerId);
    saveLoans(updatedLoans);
    setLoansState(updatedLoans);

    logAudit({
      action: 'FARMER_RECORD_DELETED',
      userRole: ROLES[currentRole.toUpperCase()] || currentRole,
      entityId: farmerId,
      entityType: 'Farmer Profile',
      previousStatus: 'Active',
      newStatus: 'Deleted',
      notes: `Deleted farmer record ${target ? target.name : farmerId}`
    });
  };

  // Loan Handlers
  const handleAddLoan = (newLoan) => {
    const updated = [newLoan, ...loans];
    saveLoans(updated);
    setLoansState(updated);

    // If submitted, notify
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      type: 'application',
      title: 'New Application Submitted',
      message: `${newLoan.farmerName} submitted ${newLoan.loanType} for Rs. ${newLoan.appliedAmount}.`,
      time: 'Just now',
      read: false
    };
    const updatedNotifs = [newNotif, ...notifications];
    saveNotifications(updatedNotifs);
    setNotificationsState(updatedNotifs);

    // Sync to Farmer Communication Timeline
    const commEntry = {
      id: `COM-${Date.now()}`,
      farmerId: newLoan.farmerId,
      type: 'Notice',
      category: 'Loan Status Updated',
      message: `Agricultural loan application ${newLoan.id} for Rs. ${newLoan.appliedAmount} (${newLoan.crop}) submitted to branch credit desk.`,
      sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      channel: 'Core Banking Pipeline',
      status: 'Logged'
    };
    const updatedComms = [commEntry, ...communications];
    saveCommunications(updatedComms);
    setCommunicationsState(updatedComms);

    logAudit({
      action: 'LOAN_APPLICATION_SUBMITTED',
      userRole: ROLES[currentRole.toUpperCase()] || currentRole,
      entityId: newLoan.id,
      entityType: 'Loan Application',
      previousStatus: 'Draft',
      newStatus: 'Submitted',
      notes: `Originated ${newLoan.loanType} for ${newLoan.farmerName}. Applied: Rs. ${newLoan.appliedAmount}.`
    });
  };

  const handleUpdateLoanStatus = (loanId, newStatus, extraData = {}) => {
    let oldStatus = 'Unknown';
    let targetFarmerId = null;
    let targetFarmerName = '';

    const updated = loans.map(l => {
      if (l.id === loanId) {
        oldStatus = l.status;
        targetFarmerId = l.farmerId;
        targetFarmerName = l.farmerName;
        return {
          ...l,
          status: newStatus,
          ...extraData
        };
      }
      return l;
    });
    saveLoans(updated);
    setLoansState(updated);

    // If disbursed, create harvest repayment schedule automatically!
    if (newStatus === 'Disbursed') {
      const loan = loans.find(l => l.id === loanId);
      if (loan) {
        const newRep = {
          id: `REP-${Math.floor(100 + repayments.length + 1)}`,
          loanId: loan.id,
          farmerName: loan.farmerName,
          installmentNumber: 1,
          dueDate: loan.harvestDate || '2026-04-30',
          amountDue: Math.round((loan.sanctionedAmount || loan.appliedAmount) * 1.07),
          amountPaid: 0,
          status: 'Due Soon',
          lastPaymentDate: null,
          cropSeason: `${loan.crop} Harvest Season`,
          smsReminderSent: false
        };
        const updatedRepayments = [newRep, ...repayments];
        saveRepayments(updatedRepayments);
        setRepaymentsState(updatedRepayments);
      }
    }

    // Auto-sync communication timeline
    if (targetFarmerId) {
      const commEntry = {
        id: `COM-${Date.now()}`,
        farmerId: targetFarmerId,
        type: 'SMS',
        category: 'Loan Status Updated',
        message: `Status update: Agricultural loan ${loanId} transitioned to "${newStatus}".`,
        sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        channel: 'SMS Gateway',
        status: 'Delivered'
      };
      const updatedComms = [commEntry, ...communications];
      saveCommunications(updatedComms);
      setCommunicationsState(updatedComms);
    }

    logAudit({
      action: `LOAN_STATUS_${newStatus.toUpperCase().replace(/\s+/g, '_')}`,
      userRole: ROLES[currentRole.toUpperCase()] || currentRole,
      entityId: loanId,
      entityType: 'Loan Application',
      previousStatus: oldStatus,
      newStatus,
      notes: `Loan ${loanId} (${targetFarmerName}) changed status from ${oldStatus} to ${newStatus}.`
    });
  };

  const handleApplyPlanToLoan = (loanId, plan) => {
    const updated = loans.map(l => {
      if (l.id === loanId) {
        return {
          ...l,
          repaymentScheduleType: 'Harvest-Linked Balloon',
          harvestPlan: plan
        };
      }
      return l;
    });
    saveLoans(updated);
    setLoansState(updated);
  };

  // Field Visits Handlers
  const handleUpdateVisits = (updatedVisits) => {
    saveFieldVisits(updatedVisits);
    setVisitsState(updatedVisits);
  };

  const handleAddVisit = (newVisit) => {
    const updated = [newVisit, ...visits];
    saveFieldVisits(updated);
    setVisitsState(updated);

    // Add communication entry
    const commEntry = {
      id: `COM-${Date.now()}`,
      farmerId: newVisit.farmerId,
      type: 'Visit',
      category: 'Field Inspection',
      message: `Field visit scheduled by ARO for ${newVisit.scheduledDate} (${newVisit.purpose}).`,
      sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      channel: 'Field Officer App',
      status: 'Scheduled'
    };
    const updatedComms = [commEntry, ...communications];
    saveCommunications(updatedComms);
    setCommunicationsState(updatedComms);
  };

  // Communications Handler
  const handleAddCommunication = (newComm) => {
    const updated = [newComm, ...communications];
    saveCommunications(updated);
    setCommunicationsState(updated);

    logAudit({
      action: 'COMMUNICATION_LOGGED',
      userRole: ROLES[currentRole.toUpperCase()] || currentRole,
      entityId: newComm.farmerId,
      entityType: 'Farmer Interaction',
      previousStatus: 'None',
      newStatus: 'Logged',
      notes: `${newComm.category} (${newComm.type}): ${newComm.message}`
    });
  };

  // Repayment Handlers
  const handleUpdateRepayment = (updatedRep) => {
    const updated = repayments.map(r => r.id === updatedRep.id ? updatedRep : r);
    saveRepayments(updated);
    setRepaymentsState(updated);
  };

  // Document Handlers
  const handleUpdateDocuments = (updatedDocs) => {
    saveDocuments(updatedDocs);
    setDocumentsState(updatedDocs);
  };

  // Navigation Helpers
  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectFarmer = (id) => {
    setSelectedFarmerId(id);
    setCurrentPage('farmer-profile');
  };

  const handleSelectLoan = (id) => {
    setSelectedLoanId(id);
    setCurrentPage('loan-detail');
  };

  const fontMultiplier = a11ySettings.fontSize === 'extra-large' ? 1.25 : a11ySettings.fontSize === 'large' ? 1.12 : 1;

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: a11ySettings.highContrast ? '#0f172a' : '#f8fafc',
        fontSize: fontMultiplier !== 1 ? `${fontMultiplier * 100}%` : undefined,
        filter: a11ySettings.highContrast ? 'contrast(115%)' : undefined
      }}
    >
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentRole={currentRole}
        currentLang={currentLang}
      />

      {/* Main Container */}
      <div
        style={{
          flex: 1,
          marginLeft: '260px',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0
        }}
        className="main-layout-content"
      >
        {/* Top Header */}
        <Topbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          onOpenNotifications={() => setNotifPanelOpen(!notifPanelOpen)}
          onSearch={(query) => {
            if (query && query.length > 2 && currentPage !== 'farmers' && currentPage !== 'loans') {
              handleNavigate('farmers');
            }
          }}
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          currentLang={currentLang}
          onLangChange={handleLangChange}
          onOpenAccessibility={() => setShowA11yModal(true)}
        />

        {/* Global Notification Panel Dropdown */}
        <NotificationPanel
          isOpen={notifPanelOpen}
          onClose={() => setNotifPanelOpen(false)}
          notifications={notifications}
          onUpdateNotifications={setNotificationsState}
          onNavigate={handleNavigate}
        />

        {/* Page Body */}
        <main style={{ flex: 1, padding: '1.5rem', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          {!hasRouteAccess(currentRole, currentPage) ? (
            <AccessDenied
              roleName={ROLES[currentRole.toUpperCase()] || currentRole}
              onNavigateHome={() => handleNavigate('dashboard')}
            />
          ) : (
            <Suspense fallback={<PageLoader />}>
              {currentPage === 'innovation-center' && (
                <InnovationCenter
                  farmers={farmers}
                  loans={loans}
                  assistanceList={assistanceList}
                  villageHeatmaps={villageHeatmaps}
                  onUpdateFarmer={handleUpdateFarmer}
                  onUpdateAssistance={(list) => {
                    setAssistanceListState(list);
                    saveAssistanceTracker(list);
                  }}
                  onLogAudit={logAudit}
                  currentRole={currentRole}
                />
              )}

              {currentPage === 'dashboard' && (
                <Dashboard
                  farmers={farmers}
                  loans={loans}
                  repayments={repayments}
                  onNavigate={handleNavigate}
                  onOpenRegisterFarmer={() => handleNavigate('farmers')}
                  onOpenNewLoan={() => handleNavigate('loans')}
                />
              )}

              {currentPage === 'field-mode' && (
                <FieldOfficerMode
                  visits={visits}
                  farmers={farmers}
                  onUpdateVisits={handleUpdateVisits}
                  onAddVisit={handleAddVisit}
                  onOpenNewFarmer={() => handleNavigate('farmers')}
                  isOfflineMode={isOfflineMode}
                  onToggleOffline={handleToggleOffline}
                />
              )}

              {currentPage === 'farmers' && (
                <Farmers
                  farmers={farmers}
                  onAddFarmer={handleAddFarmer}
                  onUpdateFarmer={handleUpdateFarmer}
                  onDeleteFarmer={handleDeleteFarmer}
                  onSelectFarmer={handleSelectFarmer}
                  currentRole={currentRole}
                />
              )}

              {currentPage === 'farmer-profile' && (
                <FarmerProfile
                  farmerId={selectedFarmerId}
                  farmers={farmers}
                  loans={loans}
                  repayments={repayments}
                  documents={documents}
                  communications={communications}
                  onAddCommunication={handleAddCommunication}
                  onBack={() => handleNavigate('farmers')}
                  onNavigateToLoan={handleSelectLoan}
                  onOpenNewLoan={(fid) => {
                    setSelectedFarmerId(fid);
                    handleNavigate('loans');
                  }}
                />
              )}

              {currentPage === 'loans' && (
                <LoanApplications
                  loans={loans}
                  farmers={farmers}
                  onSelectLoan={handleSelectLoan}
                  onAddLoan={handleAddLoan}
                  initialFarmerId={selectedFarmerId}
                />
              )}

              {currentPage === 'loan-detail' && (
                <LoanDetail
                  loanId={selectedLoanId}
                  loans={loans}
                  farmers={farmers}
                  documents={documents}
                  currentRole={currentRole}
                  onBack={() => handleNavigate('loans')}
                  onUpdateLoanStatus={handleUpdateLoanStatus}
                  onViewFarmer={handleSelectFarmer}
                />
              )}

              {currentPage === 'eligibility' && (
                <Eligibility
                  farmers={farmers}
                  onNavigateToNewLoan={() => handleNavigate('loans')}
                />
              )}

              {currentPage === 'repayments' && (
                <Repayments
                  repayments={repayments}
                  farmers={farmers}
                  onUpdateRepayment={handleUpdateRepayment}
                />
              )}

              {currentPage === 'repayment-planner' && (
                <RepaymentPlannerPage
                  farmers={farmers}
                  loans={loans}
                  onApplyPlanToLoan={handleApplyPlanToLoan}
                  onLogAudit={logAudit}
                  currentRole={currentRole}
                />
              )}

              {currentPage === 'risk-simulator' && (
                <RiskSimulatorPage
                  farmers={farmers}
                  loans={loans}
                />
              )}

              {currentPage === 'village-heatmap' && (
                <VillageHeatmapPage
                  farmers={farmers}
                />
              )}

              {currentPage === 'privacy-center' && (
                <PrivacyCenterPage
                  farmers={farmers}
                  loans={loans}
                  documents={documents}
                  visits={visits}
                  onUpdateFarmer={handleUpdateFarmer}
                  onLogAudit={logAudit}
                  currentRole={currentRole}
                />
              )}

              {currentPage === 'impact-dashboard' && (
                <ImpactDashboardPage
                  farmers={farmers}
                  loans={loans}
                  repayments={repayments}
                  visits={visits}
                />
              )}

              {currentPage === 'risk-monitoring' && (
                <RiskMonitoring
                  farmers={farmers}
                  loans={loans}
                  repayments={repayments}
                  documents={documents}
                  onNavigateToFarmer={handleSelectFarmer}
                  onNavigateToLoan={handleSelectLoan}
                />
              )}

              {currentPage === 'weather-risk' && (
                <WeatherRiskPanel />
              )}

              {currentPage === 'crop-calendar' && (
                <CropCalendar />
              )}

              {currentPage === 'schemes' && (
                <SchemesInsurance farmers={farmers} />
              )}

              {currentPage === 'documents' && (
                <Documents
                  documents={documents}
                  farmers={farmers}
                  onUpdateDocuments={handleUpdateDocuments}
                />
              )}

              {currentPage === 'branches' && (
                <BranchesStaff />
              )}

              {currentPage === 'reports' && (
                <Reports
                  loans={loans}
                  farmers={farmers}
                  repayments={repayments}
                  branches={branches}
                />
              )}

              {currentPage === 'audit-log' && (
                <AuditLogPage />
              )}

              {currentPage === 'help-desk' && (
                <HelpDesk />
              )}

              {currentPage === 'notifications' && (
                <NotificationsPage
                  notifications={notifications}
                  onUpdateNotifications={setNotificationsState}
                  onNavigate={handleNavigate}
                />
              )}

              {currentPage === 'settings' && (
                <SettingsPage
                  onNavigate={handleNavigate}
                  onLangChange={handleLangChange}
                />
              )}

              {currentPage === 'language-preview' && (
                <LanguagePreviewPage
                  onNavigate={handleNavigate}
                />
              )}

              {currentPage === 'credit-protection' && (
                <CreditProtectionCenter
                  loans={loans}
                  farmers={farmers}
                  onUpdateLoanStatus={handleUpdateLoanStatus}
                  onLogAudit={logAudit}
                  currentRole={currentRole}
                />
              )}

              {currentPage === 'conflict-center' && (
                <ConflictCenterPage
                  farmers={farmers}
                  loans={loans}
                  onUpdateFarmer={handleUpdateFarmer}
                  onUpdateLoan={handleUpdateLoanStatus}
                  onLogAudit={logAudit}
                  currentRole={currentRole}
                />
              )}

              {currentPage === 'fairness-dashboard' && (
                <FairnessDashboardPage
                  loans={loans}
                  farmers={farmers}
                  currentRole={currentRole}
                />
              )}

              {currentPage === 'research-dashboard' && (
                <ResearchDashboardPage
                  currentRole={currentRole}
                />
              )}

              {currentPage === 'sync-monitor' && (
                <SyncMonitorPage
                  onNavigate={handleNavigate}
                />
              )}

              {currentPage === 'admin-ops' && (
                <AdminOpsPage
                  currentRole={currentRole}
                />
              )}
            </Suspense>
          )}
        </main>

        {/* Global Accessibility Settings Modal */}
        {showA11yModal && (
          <AccessibilityModal
            isOpen={showA11yModal}
            onClose={() => setShowA11yModal(false)}
            currentLang={currentLang}
            settings={a11ySettings}
            onUpdateSettings={handleUpdateA11ySettings}
          />
        )}

        {/* Compliant Footer with Exact Required Disclaimer */}
        <footer
          style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#64748b'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: '#334155' }}>
              AgriSahay – Agriculture Loan and Farmer Support System
            </span>
            <span>
              Academic prototype for demonstration purposes only. Not connected to a live banking system.
            </span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              Designed for Small Finance Bank Placement Project • Research Prototype Demonstration
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
