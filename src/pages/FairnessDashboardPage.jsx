import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  Scale,
  Users,
  Download,
  Printer,
  Info,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  FileText,
  BarChart2
} from 'lucide-react';
import { computeFairnessAndBiasMetrics } from '../utils/resilienceEngine';

export default function FairnessDashboardPage({
  farmers = [],
  loans = [],
  currentRole = 'manager',
  currentLang = 'en'
}) {
  const [selectedDimension, setSelectedDimension] = useState('ALL');
  const fairnessData = computeFairnessAndBiasMetrics(farmers, loans);

  // Group cohorts by category
  const categories = Array.from(new Set(fairnessData.cohorts.map(c => c.category)));

  // CSV Export for Aggregated Data
  const handleExportCSV = () => {
    let csv = 'Category,Cohort Group,Record Count,Avg Resilience Index,Approval Rate,Restructuring Rate,Status\n';
    fairnessData.cohorts.forEach(c => {
      csv += `"${c.category}","${c.groupName}","${c.isSuppressed ? '< 5' : c.count}","${c.avgIndex}","${c.approvalRate}","${c.restructuringRate}","${c.isSuppressed ? 'Suppressed (N < 5)' : 'Included'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agrisahay_fairness_aggregated_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '0.25rem 0.625rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
              Algorithmic Governance & Inclusion
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              DPDP Act Compliant • Aggregated Only
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Inclusion & Fairness Governance Dashboard
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
            Empirical monitoring of approval parity, resilience scoring variance, and restructuring support across agronomic cohorts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              backgroundColor: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '0.5rem 0.875rem',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <Download size={15} /> Export Aggregated CSV
          </button>
          <button
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              backgroundColor: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '0.5rem 0.875rem',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <Printer size={15} /> Print Report
          </button>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.875rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Shield size={18} style={{ color: '#15803d', flexShrink: 0 }} />
        <span style={{ fontSize: '0.8125rem', color: '#166534' }}>
          <strong>Privacy Threshold Enforced (k-Anonymity):</strong> To protect individual borrower confidentiality under India’s Digital Personal Data Protection (DPDP) Act, any demographic group with <strong>fewer than 5 records (N &lt; 5)</strong> is automatically suppressed from view and exports. Zero personal names, Aadhaar numbers, or individual credit amounts appear on this dashboard.
        </span>
      </div>

      {/* Disparity & Warning Flags */}
      {fairnessData.disparityFlags.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {fairnessData.disparityFlags.map((flag, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: flag.severity === 'Warning' ? '#fef2f2' : '#fffbeb',
                border: flag.severity === 'Warning' ? '1px solid #fecaca' : '1px solid #fef08a',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start'
              }}
            >
              <AlertTriangle size={18} style={{ color: flag.severity === 'Warning' ? '#dc2626' : '#d97706', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: flag.severity === 'Warning' ? '#991b1b' : '#92400e' }}>
                  {flag.title}
                </h4>
                <p style={{ fontSize: '0.8125rem', margin: '0 0 0.375rem 0', color: '#334155' }}>
                  {flag.message}
                </p>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803d' }}>
                  💡 Recommendation: {flag.recommendation}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aggregated Cohort Parity Tables */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
            Aggregated Group Comparisons & Parity Metrics
          </h3>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Total Sampled Borrowers: <strong>{farmers.length}</strong> | Total Evaluated Credit Facilities: <strong>{loans.length}</strong>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.625rem 1rem' }}>Cohort Dimension</th>
                <th style={{ padding: '0.625rem 1rem' }}>Cohort Group</th>
                <th style={{ padding: '0.625rem 1rem', textAlign: 'center' }}>Group Size (N)</th>
                <th style={{ padding: '0.625rem 1rem', textAlign: 'center' }}>Avg Resilience Index</th>
                <th style={{ padding: '0.625rem 1rem', textAlign: 'center' }}>Loan Approval Rate</th>
                <th style={{ padding: '0.625rem 1rem', textAlign: 'center' }}>Restructuring Rate</th>
                <th style={{ padding: '0.625rem 1rem' }}>Fairness Status</th>
              </tr>
            </thead>
            <tbody>
              {fairnessData.cohorts.map((cohort, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: cohort.isSuppressed ? '#f8fafc' : '#ffffff' }}>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: 500 }}>{cohort.category}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>{cohort.groupName}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    {cohort.isSuppressed ? (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>&lt; 5 (Suppressed)</span>
                    ) : (
                      <strong>{cohort.count}</strong>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    {cohort.isSuppressed ? (
                      <span style={{ color: '#94a3b8' }}>—</span>
                    ) : (
                      <span style={{
                        fontWeight: 700,
                        color: cohort.rawAvgIndex >= 70 ? '#15803d' : cohort.rawAvgIndex < 55 ? '#b91c1c' : '#d97706'
                      }}>
                        {cohort.avgIndex} / 100
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    {cohort.isSuppressed ? (
                      <span style={{ color: '#94a3b8' }}>—</span>
                    ) : (
                      <strong>{cohort.approvalRate}</strong>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    {cohort.isSuppressed ? (
                      <span style={{ color: '#94a3b8' }}>—</span>
                    ) : (
                      <span>{cohort.restructuringRate}</span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {cohort.isSuppressed ? (
                      <span style={{ fontSize: '0.6875rem', padding: '0.125rem 0.5rem', borderRadius: '10px', backgroundColor: '#f1f5f9', color: '#64748b' }}>
                        Privacy Protected
                      </span>
                    ) : cohort.rawAvgIndex < 55 ? (
                      <span style={{ fontSize: '0.6875rem', padding: '0.125rem 0.5rem', borderRadius: '10px', backgroundColor: '#fee2e2', color: '#b91c1c' }}>
                        Vulnerability Disparity
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.6875rem', padding: '0.125rem 0.5rem', borderRadius: '10px', backgroundColor: '#dcfce7', color: '#15803d' }}>
                        Within Parity Bounds
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* What This Shows and Its Limits Panel */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Info size={16} style={{ color: '#2563eb' }} /> What This Shows and Its Limits
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', fontSize: '0.8125rem', color: '#475569', marginTop: '0.75rem' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '0.875rem', borderRadius: '6px' }}>
            <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.25rem' }}>Diagnostic Indicator, Not Proof of Bias</strong>
            Aggregated statistical gaps across rainfed versus irrigated farmers do not prove intentional bias on their own. They reveal how agronomic weightings (such as irrigation security) structurally disadvantage dryland cultivators, pointing credit committees to introduce compensating safeguards.
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '0.875rem', borderRadius: '6px' }}>
            <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.25rem' }}>Climate Risk Must Guide Relief, Not Exclusion</strong>
            Village-level risk indicators and historical rainfall departures must be used for proactive climate support—such as PMFBY crop insurance enrollment, seed resowing advances, and repayment moratoria—rather than as grounds for redlining or denying credit to vulnerable villages.
          </div>
        </div>
      </div>
    </div>
  );
}
