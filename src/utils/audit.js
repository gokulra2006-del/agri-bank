// Centralized Audit Logger for AgriSahay Banking Prototype

const AUDIT_STORAGE_KEY = 'agrisahay_audit_logs';

export const getAuditLogs = () => {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Audit read error', e);
    return [];
  }
};

export const logAudit = ({
  action,
  userRole,
  entityId,
  entityType = 'Loan/Farmer',
  previousStatus = null,
  newStatus = null,
  notes = ''
}) => {
  try {
    const existing = getAuditLogs();
    const entry = {
      id: `AUD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      action,
      userRole,
      timestamp: new Date().toISOString(),
      entityId,
      entityType,
      previousStatus: previousStatus || '-',
      newStatus: newStatus || '-',
      notes: notes || 'Automated system entry'
    };
    const updated = [entry, ...existing].slice(0, 500); // retain last 500 actions
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
    return entry;
  } catch (e) {
    console.error('Audit write error', e);
  }
};
