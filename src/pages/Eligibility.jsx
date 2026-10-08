import React, { useState } from 'react';
import {
  Calculator,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  FileCheck2,
  Wheat,
  IndianRupee,
  Layers,
  Info
} from 'lucide-react';
import { calculateAgriEligibility, formatINR } from '../data/mockStore';

export default function Eligibility({ farmers = [], onNavigateToNewLoan }) {
  const [selectedFarmerId, setSelectedFarmerId] = useState(farmers[0]?.id || 'custom');
  
  // Custom interactive test form state
  const [customParams, setCustomParams] = useState({
    landSize: 3.5,
    crop: 'Sugarcane',
    annualIncome: 320000,
    alliedIncome: 40000,
    existingLoanBurden: 30000,
    documentCompleteness: 'High'
  });

  const selectedFarmer = farmers.find(f => f.id === selectedFarmerId);

  const activeParams = selectedFarmer
    ? {
        landSize: selectedFarmer.landSize,
        crop: selectedFarmer.primaryCrop,
        annualIncome: selectedFarmer.annualIncome,
        alliedIncome: selectedFarmer.alliedIncome,
        existingLoanBurden: selectedFarmer.existingLoanBurden,
        documentCompleteness: selectedFarmer.documentStatus === 'Verified' ? 'High' : 'Pending'
      }
    : customParams;

  const result = calculateAgriEligibility(activeParams);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Disclaimer Banner */}
      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Info size={18} color="#1d4ed8" />
        <span style={{ fontSize: '0.8125rem', color: '#1e40af' }}>
          <strong>Academic Demonstration Disclaimer:</strong> Student project, not an actual banking or credit decision system. Underwriting rules simulated according to DLTC Scale of Finance benchmarks.
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
          Transparent Agri-Loan Eligibility & Risk Engine
        </h1>
        <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          Real-time underwriting rules based on Landholdings, District Scale of Finance, FOIR, and Harvest Economics
        </p>
      </div>

      {/* Main Grid: Inputs vs Calculation Outcome */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Left: Input Selector */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={18} color="#15803d" />
            Underwriting Assessment Inputs
          </h3>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
              Select Registered Farmer or Sandbox Test
            </label>
            <select
              value={selectedFarmerId}
              onChange={(e) => setSelectedFarmerId(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="custom">-- Custom Scenario (Interactive Sandbox) --</option>
              {farmers.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.id}) - {f.primaryCrop}, {f.landSize} Acres
                </option>
              ))}
            </select>
          </div>

          {selectedFarmerId === 'custom' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                  Cultivated Land (Acres)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={customParams.landSize}
                  onChange={(e) => setCustomParams({ ...customParams, landSize: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                  Crop Type
                </label>
                <select
                  value={customParams.crop}
                  onChange={(e) => setCustomParams({ ...customParams, crop: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="Sugarcane">Sugarcane (Scale: ₹65,000/Ac)</option>
                  <option value="Paddy (Rice)">Paddy / Rice (Scale: ₹40,000/Ac)</option>
                  <option value="Cotton">Cotton (Scale: ₹42,000/Ac)</option>
                  <option value="Wheat">Wheat (Scale: ₹35,000/Ac)</option>
                  <option value="Vegetables & Tomato">Vegetables (Scale: ₹50,000/Ac)</option>
                  <option value="Pulses">Pulses (Scale: ₹28,000/Ac)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                  Annual Farm Income (₹)
                </label>
                <input
                  type="number"
                  value={customParams.annualIncome}
                  onChange={(e) => setCustomParams({ ...customParams, annualIncome: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                  Allied Animal Husbandry / Dairy Income (₹)
                </label>
                <input
                  type="number"
                  value={customParams.alliedIncome}
                  onChange={(e) => setCustomParams({ ...customParams, alliedIncome: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                  Existing Outstanding Loan Liabilities (₹)
                </label>
                <input
                  type="number"
                  value={customParams.existingLoanBurden}
                  onChange={(e) => setCustomParams({ ...customParams, existingLoanBurden: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0', fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><strong>Farmer:</strong> {selectedFarmer.name}</div>
              <div><strong>Village/District:</strong> {selectedFarmer.village}, {selectedFarmer.district}</div>
              <div><strong>Acreage:</strong> {selectedFarmer.landSize} Acres ({selectedFarmer.landType})</div>
              <div><strong>Crop:</strong> {selectedFarmer.primaryCrop}</div>
              <div><strong>Reported Income:</strong> {formatINR(selectedFarmer.annualIncome)} + {formatINR(selectedFarmer.alliedIncome)} allied</div>
              <div><strong>Existing Liabilities:</strong> {formatINR(selectedFarmer.existingLoanBurden)}</div>
              <div><strong>KYC Status:</strong> {selectedFarmer.documentStatus}</div>
            </div>
          )}
        </div>

        {/* Right: Transparent Assessment Formula Breakdown */}
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Estimated Eligible Credit Limit
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#15803d', marginTop: '0.25rem' }}>
                {formatINR(result.recommendedLoan)}
              </div>
            </div>

            <div
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                fontWeight: 700,
                backgroundColor: result.riskColor === 'green' ? '#dcfce7' : result.riskColor === 'amber' ? '#fef3c7' : '#fee2e2',
                color: result.riskColor === 'green' ? '#15803d' : result.riskColor === 'amber' ? '#b45309' : '#b91c1c'
              }}
            >
              {result.riskCategory}
            </div>
          </div>

          {/* Transparent Formula Step-by-Step */}
          <div style={{ backgroundColor: '#f8fafc', borderRadius: '0.375rem', padding: '0.875rem', border: '1px solid #e2e8f0', fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>Transparent Rule Breakdown:</span>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>1. District Scale of Finance ({result.cropName}):</span>
              <span style={{ fontWeight: 600 }}>{formatINR(result.scalePerAcre)} / acre</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>2. Base Crop Production Limit ({activeParams.landSize} Ac × {formatINR(result.scalePerAcre)}):</span>
              <span style={{ fontWeight: 600 }}>{formatINR(result.baseScaleLoan)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>3. Mandatory 30% KCC Consumption & Farm Maintenance Buffer:</span>
              <span style={{ fontWeight: 600 }}>+{formatINR(result.kccBuffer)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.35rem' }}>
              <span style={{ color: '#475569', fontWeight: 600 }}>Gross Scale-of-Finance Capacity:</span>
              <span style={{ fontWeight: 700, color: '#1e3a8a' }}>{formatINR(result.rawEligibleAmount)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>4. Household Annual Cashflow (Farm + Allied):</span>
              <span style={{ fontWeight: 600 }}>{formatINR(result.totalHouseholdIncome)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>5. Debt Service Obligation Limit (50% FOIR ceiling - Prior Debt):</span>
              <span style={{ fontWeight: 600, color: '#15803d' }}>{formatINR(result.maxRepaymentCapacity)} / yr</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Income-to-Loan Ratio:</span>
              <span style={{ fontWeight: 600 }}>{result.incomeToLoanRatio}x</span>
            </div>
          </div>

          {/* Underwriter Rationale Box */}
          <div style={{ padding: '0.75rem', borderRadius: '0.375rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '0.75rem', color: '#14532d' }}>
            <strong>Underwriter Explanation:</strong>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem' }}>
              {result.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
