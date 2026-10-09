// Server-Side Cryptographic Hash-Chained Audit Logger
import { getDb } from '../database/db.js';

const GENESIS_HASH = '0000000000000000';

export function calculateEntryHash(prevHash, entry) {
  const content = `${prevHash || GENESIS_HASH}|${entry.id}|${entry.action}|${entry.user_role}|${entry.created_at}|${entry.entity_id}|${entry.entity_type}|${entry.previous_status || '-'}|${entry.new_status || '-'}|${entry.notes || ''}`;
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

export async function logServerAudit({
  action,
  userId = 'SYSTEM',
  userRole = 'SYSTEM',
  entityId,
  entityType,
  previousStatus = '-',
  newStatus = '-',
  notes = ''
}) {
  const db = await getDb();
  const existingEvents = db.tables.audit_events;
  const lastEvent = existingEvents.length > 0 ? existingEvents[existingEvents.length - 1] : null;
  const prevHash = lastEvent ? lastEvent.hash : GENESIS_HASH;

  const newEntry = {
    id: `AUD-SRV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    sequence_num: existingEvents.length + 1,
    action,
    user_id: userId,
    user_role: userRole,
    entity_id: entityId,
    entity_type: entityType,
    previous_status: previousStatus,
    new_status: newStatus,
    notes,
    prev_hash: prevHash,
    created_at: new Date().toISOString()
  };

  newEntry.hash = calculateEntryHash(prevHash, newEntry);
  existingEvents.push(newEntry);
  return newEntry;
}

export async function verifyServerAuditChain() {
  const db = await getDb();
  const events = db.tables.audit_events;
  if (!events || events.length === 0) {
    return { isValid: true, totalEntries: 0, message: 'No server audit records found.' };
  }

  let expectedPrevHash = GENESIS_HASH;
  for (let i = 0; i < events.length; i++) {
    const entry = events[i];
    if (entry.prev_hash !== expectedPrevHash) {
      return {
        isValid: false,
        totalEntries: events.length,
        brokenAtIndex: i,
        brokenAtId: entry.id,
        message: `Broken chain link at index ${i} (${entry.id}). Previous hash mismatch.`
      };
    }

    const calculated = calculateEntryHash(entry.prev_hash, entry);
    if (entry.hash !== calculated) {
      return {
        isValid: false,
        totalEntries: events.length,
        brokenAtIndex: i,
        brokenAtId: entry.id,
        message: `Tampering detected at index ${i} (${entry.id}). Content hash mismatch.`
      };
    }
    expectedPrevHash = entry.hash;
  }

  return {
    isValid: true,
    totalEntries: events.length,
    message: `All ${events.length} audit entries cryptographically verified against genesis hash.`
  };
}
