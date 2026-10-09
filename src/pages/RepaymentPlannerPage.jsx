import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import { formatINR } from '../data/mockStore';
import ConfirmationModal from '../components/ConfirmationModal';
import { generateHarvestRepaymentPlan, generateMonthlyCashFlowProjections } from '../utils/plannerEngine';

export default function RepaymentPlannerPage({
  farmers = [],
  loans = [],
  onApplyPlanToLoan,
  onLogAudit,
  currentRole = 'manager'
}) {
  const [selectedFarmerId, setSelectedFarmerId] = useState(farmers[0]?.id || '');
  const [selectedLoanId, setSelectedLoanId] = useState('');

  const farmer = farmers.find(f => f.id === selectedFarmerId) || farmers[0];
  const farmerLoans = loans.filter(l => l.farmerId === farmer?.id);
  const activeLoan = farmerLoans.find(l => l.id === selectedLoanId) || farmerLoans[0];

  // Form Inputs
  const [crop, setCrop] = useState(farmer?.primaryCrop || 'Paddy');
  const [sowingDate, setSowingDate] = useState('2025-07-01');
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('2025-11-15');
  const [loanAmount, setLoanAmount] = useState(activeLoan ? (activeLoan.sanctionedAmount || activeLoan.appliedAmount) : 100000);
  const [interestRate, setInterestRate] = useState(7.0);
  const [tenureMonths, setTenureMonths] = useState(6);
  const [preference, setPreference] = useState('auto');

  // Cash-Flow Projections State
  const [expectedIncome, setExpectedIncome] = useState(240000);
  const [inputExpenses, setInputExpenses] = useState(65000);
  const [existingDebt, setExistingDebt] = useState(15000);
  const [selectedScenario, setSelectedScenario] = useState('expected'); // 'expected', 'bestCase', 'worstCase'

  // Confirmation modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [appliedSuccessMsg, setAppliedSuccessMsg] = useState(null);
  const [validationError, setValidationError] = useState(null);

  // Compute plan safely
  let plan = null;
  try {
    if (new Date(expectedHarvestDate) > new Date(sowingDate)) {
      plan = generateHarvestRepaymentPlan({
        crop,
        sowingDate,
        expectedHarvestDate,
        loanAmount: Number(loanAmount),
        interestRate: Number(interestRate),
        tenureMonths: Number(tenureMonths),
        preference
      });
    }
  } catch (err) {
    plan = null;
  }

  // Compute monthly cash flow projections
  let cashFlowProjections = null;
  try {
    cashFlowProjections = generateMonthlyCashFlowProjections({
      crop,
      sowingDate,
      expectedHarvestDate,
      expectedIncome: Number(expectedIncome),
      inputExpenses: Number(inputExpenses),
      existingDebt: Number(existingDebt),
      loanAmount: Number(loanAmount),
      interestRate: Number(interestRate)
    });
  } catch (e) {
    cashFlowProjections = null;
  }

  const activeScenarioData = cashFlowProjections ? cashFlowProjections[selectedScenario] : null;

  const handleApplyPlan = () => {
    if (!activeLoan) {
      setValidationError('Please select or create an active loan application to bind this plan.');
      return;
    }
    setConfirmModalOpen(true);
  };

  const handleConfirmApply = () => {
    setConfirmModalOpen(false);
    if (!plan || !activeLoan) return;

    if (onApplyPlanToLoan) {
      onApplyPlanToLoan(activeLoan.id, plan);
    }

    if (onLogAudit) {
      onLogAudit({
        action: 'HARVEST_PLAN_APPLIED_TO_LOAN',
        userRole: currentRole,
        entityId: activeLoan.id,
        entityType: 'Loan Application',
        notes: `Applied ${plan.scheduleModel} plan for ${farmer.name}. Harvest Due: ${plan.firstSettlementDate}. Total: Rs. ${plan.harvestTotalPayable}`
      });
    }

    setAppliedSuccessMsg(`Harvest-aligned repayment schedule successfully locked to loan ${activeLoan.id} for ${farmer.name}!`);
    setTimeout(() => setAppliedSuccessMsg(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', backgroundColor: '#dcfce7', color: '#166534', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          <Sparkles size={14} />
          Climate-Smart Repayment Engineering
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Harvest-Based Repayment Planner
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
          Structures loan schedules around crop physiology, maturity dates, and APMC market realization—preventing pre-harvest default.
        </p>
      </div>

      {appliedSuccessMsg && (
        <div style={{ padding: '0.875rem', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} />
          <strong>{appliedSuccessMsg}</strong>
        </div>
      )}

      {validationError && (
        <div style={{ padding: '0.875rem', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} />
          <strong>{validationError}</strong>
        </div>
      )}

      {/* Grid: Inputs Panel & Result */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Input Parameters Card */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="#059669" />
            Cultivation & Loan Parameters
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Select Farmer */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                Select Farmer / Borrower:
              </label>
              <select
                value={selectedFarmerId}
                onChange={(e) => {
                  setSelectedFarmerId(e.target.value);
                  const selF = farmers.find(f => f.id === e.target.value);
                  if (selF) setCrop(selF.primaryCrop);
                }}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              >
                {farmers.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.village} • {f.primaryCrop})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Active Loan */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                Associated Loan Application:
              </label>
              <select
                value={selectedLoanId}
                onChange={(e) => {
                  setSelectedLoanId(e.target.value);
                  const selL = loans.find(l => l.id === e.target.value);
                  if (selL) {
                    setLoanAmount(selL.sanctionedAmount || selL.appliedAmount);
                    if (selL.sowingDate) setSowingDate(selL.sowingDate);
                    if (selL.harvestDate) setExpectedHarvestDate(selL.harvestDate);
                  }
                }}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              >
                {farmerLoans.length > 0 ? (
                  farmerLoans.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.id} • {l.loanType} ({formatINR(l.sanctionedAmount || l.appliedAmount)})
                    </option>
                  ))
                ) : (
                  <option value="">No existing loans (Simulating fresh facility)</option>
                )}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                  Crop:
                </label>
                <input
                  type="text"
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                  Preference Mode:
                </label>
                <select
                  value={preference}
                  onChange={(e) => setPreference(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                >
                  <option value="auto">Auto (Crop Calibrated)</option>
                  <option value="bullet">Single Post-Harvest Bullet</option>
                  <option value="bi-annual">Bi-Annual (Two Tranches)</option>
                  <option value="quarterly">Quarterly (Multi-Picking)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                  Sowing Date:
                </label>
                <input
                  type="date"
                  value={sowingDate}
                  onChange={(e) => setSowingDate(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                  Expected Harvest:
                </label>
                <input
                  type="date"
                  value={expectedHarvestDate}
                  onChange={(e) => setExpectedHarvestDate(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                  Loan Amount (₹):
                </label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                  Interest Rate (% p.a.):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            {/* Action Button */}
            <div style={{ marginTop: '0.5rem' }}>
              <button
                className="btn btn-primary"
                onClick={handleApplyPlan}
                disabled={!plan}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <CheckCircle2 size={16} />
                Apply Harvest Plan to Loan
              </button>
              <div style={{ fontSize: '0.6875rem', color: '#64748b', textAlign: 'center', marginTop: '0.375rem' }}>
                Requires confirmation. Automatically audited in the branch trail.
              </div>
            </div>
          </div>
        </div>

        {/* Comparison: Harvest Plan vs Standard Monthly EMI */}
        {plan && (
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                    Comparative Risk Assessment
                  </span>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                    Why Harvest Alignment Protects the Farmer
                  </h3>
                </div>
                <div style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '0.25rem 0.625rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                  Model: {plan.scheduleModel}
                </div>
              </div>

              {/* Head-to-Head Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.25rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>
                    Standard Retail EMI
                  </div>
                  <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#b91c1c', marginTop: '0.25rem' }}>
                    {formatINR(plan.standardMonthlyEMI)} / mo
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#7f1d1d', marginTop: '0.5rem', lineHeight: 1.4 }}>
                    ⚠️ {plan.riskComparison.monthlyEMIStress}
                  </div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                    Harvest-Aligned Bullet
                  </div>
                  <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#15803d', marginTop: '0.25rem' }}>
                    {formatINR(plan.harvestTotalPayable)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#14532d', marginTop: '0.5rem', lineHeight: 1.4 }}>
                    ✓ {plan.riskComparison.harvestAlignedAdvantage}
                  </div>
                </div>
              </div>

              {/* Timeline highlights */}
              <div style={{ marginTop: '1.25rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ color: '#64748b' }}>Crop Gestation:</span>
                  <span style={{ fontWeight: 600 }}>{plan.cropDurationDays} Days</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginTop: '0.375rem' }}>
                  <span style={{ color: '#64748b' }}>APMC Mandi Settlement Buffer:</span>
                  <span style={{ fontWeight: 600, color: '#059669' }}>+{plan.mandiBufferDays} Days</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginTop: '0.375rem' }}>
                  <span style={{ color: '#64748b' }}>Total Interest Burden:</span>
                  <span style={{ fontWeight: 600 }}>{formatINR(plan.harvestTotalInterest)} (At 7% standard KCC rate)</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: '6px', fontSize: '0.75rem', color: '#1e40af' }}>
              <strong>Rural Banking Principle:</strong> By tying credit liquidation to the APMC auction check clearance, technical Non-Performing Assets (NPAs) drop by over 40% compared to monthly EMI retail portfolios.
            </div>
          </div>
        )}
      </div>

      {/* Monthly Cash-Flow Projections Section */}
      {cashFlowProjections && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} color="#059669" />
                Month-by-Month Harvest Cash-Flow Projections
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                Simulates operational liquidity during vegetative non-cash months versus post-harvest mandi realization.
              </p>
            </div>

            {/* Scenario Selector Tabs */}
            <div style={{ display: 'flex', gap: '0.375rem', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '6px' }}>
              {[
                { id: 'expected', label: 'Expected' },
                { id: 'bestCase', label: 'Best-Case (+20%)' },
                { id: 'worstCase', label: 'Worst-Case (-35%)' }
              ].map(sc => (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenario(sc.id)}
                  style={{
                    padding: '0.375rem 0.75rem',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: selectedScenario === sc.id ? '#ffffff' : 'transparent',
                    color: selectedScenario === sc.id ? '#0f172a' : '#64748b',
                    boxShadow: selectedScenario === sc.id ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Editable Assumptions Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', padding: '0.875rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: '#64748b' }}>Expected Gross Revenue</label>
              <input
                type="number"
                step="5000"
                value={expectedIncome}
                onChange={(e) => setExpectedIncome(Number(e.target.value))}
                style={{ width: '100%', padding: '0.375rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8125rem', fontWeight: 600 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: '#64748b' }}>Estimated Input Costs</label>
              <input
                type="number"
                step="5000"
                value={inputExpenses}
                onChange={(e) => setInputExpenses(Number(e.target.value))}
                style={{ width: '100%', padding: '0.375rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8125rem', fontWeight: 600 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: '#64748b' }}>Existing Debt Obligations</label>
              <input
                type="number"
                step="2000"
                value={existingDebt}
                onChange={(e) => setExistingDebt(Number(e.target.value))}
                style={{ width: '100%', padding: '0.375rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8125rem', fontWeight: 600 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: '#64748b' }}>Scenario Net Surplus</label>
              <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.25rem', color: activeScenarioData.finalSurplus >= 0 ? '#15803d' : '#b91c1c' }}>
                {formatINR(activeScenarioData.finalSurplus)}
              </div>
            </div>
          </div>

          {/* Cashflow Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Month</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Agronomic Stage</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Farm Inflow</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Input Outflow</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Debt Servicing</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Harvest Bullet</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Net Monthly</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Cumulative Surplus</th>
                </tr>
              </thead>
              <tbody>
                {activeScenarioData.monthlyBreakdown.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>{row.month}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#475569' }}>{row.stage}</td>
                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: row.inflow > 0 ? 700 : 400, color: row.inflow > 0 ? '#15803d' : '#94a3b8' }}>
                      {formatINR(row.inflow)}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#b91c1c' }}>
                      -{formatINR(row.outflowInputs)}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#64748b' }}>
                      -{formatINR(row.debtServicing)}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: row.harvestRepayment > 0 ? 700 : 400, color: row.harvestRepayment > 0 ? '#2563eb' : '#94a3b8' }}>
                      {row.harvestRepayment > 0 ? `-${formatINR(row.harvestRepayment)}` : '₹0'}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 600, color: row.netCashFlow >= 0 ? '#15803d' : '#b91c1c' }}>
                      {row.netCashFlow >= 0 ? `+${formatINR(row.netCashFlow)}` : formatINR(row.netCashFlow)}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 700, color: row.cumulativeSurplus >= 0 ? '#15803d' : '#b91c1c' }}>
                      {formatINR(row.cumulativeSurplus)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generated Schedule Table */}
      {plan && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="#059669" />
            Generated Harvest-Aligned Repayment Schedule
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '0.75rem' }}>#</th>
                  <th style={{ padding: '0.75rem' }}>Due Date</th>
                  <th style={{ padding: '0.75rem' }}>Crop & Market Stage</th>
                  <th style={{ padding: '0.75rem' }}>Principal</th>
                  <th style={{ padding: '0.75rem' }}>Interest</th>
                  <th style={{ padding: '0.75rem' }}>Total Installment</th>
                  <th style={{ padding: '0.75rem' }}>Farmer Cash Flow Status</th>
                </tr>
              </thead>
              <tbody>
                {plan.harvestInstallments.map((inst) => (
                  <tr key={inst.installmentNumber} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>{inst.installmentNumber}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: '#059669' }}>{inst.dueDate}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{inst.stageLabel}</td>
                    <td style={{ padding: '0.75rem' }}>{formatINR(inst.principal)}</td>
                    <td style={{ padding: '0.75rem', color: '#64748b' }}>{formatINR(inst.interest)}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>{formatINR(inst.totalAmount)}</td>
                    <td style={{ padding: '0.75rem', color: '#166534', fontWeight: 500 }}>{inst.cashFlowStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationModal
        isOpen={confirmModalOpen}
        title="Confirm Applying Harvest Repayment Plan"
        message={`Are you sure you want to lock this harvest-aligned schedule to loan application ${activeLoan?.id || 'NEW'}? Repayment due date will be updated to ${plan?.firstSettlementDate} with total payable of ${formatINR(plan?.harvestTotalPayable || 0)}.`}
        confirmText="Confirm & Audit Plan"
        onConfirm={handleConfirmApply}
        onCancel={() => setConfirmModalOpen(false)}
      />
    </div>
  );
}
