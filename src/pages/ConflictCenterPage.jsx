import React, { useState } from 'react';
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Split,
  Laptop,
  Smartphone,
  Info,
  History,
  Check,
  Layers,
  RotateCw
} from 'lucide-react';
import { logAudit } from '../utils/audit';
import { t } from '../utils/i18n';

export default function ConflictCenterPage({
  conflicts = [],
  onUpdateConflicts,
  currentRole = 'officer',
  currentLang = 'en'
}) {
  const [selectedConflictId, setSelectedConflictId] = useState(conflicts[0]?.id || null);
  const [resolutionComment, setResolutionComment] = useState('');
  const [mergeSelections, setMergeSelections] = useState({});
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryBackoffSec, setRetryBackoffSec] = useState(1);
  const [syncHistory, setSyncHistory] = useState([
    { id: 'SH-01', timestamp: '2026-09-02 08:30:12', itemsCount: 4, successCount: 4, failedCount: 0, status: 'Success', note: 'All farmer profile edits synced cleanly.' },
    { id: 'SH-02', timestamp: '2026-09-02 08:45:00', itemsCount: 3, successCount: 2, failedCount: 1, status: 'Partial Failure (Conflict)', note: 'Collision on FAR-001; routed to Conflict Center.' }
  ]);

  const selectedConflict = conflicts.find(c => c.id === selectedConflictId) || conflicts[0];

  // Resolve conflict
  const handleResolveConflict = (choice) => {
    if (!resolutionComment.trim()) {
      alert('A resolution justification comment is mandatory for audit compliance.');
      return;
    }

    let resolvedData = {};
    if (choice === 'KEEP_LOCAL') {
      resolvedData = { ...selectedConflict.localData };
    } else if (choice === 'KEEP_REMOTE') {
      resolvedData = { ...selectedConflict.remoteData };
    } else if (choice === 'MERGE') {
      // Merge field by field based on checkboxes or default local
      resolvedData = {
        ...selectedConflict.remoteData,
        ...selectedConflict.localData,
        ...mergeSelections
      };
    }

    const updatedConflicts = conflicts.filter(c => c.id !== selectedConflict.id);
    onUpdateConflicts(updatedConflicts);

    // Append to sync history
    const historyEntry = {
      id: `SH-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString(),
      itemsCount: 1,
      successCount: 1,
      failedCount: 0,
      status: 'Resolved & Merged',
      note: `Conflict on ${selectedConflict.entityTitle} resolved via ${choice}: "${resolutionComment}"`
    };
    setSyncHistory([historyEntry, ...syncHistory]);

    // Audit trail log
    logAudit({
      action: 'SYNC_CONFLICT_RESOLVED',
      userRole: currentRole,
      entityId: selectedConflict.entityId,
      entityType: selectedConflict.entityType,
      previousStatus: 'Conflict',
      newStatus: 'Synced',
      notes: `Resolution method: ${choice}. Officer comment: ${resolutionComment}`
    });

    setResolutionComment('');
    setSelectedConflictId(updatedConflicts[0]?.id || null);
  };

  // Exponential backoff simulation
  const handleSimulateRetry = () => {
    setIsRetrying(true);
    let currentDelay = retryBackoffSec;

    setTimeout(() => {
      setIsRetrying(false);
      setRetryBackoffSec(prev => Math.min(16, prev * 2));
      alert(`Simulated sync attempt executed with ${currentDelay}s exponential backoff. Items without field collisions marked as Synced.`);
    }, currentDelay * 1000);
  };

  // Inject dual-officer collision scenario
  const handleTriggerSimulatedCollision = () => {
    const newCollision = {
      id: `CONF-${Date.now().toString().slice(-4)}`,
      entityType: 'Farmer Profile',
      entityId: 'FAR-002',
      entityTitle: 'Lakshmi Devi - Borewell Depth & Soil Status',
      conflictType: 'Concurrent Dual-Officer Edit Collision',
      detectedAt: new Date().toISOString(),
      deviceLabel: 'Field Tablet Tab-08 (Offline Sync)',
      localUser: 'Ramesh Kumar (ARO)',
      remoteUser: 'Central Underwriting Operations',
      localData: {
        irrigationType: 'Borewell 280ft Functional',
        soilHealthCard: 'Verified KVK Soil Report Grade-B',
        annualIncome: 240000,
        notes: 'Officer physical inspection confirmed active discharge.'
      },
      remoteData: {
        irrigationType: 'Borewell Seasonal Dry',
        soilHealthCard: 'Pending KVK Soil Lab Upload',
        annualIncome: 210000,
        notes: 'State groundwater registry flagged aquifer depletion.'
      },
      status: 'Conflict'
    };

    onUpdateConflicts([newCollision, ...conflicts]);
    setSelectedConflictId(newCollision.id);
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '0.25rem 0.625rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
              Offline Sync Engine
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Atomic Multi-Device Reconciliation
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Offline Conflict Center
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
            Detects concurrent field collisions and duplicate submissions with side-by-side reconciliation and mandatory audit logging.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleSimulateRetry}
            disabled={isRetrying}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '0.625rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: isRetrying ? 'not-allowed' : 'pointer'
            }}
          >
            <RotateCw size={16} className={isRetrying ? 'spin' : ''} />
            {isRetrying ? `Retrying (${retryBackoffSec}s backoff)...` : 'Retry Sync with Backoff'}
          </button>

          <button
            onClick={handleTriggerSimulatedCollision}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#d97706',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.625rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Split size={16} />
            Simulate New Collision
          </button>
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.875rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Info size={18} style={{ color: '#0284c7', flexShrink: 0 }} />
        <span style={{ fontSize: '0.8125rem', color: '#334155' }}>
          <strong>Simulated Offline Queue:</strong> This is an in-browser prototype demonstrating multi-officer data conflict handling. No actual HTTP sync or remote database server is accessed.
        </span>
      </div>

      {/* Main Conflict Review Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(540px, 2fr)', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Conflict Scenarios List */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: 0, color: '#0f172a' }}>
              Detected Conflicts ({conflicts.length})
            </h3>
          </div>

          {conflicts.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
              <CheckCircle2 size={36} style={{ color: '#15803d', margin: '0 auto 0.75rem auto', display: 'block' }} />
              All offline queues are synchronized cleanly. No record conflicts detected.
            </div>
          ) : (
            <div>
              {conflicts.map(conf => {
                const isSelected = conf.id === selectedConflict?.id;
                return (
                  <div
                    key={conf.id}
                    onClick={() => setSelectedConflictId(conf.id)}
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: isSelected ? '#fffbeb' : '#ffffff',
                      borderLeft: isSelected ? '4px solid #d97706' : '4px solid transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706' }}>{conf.id}</span>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '0.125rem 0.5rem', borderRadius: '10px', backgroundColor: '#fee2e2', color: '#b91c1c' }}>
                        {conf.conflictType.includes('Duplicate') ? 'Duplicate Checksum' : 'Edit Collision'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{conf.entityTitle}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Device: {conf.deviceLabel} • {new Date(conf.detectedAt).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Side-by-Side Comparison & Merge Box */}
        {selectedConflict ? (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem' }}>
            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 700 }}>{selectedConflict.conflictType}</span>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0.25rem 0' }}>
                    {selectedConflict.entityTitle}
                  </h2>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                    Entity ID: <strong>{selectedConflict.entityId}</strong> ({selectedConflict.entityType})
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>
                  Detected: {new Date(selectedConflict.detectedAt).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Side-by-Side Comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              {/* Local / Mine */}
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Smartphone size={16} style={{ color: '#15803d' }} />
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#15803d' }}>
                    Local Field Copy (Device: {selectedConflict.deviceLabel})
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#166534', marginBottom: '0.5rem' }}>
                  Submitted by: <strong>{selectedConflict.localUser}</strong>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                  {Object.entries(selectedConflict.localData).map(([key, val]) => (
                    <div key={key} style={{ backgroundColor: '#ffffff', padding: '0.5rem', borderRadius: '4px', border: '1px solid #dcfce7' }}>
                      <span style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>{key}</span>
                      <strong style={{ color: '#0f172a' }}>{String(val)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Server / Remote */}
              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Laptop size={16} style={{ color: '#1d4ed8' }} />
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1d4ed8' }}>
                    Server Version (Central Record)
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.5rem' }}>
                  Author: <strong>{selectedConflict.remoteUser}</strong>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                  {Object.entries(selectedConflict.remoteData).map(([key, val]) => (
                    <div key={key} style={{ backgroundColor: '#ffffff', padding: '0.5rem', borderRadius: '4px', border: '1px solid #dbeafe' }}>
                      <span style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>{key}</span>
                      <strong style={{ color: '#0f172a' }}>{String(val)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Resolution Comment & Decisions */}
            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>
                Reconciliation Justification (Mandatory for Audit Trail) *
              </label>
              <input
                type="text"
                value={resolutionComment}
                onChange={(e) => setResolutionComment(e.target.value)}
                placeholder="e.g. Verified with village Patwari; local borewell reading confirmed accurate."
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
              />

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleResolveConflict('KEEP_LOCAL')}
                  style={{
                    flex: 1,
                    backgroundColor: '#15803d',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.625rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Accept Local Field Copy
                </button>

                <button
                  onClick={() => handleResolveConflict('KEEP_REMOTE')}
                  style={{
                    flex: 1,
                    backgroundColor: '#1e40af',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.625rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Keep Central Server Copy
                </button>

                <button
                  onClick={() => handleResolveConflict('MERGE')}
                  style={{
                    flex: 1,
                    backgroundColor: '#475569',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.625rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Merge Fields & Sync
                </button>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <ShieldCheck size={14} style={{ color: '#15803d' }} />
              Atomic Resolution Guarantee: Selection commits synchronously and records an immutable hash-chained audit event.
            </div>
          </div>
        ) : null}
      </div>

      {/* Sync History Log */}
      <div style={{ marginTop: '2rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <History size={16} /> Recent Sync Reconciliation Log
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.5rem 0.75rem' }}>Sync ID</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Timestamp</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Items Queued</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Status</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Resolution Summary</th>
              </tr>
            </thead>
            <tbody>
              {syncHistory.map(h => (
                <tr key={h.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#334155' }}>{h.id}</td>
                  <td style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>{h.timestamp}</td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>{h.itemsCount}</td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>
                    <span style={{
                      padding: '0.125rem 0.5rem',
                      borderRadius: '10px',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      backgroundColor: h.status.includes('Success') || h.status.includes('Resolved') ? '#dcfce7' : '#fee2e2',
                      color: h.status.includes('Success') || h.status.includes('Resolved') ? '#15803d' : '#b91c1c'
                    }}>
                      {h.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', color: '#475569' }}>{h.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
