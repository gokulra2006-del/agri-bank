// Role-Based Access Control (RBAC) System for AgriSahay Banking System
// Compliant with banking dual-control principles

export const ROLES = {
  MANAGER: 'Branch Manager',
  OFFICER: 'Agriculture Relationship Officer',
  ADMIN: 'Operations Admin',
  RESEARCHER: 'Principal Usability Researcher'
};

export const ROLE_KEYS = {
  MANAGER: 'manager',
  OFFICER: 'officer',
  ADMIN: 'admin',
  RESEARCHER: 'researcher'
};

// Route permissions per role
export const ROLE_PERMISSIONS = {
  [ROLE_KEYS.OFFICER]: {
    allowedRoutes: [
      'dashboard',
      'impact-dashboard',
      'innovation-center',
      'field-mode',
      'farmers',
      'farmer-profile',
      'loans',
      'loan-detail',
      'repayment-planner',
      'credit-protection',
      'conflict-center',
      'eligibility',
      'repayments',
      'crop-calendar',
      'weather-risk',
      'risk-simulator',
      'schemes',
      'privacy-center',
      'help-desk',
      'notifications',
      'settings',
      'language-preview',
      'research-dashboard',
      'sync-monitor'
    ],
    canApproveLoan: false,
    canRejectLoan: false,
    canDisburseLoan: false,
    canDeleteFarmer: false,
    canAccessAuditLog: false,
    canManageBranches: false,
    canAccessReports: false,
    canCreateFieldVisit: true,
    canCreateFarmer: true,
    canCreateLoan: true
  },

  [ROLE_KEYS.MANAGER]: {
    allowedRoutes: [
      'dashboard',
      'impact-dashboard',
      'innovation-center',
      'farmers',
      'farmer-profile',
      'loans',
      'loan-detail',
      'repayment-planner',
      'credit-protection',
      'conflict-center',
      'fairness-dashboard',
      'research-dashboard',
      'eligibility',
      'repayments',
      'risk-monitoring',
      'risk-simulator',
      'village-heatmap',
      'weather-risk',
      'crop-calendar',
      'schemes',
      'privacy-center',
      'documents',
      'branches',
      'reports',
      'audit-log',
      'help-desk',
      'notifications',
      'settings',
      'language-preview',
      'sync-monitor',
      'admin-ops'
    ],
    canApproveLoan: true,
    canRejectLoan: true,
    canDisburseLoan: true,
    canDeleteFarmer: true,
    canAccessAuditLog: true,
    canManageBranches: true,
    canAccessReports: true,
    canCreateFieldVisit: false,
    canCreateFarmer: true,
    canCreateLoan: true
  },

  [ROLE_KEYS.ADMIN]: {
    allowedRoutes: [
      'dashboard',
      'impact-dashboard',
      'innovation-center',
      'farmers',
      'farmer-profile',
      'loans',
      'loan-detail',
      'repayment-planner',
      'credit-protection',
      'conflict-center',
      'fairness-dashboard',
      'research-dashboard',
      'documents',
      'branches',
      'reports',
      'audit-log',
      'risk-monitoring',
      'risk-simulator',
      'village-heatmap',
      'privacy-center',
      'help-desk',
      'notifications',
      'settings',
      'language-preview',
      'sync-monitor',
      'admin-ops'
    ],
    canApproveLoan: false,
    canRejectLoan: false,
    canDisburseLoan: false,
    canDeleteFarmer: true,
    canAccessAuditLog: true,
    canManageBranches: true,
    canAccessReports: true,
    canCreateFieldVisit: false,
    canCreateFarmer: true,
    canCreateLoan: false
  },

  [ROLE_KEYS.RESEARCHER]: {
    allowedRoutes: [
      'dashboard',
      'impact-dashboard',
      'research-dashboard',
      'fairness-dashboard',
      'language-preview',
      'credit-protection',
      'conflict-center',
      'innovation-center',
      'farmers',
      'farmer-profile',
      'loans',
      'loan-detail',
      'repayment-planner',
      'risk-simulator',
      'village-heatmap',
      'privacy-center',
      'help-desk',
      'settings',
      'sync-monitor',
      'admin-ops'
    ],
    canApproveLoan: false,
    canRejectLoan: false,
    canDisburseLoan: false,
    canDeleteFarmer: false,
    canAccessAuditLog: false,
    canManageBranches: false,
    canAccessReports: true,
    canCreateFieldVisit: false,
    canCreateFarmer: false,
    canCreateLoan: false
  }
};

export const normalizeRoleKey = (role) => {
  if (!role) return ROLE_KEYS.MANAGER;
  const str = String(role).trim().toLowerCase();
  if (str.includes('officer') || str === 'officer') return ROLE_KEYS.OFFICER;
  if (str.includes('admin') || str === 'admin') return ROLE_KEYS.ADMIN;
  if (str.includes('researcher') || str === 'researcher') return ROLE_KEYS.RESEARCHER;
  if (str.includes('manager') || str === 'manager') return ROLE_KEYS.MANAGER;
  return ROLE_KEYS.MANAGER;
};

export const hasRouteAccess = (roleKey, routeId) => {
  if (!routeId) return true;
  const normalizedKey = normalizeRoleKey(roleKey);
  const perms = ROLE_PERMISSIONS[normalizedKey] || ROLE_PERMISSIONS[ROLE_KEYS.MANAGER];
  return Array.isArray(perms?.allowedRoutes) ? perms.allowedRoutes.includes(routeId) : true;
};

export const canPerformAction = (roleKey, action) => {
  if (!action) return false;
  const normalizedKey = normalizeRoleKey(roleKey);
  const perms = ROLE_PERMISSIONS[normalizedKey] || ROLE_PERMISSIONS[ROLE_KEYS.MANAGER];
  return Boolean(perms?.[action]);
};


