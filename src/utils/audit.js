// Centralized Tamper-Evident Audit Logger for AgriSahay Banking Prototype
// Note: Prototype demonstration of hash-chained audit logging. A production system requires server-side storage, cryptographic signing, access controls, and independent audit infrastructure.

const AUDIT_STORAGE_KEY = 'agrisahay_audit_logs';
export const GENESIS_HASH = '0000000000000000';

// Deterministic fast hashing for audit entry chaining
export function calculateEntryHash(prevHash, entry) {
  const content = `${prevHash || GENESIS_HASH}|${entry.id}|${entry.action}|${entry.userRole}|${entry.timestamp}|${entry.entityId}|${entry.entityType}|${entry.previousStatus || '-'}|${entry.newStatus || '-'}|${entry.notes || ''}`;
  let h1 = 0xdeadbeef ^ content.length;
  let h2 = 0x41c64e6d ^ content.length;
  for (let i = 0; i < content.length; i++) {
    const ch = content.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hashVal = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  return hashVal.padStart(16, '0');
}

export const getAuditLogs = () => {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) return [];
    let logs = JSON.parse(raw);
    if (!Array.isArray(logs)) return [];

    // Ensure legacy logs have hashes backfilled in forward chronological order
    if (logs.length > 0 && (!logs[0].hash || !logs[logs.length - 1].hash)) {
      logs = backfillAuditChain(logs);
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
    }
    return logs;
  } catch (e) {
    console.error('Audit read error', e);
    return [];
  }
};

// Backfill hashes on legacy or unhashed logs from chronological oldest to newest
function backfillAuditChain(logs) {
  if (!logs || logs.length === 0) return [];
  // logs are stored newest-first. Reverse to iterate oldest-first:
  const chronological = [...logs].reverse();
  let prevHash = GENESIS_HASH;
  for (let i = 0; i < chronological.length; i++) {
    const item = chronological[i];
    item.prevHash = prevHash;
    item.hash = calculateEntryHash(prevHash, item);
    prevHash = item.hash;
  }
  return chronological.reverse();
}

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
    const latestEntry = existing.length > 0 ? existing[0] : null;
    const prevHash = latestEntry && latestEntry.hash ? latestEntry.hash : GENESIS_HASH;

    const baseEntry = {
      id: `AUD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      action,
      userRole,
      timestamp: new Date().toISOString(),
      entityId,
      entityType,
      previousStatus: previousStatus || '-',
      newStatus: newStatus || '-',
      notes: notes || 'Automated system entry',
      prevHash
    };

    baseEntry.hash = calculateEntryHash(prevHash, baseEntry);

    const updated = [baseEntry, ...existing].slice(0, 500); // retain last 500 actions
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
    return baseEntry;
  } catch (e) {
    console.error('Audit write error', e);
  }
};

/**
 * Validates cryptographic chain integrity across all stored audit entries.
 * Returns { isValid, totalEntries, brokenAtIndex, brokenAtId, message }
 */
export const verifyAuditChain = (customLogs = null) => {
  try {
    const logs = customLogs || getAuditLogs();
    if (!logs || logs.length === 0) {
      return {
        isValid: true,
        totalEntries: 0,
        message: 'No audit records to verify. Audit trail is empty.'
      };
    }

    // Verify in chronological order (oldest to newest)
    const chronological = [...logs].reverse();
    let expectedPrevHash = GENESIS_HASH;

    for (let i = 0; i < chronological.length; i++) {
      const entry = chronological[i];
      if (entry.prevHash !== expectedPrevHash) {
        return {
          isValid: false,
          totalEntries: logs.length,
          brokenAtIndex: logs.length - 1 - i,
          brokenAtId: entry.id,
          message: `Chain link broken at entry #${logs.length - 1 - i} (${entry.id}). Previous hash mismatch.`
        };
      }

      const expectedHash = calculateEntryHash(entry.prevHash, entry);
      if (entry.hash !== expectedHash) {
        return {
          isValid: false,
          totalEntries: logs.length,
          brokenAtIndex: logs.length - 1 - i,
          brokenAtId: entry.id,
          message: `Content modification detected at entry #${logs.length - 1 - i} (${entry.id}). Hash signature mismatch.`
        };
      }

      expectedPrevHash = entry.hash;
    }

    return {
      isValid: true,
      totalEntries: logs.length,
      message: `Audit chain verified intact across ${logs.length} logged actions. No tampering detected.`
    };
  } catch (e) {
    return {
      isValid: false,
      totalEntries: 0,
      message: `Error verifying audit chain: ${e.message}`
    };
  }
};

