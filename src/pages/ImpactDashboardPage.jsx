import React, { useState } from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  CalendarCheck2,
  ShieldCheck,
  Printer,
  Download,
  BarChart3,
  Users,
  Compass,
  FileSpreadsheet
} from 'lucide-react';
import { formatINR } from '../data/mockStore';

export default function ImpactDashboardPage({
  farmers = [],
  loans = [],
  repayments = [],
  visits = []
}) {
  const [downloadNotice, setDownloadNotice] = useState(null);

  // Computations
  const safeFarmers = Array.isArray(farmers) ? farmers : [];
  const safeLoans = Array.isArray(loans) ? loans : [];
  const safeRepayments = Array.isArray(repayments) ? repayments : [];
  const safeVisits = Array.isArray(visits) ? visits : [];

  const totalFarmers = safeFarmers.length;
  const completedVisits = safeVisits.filter(v => v && v.status === 'Completed').length;
  const totalLoans = safeLoans.length;
  const harvestAlignedLoans = safeLoans.filter(l => l && l.repaymentScheduleType && l.repaymentScheduleType.toLowerCase().includes('harvest')).length;
  const harvestAlignedPercent = totalLoans > 0 ? Math.round((harvestAlignedLoans / totalLoans) * 100) : 85;

  // Turnaround Time (TAT) metrics: Demo Baseline vs App
  const baselineDays = 18.5; // Traditional paper branch TAT
  const appTATDays = 4.2; // Digital TAT
  const tatReduction = Math.round(((baselineDays - appTATDays) / baselineDays) * 100);

  // Overdue Reduction
  const overdueCount = safeRepayments.filter(r => r && r.status === 'Overdue').length;
  const totalRepayments = safeRepayments.length;
  const overdueRate = totalRepayments > 0 ? Math.round((overdueCount / totalRepayments) * 100) : 6;

  const handleExportCSV = () => {
    let csv = "data:text/csv;charset=utf-8,";
    csv += "Impact Metric,Demo Baseline,AgriSahay Platform,Improvement (%)\n";
    csv += `"Loan Turnaround Time (TAT)",${baselineDays} Days,${appTATDays} Days,${tatReduction}%\n`;
    csv += `"Offline Field Visits Completed",0 Visits,${completedVisits} Visits,100%\n`;
    csv += `"Harvest-Aligned Schedules",22%,${harvestAlignedPercent}%,+${harvestAlignedPercent - 22}%\n`;
    csv += `"Active Borrower Coverage",55%,94%,+39%\n`;

    const encodedUri = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AgriSahay_Impact_Metrics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadNotice("Impact Metrics exported successfully as CSV!");
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', backgroundColor: '#eff6ff', color: '#1e40af', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <TrendingUp size={14} />
            Institutional Outcomes & Efficiency
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Operational Impact Dashboard
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
            Tracking measurable improvements in loan turnaround, field officer productivity, climate safeguards, and portfolio performance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FileSpreadsheet size={16} />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Printer size={16} />
            Print Report
          </button>
        </div>
      </div>

      {downloadNotice && (
        <div style={{ padding: '0.875rem', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} />
          <strong>{downloadNotice}</strong>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Turnaround Time (TAT)</span>
            <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 700 }}>
              -{tatReduction}% Faster
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.375rem' }}>
            {appTATDays} Days
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            Down from <strong>{baselineDays} days</strong> traditional paper baseline
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Offline Field Visits</span>
            <span style={{ backgroundColor: '#eff6ff', color: '#1e40af', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 700 }}>
              Verified
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.375rem' }}>
            {completedVisits} Completed
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            Logged in zero-connectivity village farms with local queue sync
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Harvest-Aligned Schedules</span>
            <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 700 }}>
              Safer Liquidation
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.375rem' }}>
            {harvestAlignedPercent}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            Facilities structured around harvest + 15d APMC settlement window
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Active Borrower Base</span>
            <span style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 700 }}>
              Live
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.375rem' }}>
            {totalFarmers} Borrowers
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            Across Mandya, Dharmapuri, Nashik, and Guntur operational hubs
          </div>
        </div>
      </div>

      {/* Before vs After Detailed Comparison Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
          Before vs. After Platform Adoption Metrics
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ padding: '0.75rem' }}>Operational Metric</th>
                <th style={{ padding: '0.75rem' }}>Traditional Paper Banking (Demo Baseline)</th>
                <th style={{ padding: '0.75rem' }}>AgriSahay Platform</th>
                <th style={{ padding: '0.75rem' }}>Impact & Rationale</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem', fontWeight: 600 }}>Loan Turnaround Time (TAT)</td>
                <td style={{ padding: '0.75rem', color: '#64748b' }}>18.5 Days (Physical files & signatures)</td>
                <td style={{ padding: '0.75rem', fontWeight: 700, color: '#166534' }}>4.2 Days (Digital underwriting & RBAC)</td>
                <td style={{ padding: '0.75rem', color: '#059669' }}>Farmers receive working capital prior to sowing cutoff</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem', fontWeight: 600 }}>Field Sourcing in Offline Villages</td>
                <td style={{ padding: '0.75rem', color: '#64748b' }}>Reverts to physical diaries; data loss</td>
                <td style={{ padding: '0.75rem', fontWeight: 700, color: '#166534' }}>100% Offline Local Queue & Auto-Sync</td>
                <td style={{ padding: '0.75rem', color: '#059669' }}>Zero data loss in remote village interiors</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem', fontWeight: 600 }}>Repayment Bounces (Technical Delays)</td>
                <td style={{ padding: '0.75rem', color: '#64748b' }}>16.8% (Rigid monthly EMIs bouncing pre-harvest)</td>
                <td style={{ padding: '0.75rem', fontWeight: 700, color: '#166534' }}>{overdueRate}% (Harvest-aligned schedules)</td>
                <td style={{ padding: '0.75rem', color: '#059669' }}>Repayments matched to APMC mandi sale check clearance</td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem', fontWeight: 600 }}>Climate & Weather Risk Awareness</td>
                <td style={{ padding: '0.75rem', color: '#64748b' }}>Reactive (detected only after default)</td>
                <td style={{ padding: '0.75rem', fontWeight: 700, color: '#166534' }}>Proactive (District Risk Radar + Heatmaps)</td>
                <td style={{ padding: '0.75rem', color: '#059669' }}>Branch restructures before account turns NPA</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
