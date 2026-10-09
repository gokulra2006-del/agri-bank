// Server-Side Role-Based Authorization Middleware (RBAC)
// Roles: ADMIN, BRANCH_MANAGER, RELATIONSHIP_OFFICER, AUDITOR, RESEARCHER

export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHENTICATED',
        message: 'Authentication required prior to authorization check.'
      });
    }

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN_INSUFFICIENT_PRIVILEGES',
        message: `Role '${userRole}' is not authorized to access this resource. Required: [${allowedRoles.join(', ')}].`
      });
    }

    next();
  };
}

// Four-Eye Governance Rule for Loan Sanctions:
// A Relationship Officer cannot approve their own originated loans.
// Only Branch Managers can sanction.
export function enforceMakerChecker(req, res, next) {
  if (req.user.role !== 'BRANCH_MANAGER' && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'FOUR_EYE_VIOLATION',
      message: 'Four-Eye Principle: Only Branch Managers and Admins possess sanctioning authority.'
    });
  }
  next();
}
