import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Search,
  Filter,
  ShieldCheck,
  Calendar,
  Clock,
  ArrowUpDown,
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Hash
} from 'lucide-react';
import { getAuditLogs, verifyAuditChain } from '../utils/audit';

export default function AuditLogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [verificationResult, setVerificationResult] = useState(null);
  const auditLogs = getAuditLogs();

  const handleVerifyChain = () => {
    const res = verifyAuditChain(auditLogs);
    setVerificationResult(res);
  };

  const filtered = auditLogs.filter(log => {
    const matchSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userRole.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'ALL' || log.userRole === roleFilter;
    const matchAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchSearch && matchRole && matchAction;
  });

  const uniqueActions = Array.from(new Set(auditLogs.map(l => l.action)));

  const handleExportCSV = () => {
    let csv = "data:text/csv;charset=utf-8,";
    csv += "Audit ID,Timestamp,Action,User Role,Entity ID,Previous Status,New Status,PrevHash,EntryHash,Audit Notes\n";
    filtered.forEach(l => {
      csv += `"${l.id}","${l.timestamp}","${l.action}","${l.userRole}","${l.entityId}","${l.previousStatus}","${l.newStatus}","${l.prevHash || ''}","${l.hash || ''}","${(l.notes || '').replace(/"/g, '""')}"\n`;
    });

    const encodedUri = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AgriSahay_AuditTrail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              System Audit Trail & Compliance Ledger
            </h1>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '9999px', backgroundColor: '#e0e7ff', color: '#3730a3' }}>
              Manager & Admin Only
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
            Tamper-evident audit design in the prototype. A production version would require server-side storage, encryption, access controls and independent audit infrastructure.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleVerifyChain}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              backgroundColor: '#15803d',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 0.875rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <ShieldCheck size={16} />
            Verify Audit Chain Integrity
          </button>

          <button className="btn btn-primary" onClick={handleExportCSV}>
            <Download size={15} />
            Export Audit Trail (CSV)
          </button>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verificationResult && (
        <div style={{
          backgroundColor: verificationResult.isValid ? '#f0fdf4' : '#fef2f2',
          border: verificationResult.isValid ? '1px solid #bbf7d0' : '1px solid #fecaca',
          borderRadius: '8px',
          padding: '0.875rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          {verificationResult.isValid ? (
            <CheckCircle2 size={20} style={{ color: '#15803d', flexShrink: 0 }} />
          ) : (
            <AlertTriangle size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
          )}
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: verificationResult.isValid ? '#166534' : '#991b1b' }}>
              {verificationResult.isValid ? 'Audit Chain Verification: INTACT' : 'Audit Chain Verification: INTEGRITY WARNING'}
            </div>
            <div style={{ fontSize: '0.8125rem', color: verificationResult.isValid ? '#15803d' : '#b91c1c', marginTop: '0.125rem' }}>
              {verificationResult.message}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search audit action, ID, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.25rem', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Role:</span>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="ALL">All Roles</option>
              <option value="Branch Manager">Branch Manager</option>
              <option value="Agriculture Relationship Officer">Agriculture Relationship Officer</option>
              <option value="Operations Admin">Operations Admin</option>
            </select>

            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Action:</span>
            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
              <option value="ALL">All Actions</option>
              {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Audit Action & Hash</th>
                <th>Performed By</th>
                <th>Entity Target</th>
                <th>Status Shift</th>
                <th>Audit Details & System Note</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                filtered.map(entry => (
                  <tr key={entry.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: '#0f172a', display: 'block' }}>
                        {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString('en-IN') : '-'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {entry.timestamp ? new Date(entry.timestamp).toLocaleDateString('en-IN') : '-'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#1e3a8a', display: 'block' }}>
                        {entry.action}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{entry.id}</span>
                      {entry.hash && (
                        <div style={{ fontFamily: 'monospace', fontSize: '0.625rem', color: '#059669', marginTop: '0.125rem' }}>
                          ⛓️ {entry.hash.slice(0, 8)}...
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#334155' }}>
                        {entry.userRole}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{entry.entityId}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>{entry.entityType}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                        <span style={{ color: '#64748b' }}>{entry.previousStatus}</span>
                        <span>→</span>
                        <span style={{ fontWeight: 600, color: '#15803d' }}>{entry.newStatus}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: '#475569' }}>
                        {entry.notes}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

