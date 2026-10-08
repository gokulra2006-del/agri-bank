// Role-Based Access Control (RBAC) System for AgriSahay Banking System
// Compliant with banking dual-control principles

export const ROLES = {
  MANAGER: 'Branch Manager',
  OFFICER: 'Agriculture Relationship Officer',
  ADMIN: 'Operations Admin'
};

export const ROLE_KEYS = {
  MANAGER: 'manager',
  OFFICER: 'officer',
  ADMIN: 'admin'
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
      'eligibility',
      'repayments',
      'crop-calendar',
      'weather-risk',
      'risk-simulator',
      'schemes',
      'privacy-center',
      'help-desk',
      'notifications',
      'settings'
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
      'settings'
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
      'settings'
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
  }
};

export const hasRouteAccess = (roleKey, routeId) => {
  const perms = ROLE_PERMISSIONS[roleKey] || ROLE_PERMISSIONS[ROLE_KEYS.MANAGER];
  return perms.allowedRoutes.includes(routeId);
};

export const canPerformAction = (roleKey, action) => {
  const perms = ROLE_PERMISSIONS[roleKey] || ROLE_PERMISSIONS[ROLE_KEYS.MANAGER];
  return Boolean(perms[action]);
};
