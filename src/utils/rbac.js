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
      'innovation-center',
      'field-mode',
      'farmers',
      'farmer-profile',
      'loans',
      'loan-detail',
      'eligibility',
      'repayments',
      'crop-calendar',
      'weather-risk',
      'schemes',
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
      'innovation-center',
      'farmers',
      'farmer-profile',
      'loans',
      'loan-detail',
      'eligibility',
      'repayments',
      'risk-monitoring',
      'weather-risk',
      'crop-calendar',
      'schemes',
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
      'innovation-center',
      'farmers',
      'farmer-profile',
      'loans',
      'loan-detail',
      'documents',
      'branches',
      'reports',
      'audit-log',
      'risk-monitoring',
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
