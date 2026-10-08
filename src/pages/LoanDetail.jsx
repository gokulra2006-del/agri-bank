import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ShieldCheck,
  Send,
  Ban,
  Wallet,
  Calendar,
  IndianRupee,
  Wheat,
  FolderOpen
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ConfirmationModal from '../components/ConfirmationModal';
import { calculateAgriEligibility, formatINR } from '../data/mockStore';
import { calculateResilienceScore } from '../utils/resilienceEngine';

export default function LoanDetail({
  loanId,
  loans = [],
  farmers = [],
  documents = [],
  currentRole = 'manager',
  onBack,
  onUpdateLoanStatus,
  onViewFarmer
}) {
  const loan = loans.find(l => l.id === loanId);

  // Modal dialog states
  const [modalAction, setModalAction] = useState(null); // 'review', 'approve', 'reject', 'disburse'
  const [sanctionAmountInput, setSanctionAmountInput] = useState(loan ? loan.appliedAmount : 0);
  const [disburseAccountInput, setDisburseAccountInput] = useState('Ujjivan Agri Savings A/C ...9041');

  if (!loan) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loan application not found.</p>
        <button className="btn btn-secondary" onClick={onBack} style={{ marginTop: '1rem' }}>
          Back to Applications List
        </button>
      </div>
    );
  }

  const farmer = farmers.find(f => f.id === loan.farmerId);
  const loanDocs = documents.filter(d => d.loanId === loan.id || d.farmerId === loan.farmerId);

  const eligibility = farmer
    ? calculateAgriEligibility({
        landSize: loan.landAcreage,
        crop: loan.crop,
        annualIncome: farmer.annualIncome,
        alliedIncome: farmer.alliedIncome,
        existingLoanBurden: farmer.existingLoanBurden
      })
    : null;

  const handleActionConfirm = () => {
    if (modalAction === 'review') {
      onUpdateLoanStatus(loan.id, 'Under Review');
    } else if (modalAction === 'approve') {
      onUpdateLoanStatus(loan.id, 'Approved', {
        sanctionedAmount: Number(sanctionAmountInput),
        approvedDate: new Date().toISOString().split('T')[0]
      });
    } else if (modalAction === 'reject') {
      onUpdateLoanStatus(loan.id, 'Rejected');
    } else if (modalAction === 'disburse') {
      onUpdateLoanStatus(loan.id, 'Disbursed', {
        disbursedDate: new Date().toISOString().split('T')[0],
        disbursedAccount: disburseAccountInput
      });
    }
    setModalAction(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top navigation */}
      <div>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            color: '#1e3a8a',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} />
          Back to Loan Origination Pipeline
        </button>
      </div>

      {/* Main Loan Header Card */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>
                {loan.id} - {loan.loanType}
              </h1>
              <StatusBadge status={loan.status} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803d', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                Risk Tier: {loan.riskScore}
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
              Farmer Borrower:{' '}
              <span
                onClick={() => onViewFarmer(loan.farmerId)}
                style={{ color: '#1e3a8a', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
              >
                {loan.farmerName} ({loan.farmerId})
              </span>
              {' '}• Applied on {loan.appliedDate} • Branch: {loan.branchId}
            </p>
          </div>

          {/* Workflow Action Buttons with Confirmations (Governed by RBAC) */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {loan.status === 'Submitted' && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setModalAction('review')}
              >
                <Clock size={14} />
                Move to Under Review
              </button>
            )}

            {(loan.status === 'Submitted' || loan.status === 'Under Review') && currentRole === 'manager' && (
              <>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => setModalAction('reject')}
                >
                  <Ban size={14} />
                  Reject Loan
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setSanctionAmountInput(loan.appliedAmount);
                    setModalAction('approve');
                  }}
                >
                  <CheckCircle2 size={14} />
                  Approve / Sanction
                </button>
              </>
            )}

            {(loan.status === 'Submitted' || loan.status === 'Under Review') && currentRole !== 'manager' && (
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', padding: '0.35rem' }}>
                Awaiting Branch Manager credit approval
              </span>
            )}

            {loan.status === 'Approved' && currentRole === 'manager' && (
              <button
                className="btn btn-blue btn-sm"
                onClick={() => setModalAction('disburse')}
              >
                <Wallet size={14} />
                Disburse to Account
              </button>
            )}

            {loan.status === 'Approved' && currentRole !== 'manager' && (
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', padding: '0.35rem' }}>
                Sanctioned. Ready for Manager disbursement release.
              </span>
            )}

            {loan.status === 'Disbursed' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: '#15803d', fontWeight: 600 }}>
                <CheckCircle2 size={16} /> Disbursed on {loan.disbursedDate}
              </span>
            )}
          </div>
        </div>

        {/* Lifecycle Progress Stepper */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '640px', margin: '0 auto' }}>
            {['Submitted', 'Under Review', 'Approved', 'Disbursed'].map((step, idx) => {
              const order = ['Submitted', 'Under Review', 'Approved', 'Disbursed'];
              const currentIdx = order.indexOf(loan.status);
              const stepIdx = order.indexOf(step);
              const isPast = stepIdx <= currentIdx;
              const isCurrent = step === loan.status;

              return (
                <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: isPast ? '#15803d' : '#f1f5f9',
                      color: isPast ? 'white' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      zIndex: 2,
                      border: isCurrent ? '2px solid #14532d' : 'none'
                    }}
                  >
                    {isPast ? <CheckCircle2 size={16} /> : idx + 1}
                  </div>
                  <span style={{ fontSize: '0.75rem', marginTop: '0.35rem', color: isPast ? '#0f172a' : '#94a3b8', fontWeight: isPast ? 600 : 400 }}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Explainable Decision Panel - Zero Blackbox Automated Sanction */}
      {farmer && (() => {
        const res = calculateResilienceScore(farmer);
        return (
          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#059669' }}>
                  Transparent Underwriting Governance
                </span>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                  Explainable Decision Panel (Zero Automated Sanction)
                </h3>
              </div>
              <div style={{ backgroundColor: res.badgeBg, color: res.badgeColor, padding: '0.25rem 0.625rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                Resilience: {res.score}/100 ({res.category})
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginTop: '1rem', fontSize: '0.8125rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                <strong style={{ color: '#166534' }}>Positive Lending Drivers:</strong>
                <div style={{ color: '#14532d', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                  • Land: {loan.landAcreage} acres ({loan.crop})<br/>
                  • Irrigation: {farmer.landType}<br/>
                  • Secondary Income: {formatINR(farmer.alliedIncome)}
                </div>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: '#fefce8', borderRadius: '6px', border: '1px solid #fef08a' }}>
                <strong style={{ color: '#854d0e' }}>Risk Factors to Review:</strong>
                <div style={{ color: '#713f12', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                  • Prior Debt: {formatINR(farmer.existingLoanBurden)}<br/>
                  • Crop Price Fluctuations ({loan.crop})<br/>
                  • Single Bullet Harvest Due
                </div>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                <strong style={{ color: '#1e40af' }}>Prudential Safeguards:</strong>
                <div style={{ color: '#1e3a8a', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                  • Mandatory PMFBY enrollment<br/>
                  • Harvest +15d APMC Buffer<br/>
                  • Four-Eye Branch Manager Sanction
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Grid: Financial & Crop Details + Scale of Finance Rule Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Agricultural Parameters */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wheat size={18} color="#15803d" />
            Cultivation & Repayment Parameters
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Applied Loan Amount:</span>
              <span style={{ fontWeight: 600 }}>{formatINR(loan.appliedAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Sanctioned Limit:</span>
              <span style={{ fontWeight: 600, color: '#15803d' }}>{formatINR(loan.sanctionedAmount || loan.appliedAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Primary Crop:</span>
              <span style={{ fontWeight: 600 }}>{loan.crop} ({loan.landAcreage} Acres)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Harvest Maturity:</span>
              <span style={{ fontWeight: 600 }}>{loan.harvestDate}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Repayment Cycle:</span>
              <span style={{ fontWeight: 600 }}>{loan.repaymentScheduleType}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Interest Rate:</span>
              <span style={{ fontWeight: 600 }}>{loan.interestRate}% p.a. (with Prompt Subvention)</span>
            </div>
          </div>
        </div>

        {/* Scale of Finance Engine Rules */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} color="#1e3a8a" />
            Underwriting & Scale of Finance Checks
          </h3>

          {eligibility ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>DLTC Scale of Finance / Acre:</span>
                <span style={{ fontWeight: 600 }}>{formatINR(eligibility.scalePerAcre)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Scale Benchmark ({loan.landAcreage} Ac):</span>
                <span style={{ fontWeight: 600 }}>{formatINR(eligibility.baseScaleLoan)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>KCC Buffer (Post-Harvest/Household):</span>
                <span style={{ fontWeight: 600 }}>+{formatINR(eligibility.kccBuffer)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Max Safe Repayment Capacity:</span>
                <span style={{ fontWeight: 600, color: '#15803d' }}>{formatINR(eligibility.maxRepaymentCapacity)} / year</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Credit Officer Verification Note:</span>
                <span style={{ color: '#475569', fontStyle: 'italic' }}>{loan.remarks}</span>
              </div>
            </div>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>No eligibility data available.</p>
          )}
        </div>
      </div>

      {/* Documents Checklist Card */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FolderOpen size={18} color="#64748b" />
          Mandatory Documentation Checklist
        </h3>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Document Type</th>
                <th>File Reference</th>
                <th>Status</th>
                <th>Verification Officer</th>
              </tr>
            </thead>
            <tbody>
              {loanDocs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>
                    No linked documents.
                  </td>
                </tr>
              ) : (
                loanDocs.map(doc => (
                  <tr key={doc.id}>
                    <td style={{ fontWeight: 500 }}>{doc.type}</td>
                    <td style={{ color: '#64748b' }}>{doc.fileName || 'Not uploaded'}</td>
                    <td><StatusBadge status={doc.status} /></td>
                    <td>{doc.verifiedBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modals for Application Lifecycle */}
      <ConfirmationModal
        isOpen={modalAction === 'review'}
        title="Move Application to Under Review"
        message="Confirm advancing this application to Under Review stage? Credit Sanction Desk will perform legal and technical scrutiny."
        confirmVariant="blue"
        confirmLabel="Confirm Review Stage"
        onClose={() => setModalAction(null)}
        onConfirm={handleActionConfirm}
      />

      <ConfirmationModal
        isOpen={modalAction === 'reject'}
        title="Reject Agricultural Loan Application"
        message={`Are you sure you want to reject loan ${loan.id}? This will flag the application as rejected in branch MIS.`}
        confirmVariant="danger"
        confirmLabel="Reject Application"
        onClose={() => setModalAction(null)}
        onConfirm={handleActionConfirm}
      />

      {modalAction === 'approve' && (
        <div className="modal-overlay" onClick={() => setModalAction(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
              Sanction & Approve Loan {loan.id}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1rem' }}>
              Confirm the final sanctioned credit limit based on Scale of Finance assessment.
            </p>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                Sanctioned Amount (₹)
              </label>
              <input
                type="number"
                value={sanctionAmountInput}
                onChange={(e) => setSanctionAmountInput(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setModalAction(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleActionConfirm}>Confirm Sanction</button>
            </div>
          </div>
        </div>
      )}

      {modalAction === 'disburse' && (
        <div className="modal-overlay" onClick={() => setModalAction(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
              Disburse Loan Proceeds {loan.id}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1rem' }}>
              Credit the sanctioned funds ({formatINR(loan.sanctionedAmount || loan.appliedAmount)}) to the farmer's operational savings account.
            </p>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                Disbursement Target Account
              </label>
              <input
                type="text"
                value={disburseAccountInput}
                onChange={(e) => setDisburseAccountInput(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setModalAction(null)}>Cancel</button>
              <button className="btn btn-blue" onClick={handleActionConfirm}>Execute Disbursement</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
