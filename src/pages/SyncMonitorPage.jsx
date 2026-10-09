import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  AlertOctagon,
  CheckCircle2,
  Clock,
  ArrowRight,
  Database,
  ShieldCheck,
  RotateCcw,
  Trash2,
  Sliders,
  Filter,
  Check
} from 'lucide-react';
import { loadStore, updateStore, STORES } from '../data/mockStore';
import { logAudit } from '../utils/audit';
import StatusBadge from '../components/StatusBadge';

export default function SyncMonitorPage({ currentRole = 'manager' }) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [syncEvents, setSyncEvents] = useState(() => {
    return loadStore(STORES.SYNC_CONFLICTS) || [
      {
        id: 'SYNC-101',
        idempotency_key: 'IDEM-MANDYA-001',
        officer_id: 'USR-002',
        officer_name: 'Gokul Sharma',
        entity_type: 'FARMER',
        entity_id: 'FAR-001',
        farmer_name: 'Basavaraj Patil',
        action: 'UPDATE',
        status: 'CONFLICT',
        base_version: 1,
        server_version: 2,
        conflict_field: 'land_type',
        local_value: 'Borewell Irrigated (Drip Installed)',
        server_value: 'Canal Irrigated',
        retry_count: 1,
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'SYNC-102',
        idempotency_key: 'IDEM-MANDYA-002',
        officer_id: 'USR-002',
        officer_name: 'Gokul Sharma',
        entity_type: 'FIELD_VISIT',
        entity_id: 'VST-201',
        farmer_name: 'Mallamma Gowda',
        action: 'CREATE',
        status: 'PENDING',
        retry_count: 0,
        created_at: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 'SYNC-103',
        idempotency_key: 'IDEM-MANDYA-003',
        officer_id: 'USR-002',
        officer_name: 'Gokul Sharma',
        entity_type: 'LOAN_APPLICATION',
        entity_id: 'LN-2025-004',
        farmer_name: 'Channappa Gowda',
        action: 'CREATE',
        status: 'SYNCED',
        retry_count: 0,
        synced_at: new Date(Date.now() - 900000).toISOString(),
        created_at: new Date(Date.now() - 1200000).toISOString()
      },
      {
        id: 'SYNC-104',
        idempotency_key: 'IDEM-MANDYA-004',
        officer_id: 'USR-002',
        officer_name: 'Gokul Sharma',
        entity_type: 'PMFBY_LOSS',
        entity_id: 'CLM-009',
        farmer_name: 'Suresh Patil',
        action: 'CREATE',
        status: 'FAILED',
        retry_count: 3,
        error_message: 'Gateway Timeout (504): Intermittent 2G cellular packet loss in village shadow zone.',
        created_at: new Date(Date.now() - 7200000).toISOString()
      }
    ];
  });

  const [selectedConflict, setSelectedConflict] = useState(null);
  const [resolutionChoice, setResolutionChoice] = useState('LOCAL');
  const [resolutionComment, setResolutionComment] = useState('');
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const counts = {
    ALL: syncEvents.length,
    PENDING: syncEvents.filter(s => s.status === 'PENDING').length,
    SYNCING: syncEvents.filter(s => s.status === 'SYNCING').length,
    SYNCED: syncEvents.filter(s => s.status === 'SYNCED').length,
    FAILED: syncEvents.filter(s => s.status === 'FAILED').length,
    CONFLICT: syncEvents.filter(s => s.status === 'CONFLICT').length,
    RETRIED: syncEvents.filter(s => s.status === 'RETRIED' || (s.retry_count > 0 && s.status !== 'FAILED')).length
  };

  const handleRetryFailed = () => {
    setIsSyncingAll(true);
    setTimeout(() => {
      const updated = syncEvents.map(s => {
        if (s.status === 'FAILED') {
          return {
            ...s,
            status: 'SYNCED',
            retry_count: s.retry_count + 1,
            synced_at: new Date().toISOString(),
            error_message: null
          };
        }
        return s;
      });
      setSyncEvents(updated);
      setIsSyncingAll(false);
      logAudit({
        action: 'OFFLINE_RETRY_EXECUTED',
        userRole: currentRole,
        entityId: 'QUEUE-RETRY',
        entityType: 'Offline Synchronization',
        notes: `Retried failed queue items with exponential backoff and idempotency verification.`
      });
    }, 1200);
  };

  const handleResolveConflict = (e) => {
    e.preventDefault();
    if (!selectedConflict || !resolutionComment.trim()) {
      alert('Please provide a mandatory resolution explanation for the audit trail.');
      return;
    }

    const updated = syncEvents.map(s => {
      if (s.id === selectedConflict.id) {
        return {
          ...s,
          status: 'SYNCED',
          resolved_at: new Date().toISOString(),
          resolved_choice: resolutionChoice,
          resolution_comment: resolutionComment
        };
      }
      return s;
    });

    setSyncEvents(updated);
    logAudit({
      action: 'SYNC_CONFLICT_RESOLVED',
      userRole: currentRole,
      entityId: selectedConflict.entity_id,
      entityType: selectedConflict.entity_type,
      notes: `Resolved ${selectedConflict.conflict_field} conflict using ${resolutionChoice} value. Justification: ${resolutionComment}.`
    });

    setSelectedConflict(null);
    setResolutionComment('');
  };

  const filteredEvents = syncEvents.filter(s => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'RETRIED') return s.status === 'RETRIED' || (s.retry_count > 0 && s.status !== 'FAILED');
    return s.status === activeTab;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
            Offline Sync & Queue Monitor
          </h1>
          <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            Real-time synchronization status, idempotency key tracking, and field-level collision reconciliation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleRetryFailed}
            disabled={isSyncingAll || counts.FAILED === 0}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RefreshCw size={14} className={isSyncingAll ? 'spin' : ''} />
            {isSyncingAll ? 'Replaying Queue...' : `Retry Failed (${counts.FAILED})`}
          </button>
          <button
            onClick={() => setSyncEvents(syncEvents.filter(s => s.status !== 'SYNCED'))}
            className="btn btn-secondary btn-sm"
            disabled={counts.SYNCED === 0}
          >
            <Trash2 size={14} />
            Purge Synced
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
        {[
          { label: 'Pending', count: counts.PENDING, color: '#d97706', bg: '#fef3c7' },
          { label: 'Syncing', count: counts.SYNCING, color: '#2563eb', bg: '#eff6ff' },
          { label: 'Synced', count: counts.SYNCED, color: '#15803d', bg: '#dcfce7' },
          { label: 'Failed', count: counts.FAILED, color: '#dc2626', bg: '#fee2e2' },
          { label: 'Conflict', count: counts.CONFLICT, color: '#b91c1c', bg: '#fef2f2' },
          { label: 'Retried', count: counts.RETRIED, color: '#4f46e5', bg: '#eef2ff' }
        ].map((m, idx) => (
          <div key={idx} className="card" style={{ padding: '0.875rem', borderLeft: `4px solid ${m.color}` }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              {m.label}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: m.color, marginTop: '0.25rem' }}>
              {m.count}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        {['ALL', 'PENDING', 'SYNCED', 'FAILED', 'CONFLICT', 'RETRIED'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.8125rem',
              fontWeight: activeTab === tab ? 700 : 500,
              backgroundColor: activeTab === tab ? '#15803d' : '#f8fafc',
              color: activeTab === tab ? '#ffffff' : '#475569',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {tab} ({counts[tab] || 0})
          </button>
        ))}
      </div>

      {/* Queue Table */}
      <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
        <table className="table" style={{ width: '100%', fontSize: '0.8125rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem' }}>Idempotency Key</th>
              <th style={{ padding: '0.75rem' }}>Entity</th>
              <th style={{ padding: '0.75rem' }}>Action</th>
              <th style={{ padding: '0.75rem' }}>Officer</th>
              <th style={{ padding: '0.75rem' }}>Status</th>
              <th style={{ padding: '0.75rem' }}>Retries</th>
              <th style={{ padding: '0.75rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                  No queue events in this state.
                </td>
              </tr>
            ) : (
              filteredEvents.map(ev => (
                <tr key={ev.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#1e3a8a' }}>
                    {ev.idempotency_key}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{ev.farmer_name || ev.entity_id}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{ev.entity_type} ({ev.entity_id})</div>
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>
                    {ev.action}
                  </td>
                  <td style={{ padding: '0.75rem', color: '#475569' }}>
                    {ev.officer_name || ev.officer_id}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: ev.status === 'SYNCED' ? '#dcfce7' : ev.status === 'CONFLICT' ? '#fee2e2' : ev.status === 'FAILED' ? '#fee2e2' : '#fef3c7',
                      color: ev.status === 'SYNCED' ? '#15803d' : ev.status === 'CONFLICT' ? '#b91c1c' : ev.status === 'FAILED' ? '#dc2626' : '#d97706'
                    }}>
                      {ev.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {ev.retry_count || 0}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {ev.status === 'CONFLICT' ? (
                      <button
                        onClick={() => setSelectedConflict(ev)}
                        className="btn btn-danger btn-sm"
                        style={{ fontSize: '0.75rem' }}
                      >
                        Resolve Conflict
                      </button>
                    ) : ev.status === 'FAILED' ? (
                      <button
                        onClick={handleRetryFailed}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem' }}
                      >
                        Retry Now
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Conflict Resolution Modal */}
      {selectedConflict && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '1.5rem', maxWidth: '580px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Field-Level Conflict Reconciliation: {selectedConflict.farmer_name}
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>
              Dual-officer collision detected. Compare offline field observation against core branch state and select the authoritative record.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div
                onClick={() => setResolutionChoice('LOCAL')}
                style={{
                  padding: '0.875rem',
                  borderRadius: '6px',
                  border: resolutionChoice === 'LOCAL' ? '2px solid #15803d' : '1px solid #cbd5e1',
                  backgroundColor: resolutionChoice === 'LOCAL' ? '#f0fdf4' : '#f8fafc',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>
                  Offline Field Device Value
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginTop: '0.25rem' }}>
                  {selectedConflict.local_value}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Observed by field officer in village
                </div>
              </div>

              <div
                onClick={() => setResolutionChoice('SERVER')}
                style={{
                  padding: '0.875rem',
                  borderRadius: '6px',
                  border: resolutionChoice === 'SERVER' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  backgroundColor: resolutionChoice === 'SERVER' ? '#eff6ff' : '#f8fafc',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                  Core Branch State
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginTop: '0.25rem' }}>
                  {selectedConflict.server_value}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Recorded at branch credit desk
                </div>
              </div>
            </div>

            <form onSubmit={handleResolveConflict}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Mandatory Audit Justification *
                </label>
                <textarea
                  required
                  rows={2}
                  value={resolutionComment}
                  onChange={(e) => setResolutionComment(e.target.value)}
                  placeholder="Explain why this value was accepted (e.g., physically verified micro-drip kit during field visit)..."
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.8125rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedConflict(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                >
                  Confirm & Chain to Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
