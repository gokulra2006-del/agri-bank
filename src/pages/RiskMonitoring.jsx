import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  FileWarning,
  Clock,
  Droplets,
  Layers,
  ArrowRight,
  TrendingDown,
  Info,
  HeartHandshake,
  Sparkles
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { formatINR } from '../data/mockStore';
import { detectFarmerFinancialStress } from '../utils/climatePlatformUtils';

export default function RiskMonitoring({
  farmers = [],
  loans = [],
  repayments = [],
  documents = [],
  onNavigateToFarmer,
  onNavigateToLoan
}) {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [stressFilter, setStressFilter] = useState('ALL');

  const safeFarmers = Array.isArray(farmers) ? farmers : [];
  const safeLoans = Array.isArray(loans) ? loans : [];
  const safeRepayments = Array.isArray(repayments) ? repayments : [];
  const safeDocs = Array.isArray(documents) ? documents : [];

  // Compute Early Financial Stress scores for each farmer
  const farmerStressList = safeFarmers.map(f => detectFarmerFinancialStress(f, safeLoans, safeRepayments));

  // Compute early warning indicators from live dataset
  const riskItems = [];

  // 1. Overdue repayments
  safeRepayments.filter(r => r && r.status === 'Overdue').forEach(r => {
    riskItems.push({
      id: `RSK-REP-${r.id}`,
      category: 'Overdue Repayment',
      severity: 'High',
      farmerName: r.farmerName,
      entityId: r.loanId,
      entityType: 'Loan',
      explanation: `Harvest repayment is overdue past maturity date (${r.dueDate}). Unpaid balance of ${formatINR((Number(r.amountDue) || 0) - (Number(r.amountPaid) || 0))} presents NPA migration risk.`,
      action: 'Initiate field recovery visit and verify mandi receipts'
    });
  });

  // 2. High prior external debt burden (> 35% of farm income)
  safeFarmers.filter(f => f && (Number(f.existingLoanBurden) || 0) > (Number(f.annualIncome) || 0) * 0.35).forEach(f => {
    riskItems.push({
      id: `RSK-DEBT-${f.id}`,
      category: 'High Debt Burden',
      severity: 'High',
      farmerName: f.name,
      entityId: f.id,
      entityType: 'Farmer',
      explanation: `Prior cooperative/external debt (${formatINR(f.existingLoanBurden)}) exceeds 35% of annual income. High debt servicing obligation restricts fresh borrowing room.`,
      action: 'Scrutinize PACS No-Objection Certificate before credit expansion'
    });
  });

  // 3. Rainfed farming without assured irrigation
  safeFarmers.filter(f => f && f.landType === 'Rainfed').forEach(f => {
    riskItems.push({
      id: `RSK-RAIN-${f.id}`,
      category: 'Rainfed Monsoon Vulnerability',
      severity: 'Medium',
      farmerName: f.name,
      entityId: f.id,
      entityType: 'Farmer',
      explanation: `${f.landSize} acres are exclusively rainfed without canal or borewell backup. Dry spells or delayed monsoon directly affect yield realization.`,
      action: 'Verify compulsory enrollment under PMFBY crop insurance'
    });
  });

  // 4. Missing land title documents or pending verification
  safeDocs.filter(d => d && (d.status === 'Missing' || d.status === 'Under Verification')).forEach(d => {
    const farmer = safeFarmers.find(f => f && f.id === d.farmerId);
    riskItems.push({
      id: `RSK-DOC-${d.id}`,
      category: 'Incomplete Documentation',
      severity: d.status === 'Missing' ? 'High' : 'Medium',
      farmerName: farmer ? farmer.name : d.farmerId,
      entityId: d.loanId || d.farmerId,
      entityType: d.loanId ? 'Loan' : 'Farmer',
      explanation: `Mandatory ${d.type} is ${(d.status || '').toLowerCase()}. Title scrutiny cannot be cleared for legal enforcement without primary record.`,
      action: 'Request document submission from village revenue officer'
    });
  });

  // 5. Single crop mono-culture exposure
  farmers.filter(f => !f.secondaryCrop || f.secondaryCrop === 'None').forEach(f => {
    riskItems.push({
      id: `RSK-MONO-${f.id}`,
      category: 'Single-Crop Dependency',
      severity: 'Low',
      farmerName: f.name,
      entityId: f.id,
      entityType: 'Farmer',
      explanation: `Farmer relies exclusively on ${f.primaryCrop} with no intercropping or secondary cash crop. A commodity price drop or localized infestation directly impacts entire household solvency.`,
      action: 'Recommend allied dairy or pulse inter-cropping diversification'
    });
  });

  const filtered = riskItems.filter(item =>
    filterCategory === 'ALL' || item.category === filterCategory
  );

  const highRiskCount = riskItems.filter(r => r.severity === 'High').length;
  const mediumRiskCount = riskItems.filter(r => r.severity === 'Medium').length;
  const lowRiskCount = riskItems.filter(r => r.severity === 'Low').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
            Agricultural Credit Risk Radar & Early Warning System
          </h1>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '9999px', backgroundColor: '#fee2e2', color: '#b91c1c' }}>
            Credit Sanction & Recovery Desk
          </span>
        </div>
        <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          Dynamic monitoring of non-performing asset indicators, rainfed vulnerability, and documentation pendency
        </p>
      </div>

      {/* Early Financial Stress Detection Panel (Supportive & Dignified Approach) */}
      <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: '#1e40af', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
              <HeartHandshake size={14} />
              Early Financial Stress Detection (Supportive Guidance)
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
              Borrower Cash Flow Stress Monitor
            </h3>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
            Never labels a farmer negatively. Flags early distress to facilitate harvest holidays and crop insurance claims.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
          {farmerStressList.slice(0, 4).map((str, idx) => (
            <div key={idx} style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: `1px solid ${str.badgeColor}44`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.9375rem', color: '#0f172a' }}>{str.farmerName}</strong>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: str.badgeBg, color: str.badgeColor }}>
                    {str.stressTier}
                  </span>
                </div>
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: '#475569' }}>
                  {str.stressReasons.map((r, rIdx) => (
                    <div key={rIdx}>• {r}</div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>
                💡 Action: {str.supportiveActions[0] || 'Schedule friendly harvest review.'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Risk Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #dc2626' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#dc2626' }}>High Alert Triggers</span>
            <AlertTriangle size={18} color="#dc2626" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginTop: '0.35rem' }}>
            {highRiskCount} Accounts
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Overdue loans & critical missing title records</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #d97706' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#d97706' }}>Moderate Risk Watch</span>
            <Clock size={18} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginTop: '0.35rem' }}>
            {mediumRiskCount} Accounts
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Rainfed cultivation & pending verifications</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #0284c7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0284c7' }}>Diversification Advisory</span>
            <Layers size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginTop: '0.35rem' }}>
            {lowRiskCount} Accounts
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Single-crop mono-culture exposure</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Filter Warning Type:</span>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="ALL">All Warning Indicators ({riskItems.length})</option>
            <option value="Overdue Repayment">Overdue Repayments</option>
            <option value="High Debt Burden">High Prior Debt Burden</option>
            <option value="Rainfed Monsoon Vulnerability">Rainfed Plots</option>
            <option value="Incomplete Documentation">Incomplete Documentation</option>
            <option value="Single-Crop Dependency">Single-Crop Exposure</option>
          </select>
        </div>
      </div>

      {/* Risk Items Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Risk Category</th>
                <th>Borrower Farmer</th>
                <th>Severity</th>
                <th>Underwriter Explanation & Impact</th>
                <th>Recommended Branch Action</th>
                <th style={{ textAlign: 'right' }}>Jump</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td>
                    <span style={{ fontWeight: 600, color: '#0f172a', display: 'block' }}>{item.category}</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.id}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#1e3a8a' }}>{item.farmerName}</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Ref: {item.entityId}</span>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: item.severity === 'High' ? '#fee2e2' : item.severity === 'Medium' ? '#fef3c7' : '#e0f2fe',
                        color: item.severity === 'High' ? '#b91c1c' : item.severity === 'Medium' ? '#b45309' : '#0369a1'
                      }}
                    >
                      {item.severity}
                    </span>
                  </td>
                  <td style={{ maxWidth: '340px' }}>
                    <p style={{ fontSize: '0.8125rem', color: '#334155', lineHeight: 1.4 }}>
                      {item.explanation}
                    </p>
                  </td>
                  <td style={{ maxWidth: '240px' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#15803d', fontWeight: 500 }}>
                      {item.action}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {item.entityType === 'Loan' ? (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onNavigateToLoan(item.entityId)}
                      >
                        View Loan
                      </button>
                    ) : (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onNavigateToFarmer(item.entityId)}
                      >
                        View Farmer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
