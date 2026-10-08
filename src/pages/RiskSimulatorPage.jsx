import React, { useState } from 'react';
import {
  Sliders,
  AlertTriangle,
  Info,
  CheckCircle2,
  TrendingDown,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { formatINR } from '../data/mockStore';
import { simulateFarmScenario } from '../utils/resilienceEngine';

export default function RiskSimulatorPage({
  farmers = [],
  loans = []
}) {
  const [selectedFarmerId, setSelectedFarmerId] = useState(farmers[0]?.id || '');
  const [scenarioType, setScenarioType] = useState('DROUGHT');
  const [severity, setSeverity] = useState('Medium'); // 'Low', 'Medium', 'High'

  const farmer = farmers.find(f => f.id === selectedFarmerId) || farmers[0];
  const farmerLoans = loans.filter(l => l.farmerId === farmer?.id);
  const loan = farmerLoans[0] || { appliedAmount: 150000, sanctionedAmount: 150000 };

  const baseIncome = farmer?.annualIncome || 300000;
  const loanAmount = loan.sanctionedAmount || loan.appliedAmount || 150000;

  // Run pure simulation
  const sim = simulateFarmScenario(baseIncome, loanAmount, scenarioType);

  // Severity multipliers
  const severityMultiplier = severity === 'High' ? 1.25 : severity === 'Low' ? 0.75 : 1.0;
  const adjustedLoss = Math.min(85, Math.round(sim.incomeLossPercent * severityMultiplier));
  const adjustedSimIncome = Math.round(baseIncome * (1 - adjustedLoss / 100));
  const safeCapacity = Math.round(adjustedSimIncome * 0.45);
  const stressStatus = loanAmount > safeCapacity ? 'Deficit / High Stress' : 'Sustainable Buffer';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', backgroundColor: '#fef3c7', color: '#92400e', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          <AlertTriangle size={14} />
          Illustrative Simulation, Not a Live Prediction
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          What-If Agricultural Risk Simulator
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
          Simulates exogenous climatic and market shocks across specific borrowers using transparent rule-based stress formulas.
        </p>
      </div>

      {/* Selector & Scenario Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
              Select Farmer Borrower:
            </label>
            <select
              value={selectedFarmerId}
              onChange={(e) => setSelectedFarmerId(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
            >
              {farmers.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.village} • {f.primaryCrop} • {f.landType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
              Shock Scenario:
            </label>
            <select
              value={scenarioType}
              onChange={(e) => setScenarioType(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
            >
              <option value="DROUGHT">Severe Drought / Deficit Monsoon</option>
              <option value="DELAYED_MONSOON">Delayed Sowing / Resowing Lag</option>
              <option value="PRICE_CRASH">Post-Harvest Mandi Price Crash</option>
              <option value="PEST_ATTACK">Invasive Pest / Disease Outbreak</option>
              <option value="INPUT_COST_SPIKE">Fertilizer & Diesel Cost Surge</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
              Simulated Severity Slab:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['Low', 'Medium', 'High'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setSeverity(lvl)}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    borderRadius: '6px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: severity === lvl ? '2px solid #0f172a' : '1px solid #cbd5e1',
                    backgroundColor: severity === lvl ? '#0f172a' : '#ffffff',
                    color: severity === lvl ? '#ffffff' : '#334155'
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Before vs After Impact Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {/* Baseline Card */}
        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#f8fafc' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Baseline Normal Conditions
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Expected Farm Income:</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{formatINR(baseIncome)}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Current Credit Facility:</span>
              <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>{formatINR(loanAmount)}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Debt-to-Income Margin:</span>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#15803d' }}>
                {baseIncome > 0 ? `${Math.round((loanAmount / baseIncome) * 100)}% (Sustainable)` : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Shock Impact Card */}
        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>
              Simulated Post-Shock Impact
            </span>
            <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 700 }}>
              -{adjustedLoss}% Income Shock
            </span>
          </div>

          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#7f1d1d' }}>Simulated Harvest Income:</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#b91c1c' }}>{formatINR(adjustedSimIncome)}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#7f1d1d' }}>Safe Debt Servicing Ceiling (45% FOIR):</span>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#991b1b' }}>{formatINR(safeCapacity)}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#7f1d1d' }}>Repayment Stress Status:</span>
              <div style={{ fontSize: '0.875rem', fontWeight: 800, color: stressStatus.includes('Deficit') ? '#b91c1c' : '#15803d' }}>
                {stressStatus}
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Banking Action */}
        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
              Suggested Supportive Banking Action
            </div>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#14532d', lineHeight: 1.5, fontWeight: 500 }}>
              {sim.policyAction}
            </p>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #bbf7d0', fontSize: '0.75rem', color: '#166534' }}>
            <strong>Action Trigger:</strong> Fast-track PMFBY loss verification & offer temporary harvest repayment holiday.
          </div>
        </div>
      </div>

      {/* Formula Reference Table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
          Documented Simulation Formulas & Calibration Assumptions
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ padding: '0.625rem' }}>Scenario Type</th>
                <th style={{ padding: '0.625rem' }}>Rainfed Land Impact</th>
                <th style={{ padding: '0.625rem' }}>Irrigated Land Impact</th>
                <th style={{ padding: '0.625rem' }}>Cash Flow Distortion</th>
                <th style={{ padding: '0.625rem' }}>Mitigant Rule</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.625rem', fontWeight: 600 }}>Drought / Moisture Stress</td>
                <td style={{ padding: '0.625rem', color: '#b91c1c' }}>-45% Yield drop</td>
                <td style={{ padding: '0.625rem' }}>-20% (Emergency pumping cost)</td>
                <td style={{ padding: '0.625rem' }}>Full season crop failure risk</td>
                <td style={{ padding: '0.625rem', color: '#047857' }}>PMFBY claim + 6-mo repayment holiday</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.625rem', fontWeight: 600 }}>Delayed Monsoon</td>
                <td style={{ padding: '0.625rem' }}>-20% (Short duration seed switch)</td>
                <td style={{ padding: '0.625rem' }}>-10% (Late nursery preparation)</td>
                <td style={{ padding: '0.625rem' }}>30 to 45 days harvest date shift</td>
                <td style={{ padding: '0.625rem', color: '#047857' }}>Extend harvest maturity bullet date by 45 days</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.625rem', fontWeight: 600 }}>Mandi Price Crash</td>
                <td style={{ padding: '0.625rem' }}>-35% Gross value</td>
                <td style={{ padding: '0.625rem' }}>-35% Gross value</td>
                <td style={{ padding: '0.625rem' }}>Auction realizations below cost of cultivation</td>
                <td style={{ padding: '0.625rem', color: '#047857' }}>Electronic Negotiable Warehouse Receipts (e-NWR) pledge</td>
              </tr>
              <tr>
                <td style={{ padding: '0.625rem', fontWeight: 600 }}>Pest / Disease Outbreak</td>
                <td style={{ padding: '0.625rem' }}>-30% Yield + 25% Spray cost</td>
                <td style={{ padding: '0.625rem' }}>-25% Yield + 20% Spray cost</td>
                <td style={{ padding: '0.625rem' }}>Margin erosion from repeated pesticide spray</td>
                <td style={{ padding: '0.625rem', color: '#047857' }}>University extension advisory + Phased disbursement</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
