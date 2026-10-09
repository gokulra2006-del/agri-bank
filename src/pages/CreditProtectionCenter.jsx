import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Camera,
  Calendar,
  Clock,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  ArrowRight,
  ExternalLink,
  Plus,
  RefreshCw,
  Info,
  DollarSign,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { formatINR, formatDate, maskAadhaar } from '../data/mockStore';
import { logAudit } from '../utils/audit';
import { t } from '../utils/i18n';

export default function CreditProtectionCenter({
  claims = [],
  loans = [],
  farmers = [],
  onUpdateClaims,
  onNavigateToRestructure,
  currentRole = 'manager',
  currentLang = 'en'
}) {
  const [selectedClaimId, setSelectedClaimId] = useState(claims[0]?.id || null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Form state for reporting new crop loss
  const [newLoanId, setNewLoanId] = useState(loans[0]?.id || '');
  const [newEventType, setNewEventType] = useState('Drought & Moisture Stress');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDamagePercent, setNewDamagePercent] = useState(50);
  const [newDamageCategory, setNewDamageCategory] = useState('Severe (> 50%)');
  const [newEstimatedLoss, setNewEstimatedLoss] = useState(60000);
  const [newNotes, setNewNotes] = useState('');
  const [simulatedPhotoName, setSimulatedPhotoName] = useState('plot_damage_survey.jpg');

  const selectedClaim = claims.find(c => c.id === selectedClaimId) || claims[0];

  const filteredClaims = claims.filter(c => {
    if (filterStatus === 'ALL') return true;
    return c.status === filterStatus;
  });

  // KPI Calculations
  const totalClaims = claims.length;
  const underAssessmentCount = claims.filter(c => c.status === 'Under Assessment' || c.status === 'Documents Collected').length;
  const totalEstimatedLoss = claims.reduce((acc, c) => acc + (c.estimatedLossInr || 0), 0);
  const reschedulingCount = claims.filter(c => c.reschedulingRecommended).length;

  const STAGES = [
    'Loss Reported',
    'Docs Collected',
    'Insurer Submitted',
    'Joint Survey',
    'Under Assessment',
    'Settlement / Relief'
  ];

  // Stage Advancement Handler
  const handleAdvanceStage = (claim) => {
    const nextStatuses = {
      'Reported': { next: 'Documents Collected', stageIndex: 2 },
      'Documents Collected': { next: 'Submitted (simulated)', stageIndex: 3 },
      'Submitted (simulated)': { next: 'Under Assessment', stageIndex: 4 },
      'Under Assessment': { next: 'Settled', stageIndex: 5 },
      'Settled': { next: 'Closed', stageIndex: 6 }
    };

    const target = nextStatuses[claim.status];
    if (!target) return;

    const updatedClaims = claims.map(c => {
      if (c.id === claim.id) {
        return {
          ...c,
          status: target.next,
          stageIndex: target.stageIndex,
          timeline: [
            ...c.timeline,
            {
              date: new Date().toISOString().split('T')[0],
              title: `Stage Advanced: ${target.next}`,
              note: `Status updated by ${currentRole} in AgriSahay Credit Protection Center.`,
              by: currentRole
            }
          ]
        };
      }
      return c;
    });

    onUpdateClaims(updatedClaims);
    logAudit({
      action: 'CLAIM_STAGE_ADVANCE',
      userRole: currentRole,
      entityId: claim.id,
      entityType: 'Credit Protection Claim',
      previousStatus: claim.status,
      newStatus: target.next,
      notes: `Claim transitioned to ${target.next}`
    });
  };

  // Submit New Loss Intimation
  const handleCreateLossReport = (e) => {
    e.preventDefault();
    const loan = loans.find(l => l.id === newLoanId);
    const farmer = farmers.find(f => f.id === loan?.farmerId);

    const newClaim = {
      id: `CLM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      loanId: newLoanId,
      farmerId: farmer?.id || 'FAR-001',
      farmerName: farmer?.name || 'Registered Borrower',
      crop: loan?.crop || 'Paddy',
      season: 'Current Kharif Season',
      eventType: newEventType,
      eventDate: newEventDate,
      damageCategory: newDamageCategory,
      damagePercent: Number(newDamagePercent),
      estimatedLossInr: Number(newEstimatedLoss),
      pmfbyPolicyNo: `PMFBY-KA-${Date.now().toString().slice(-5)}`,
      insurerName: 'Agriculture Insurance Company of India (Simulated)',
      premiumPaidInr: Math.round(Number(newEstimatedLoss) * 0.02),
      claimIntimationDeadline: new Date(Date.now() + 72 * 3600000).toISOString().split('T')[0],
      intimationSubmittedAt: new Date().toISOString(),
      status: 'Reported',
      stageIndex: 1,
      reschedulingEligible: Number(newDamagePercent) >= 33,
      reschedulingRecommended: Number(newDamagePercent) >= 33,
      restructuringPlan: Number(newDamagePercent) >= 33 ? 'Eligible for RBI natural calamity restructuring (6-12 month moratorium)' : 'Continue standard schedule with advisory monitoring',
      simulatedPhotos: [
        {
          name: simulatedPhotoName,
          size: '2.8 MB',
          date: newEventDate,
          note: newNotes || 'Field damage survey photographic documentation'
        }
      ],
      demoLocation: `${farmer?.village || 'Mandya Rural'} Plot A-1 (Static Demo Location)`,
      surveyorNotes: newNotes || 'Intimation recorded by bank officer via Credit Protection workflow.',
      timeline: [
        {
          date: newEventDate,
          title: 'Loss Event Detected & Intimated',
          note: `${newEventType} causing approx ${newDamagePercent}% loss`,
          by: currentRole
        }
      ]
    };

    const updated = [newClaim, ...claims];
    onUpdateClaims(updated);
    setSelectedClaimId(newClaim.id);
    setIsReportModalOpen(false);

    logAudit({
      action: 'CROP_LOSS_INTIMATION_CREATED',
      userRole: currentRole,
      entityId: newClaim.id,
      entityType: 'Crop Loss Claim',
      previousStatus: 'None',
      newStatus: 'Reported',
      notes: `Loss intimation logged for ${newClaim.farmerName} (${newClaim.crop}): ${newEventType}`
    });
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Title & Research Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <span style={{ backgroundColor: '#ecfdf5', color: '#15803d', padding: '0.25rem 0.625rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
              Credit Protection Layer
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              RBI Natural Calamity Restructuring Framework
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Agriculture Credit Protection Center
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
            Unified pipeline linking Loan Disbursal → Crop Loss Event → PMFBY Insurance Claim → Repayment Rescheduling.
          </p>
        </div>

        <button
          onClick={() => setIsReportModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#15803d',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '0.625rem 1.125rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Plus size={16} />
          Report Crop Loss Event
        </button>
      </div>

      {/* Mandatory Disclaimer Banner */}
      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.875rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Info size={18} style={{ color: '#2563eb', flexShrink: 0 }} />
        <span style={{ fontSize: '0.8125rem', color: '#1e40af' }}>
          <strong>Demonstration Workflow:</strong> This module illustrates banking-assisted crop loss intimation and debt rescheduling. It is <strong>not connected to live PMFBY, AIC, or core banking servers</strong>. All policy numbers, loss percentages, and surveyor reports are simulated demonstration data.
        </span>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Active Loss Claims</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>{totalClaims}</div>
          <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.25rem' }}>Across 2 Operating Branches</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Under Joint Assessment</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#d97706', marginTop: '0.25rem' }}>{underAssessmentCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>72-hr intimations compliant</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Estimated Crop Damage Value</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#b91c1c', marginTop: '0.25rem' }}>{formatINR(totalEstimatedLoss)}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Subject to surveyor survey</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Restructuring Recommended</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb', marginTop: '0.25rem' }}>{reschedulingCount} Cases</div>
          <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.25rem' }}>Bullet repayment moratoria</div>
        </div>
      </div>

      {/* Main Split: Left Claims Master / Right Claim Detail */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(460px, 1.4fr)', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Claim Selection & Filters */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: 0, color: '#0f172a' }}>
              Insurance & Protection Cases ({filteredClaims.length})
            </h3>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ fontSize: '0.8125rem', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="Documents Collected">Docs Collected</option>
              <option value="Submitted (simulated)">Submitted</option>
              <option value="Under Assessment">Under Assessment</option>
              <option value="Settled">Settled</option>
            </select>
          </div>

          <div style={{ divideY: '1px solid #f1f5f9' }}>
            {filteredClaims.map((claim) => {
              const isSelected = claim.id === selectedClaim?.id;
              return (
                <div
                  key={claim.id}
                  onClick={() => setSelectedClaimId(claim.id)}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                    borderLeft: isSelected ? '4px solid #15803d' : '4px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.375rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d' }}>{claim.id}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.5rem' }}>Loan: {claim.loanId}</span>
                    </div>
                    <span style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      padding: '0.125rem 0.5rem',
                      borderRadius: '12px',
                      backgroundColor: claim.status === 'Settled' ? '#dcfce7' : claim.status === 'Under Assessment' ? '#fef3c7' : '#e0f2fe',
                      color: claim.status === 'Settled' ? '#15803d' : claim.status === 'Under Assessment' ? '#d97706' : '#0284c7'
                    }}>
                      {claim.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a' }}>{claim.farmerName}</div>
                  <div style={{ fontSize: '0.8125rem', color: '#475569', marginTop: '0.125rem' }}>
                    {claim.crop} • {claim.eventType}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                    <span>Damage: <strong style={{ color: '#b91c1c' }}>{claim.damagePercent}%</strong></span>
                    <span>Est. Loss: <strong>{formatINR(claim.estimatedLossInr)}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Claim Case & Stage Tracker */}
        {selectedClaim ? (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem' }}>
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>CLAIM DOSSIER • {selectedClaim.id}</div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0.25rem 0' }}>
                  {selectedClaim.farmerName} – {selectedClaim.crop} Loss Assistance
                </h2>
                <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                  Linked Facility: <strong>{selectedClaim.loanId}</strong> • Intimated on {formatDate(selectedClaim.intimationSubmittedAt)}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Intimation Deadline Window</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end', marginTop: '0.125rem' }}>
                  <CheckCircle2 size={15} /> Within 72-hr Limit ({formatDate(selectedClaim.claimIntimationDeadline)})
                </div>
              </div>
            </div>

            {/* 6-Stage Progress Tracker */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.75rem' }}>
                Credit Protection & Insurance Stage Pipeline
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STAGES.length}, 1fr)`, gap: '0.375rem' }}>
                {STAGES.map((stg, idx) => {
                  const isDone = idx < selectedClaim.stageIndex;
                  const isCurrent = idx === selectedClaim.stageIndex - 1;
                  return (
                    <div key={stg} style={{ textAlign: 'center' }}>
                      <div style={{
                        height: '6px',
                        borderRadius: '3px',
                        backgroundColor: isDone ? '#15803d' : isCurrent ? '#3b82f6' : '#e2e8f0',
                        marginBottom: '0.375rem'
                      }} />
                      <span style={{
                        fontSize: '0.6875rem',
                        fontWeight: isCurrent ? 700 : 500,
                        color: isDone ? '#15803d' : isCurrent ? '#1d4ed8' : '#94a3b8'
                      }}>
                        {stg}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Loss Particulars & Evidence Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Loss & Damage Assessment</div>
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.8125rem' }}>
                  <div><strong>Hazard:</strong> {selectedClaim.eventType}</div>
                  <div><strong>Event Date:</strong> {formatDate(selectedClaim.eventDate)}</div>
                  <div><strong>Damage Severity:</strong> <span style={{ color: '#b91c1c', fontWeight: 600 }}>{selectedClaim.damagePercent}% ({selectedClaim.damageCategory})</span></div>
                  <div><strong>Estimated Loss:</strong> {formatINR(selectedClaim.estimatedLossInr)}</div>
                  <div><strong>Demo Coordinates:</strong> <span style={{ color: '#475569' }}>{selectedClaim.demoLocation}</span></div>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>PMFBY Insurance Policy (Demo)</div>
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.8125rem' }}>
                  <div><strong>Policy No:</strong> {selectedClaim.pmfbyPolicyNo}</div>
                  <div><strong>Insurer:</strong> {selectedClaim.insurerName}</div>
                  <div><strong>Farmer Premium Paid:</strong> {formatINR(selectedClaim.premiumPaidInr)} (Subsidized 2%)</div>
                  <div><strong>Claim Docket:</strong> AIC Portal Transmission Docket #8812</div>
                  <div><strong>Assessor Report:</strong> Certified joint damage verification</div>
                </div>
              </div>
            </div>

            {/* Simulated Photographic Evidence */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Camera size={16} /> Field Survey Evidence & Photographs (Simulated Metadata)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {selectedClaim.simulatedPhotos?.map((p, idx) => (
                  <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem', backgroundColor: '#ffffff' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>📄 {p.name}</div>
                    <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '0.25rem' }}>Size: {p.size} • Captured: {p.date}</div>
                    <div style={{ fontSize: '0.75rem', color: '#334155', marginTop: '0.25rem', fontStyle: 'italic' }}>"{p.note}"</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Repayment Rescheduling Box & Action Trigger */}
            <div style={{ backgroundColor: '#fefce8', border: '1px solid #fef08a', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#854d0e', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <AlertTriangle size={16} /> Credit Protection: Debt Rescheduling Recommended
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#713f12', margin: '0.25rem 0 0 0' }}>
                    {selectedClaim.restructuringPlan}
                  </p>
                </div>

                {onNavigateToRestructure && (
                  <button
                    onClick={() => onNavigateToRestructure(selectedClaim.loanId)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      backgroundColor: '#854d0e',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.5rem 0.875rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Open Restructuring Studio <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Logged under Four-Eye Maker-Checker Framework
              </div>

              {selectedClaim.status !== 'Closed' && selectedClaim.status !== 'Settled' && (
                <button
                  onClick={() => handleAdvanceStage(selectedClaim)}
                  style={{
                    backgroundColor: '#1e40af',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Advance Case Stage →
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            No claim dossier selected.
          </div>
        )}
      </div>

      {/* Report Crop Loss Modal */}
      {isReportModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', maxWidth: '540px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              Report Crop Loss & Intimate PMFBY Claim
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>
              Capture loss particulars for prompt joint survey and loan rescheduling support.
            </p>

            <form onSubmit={handleCreateLossReport} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Select Facility / Loan
                </label>
                <select
                  value={newLoanId}
                  onChange={(e) => setNewLoanId(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  required
                >
                  {loans.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.id} – {l.farmerName} ({l.crop || 'Crop'} - ₹{l.amount?.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Loss Hazard Event
                  </label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  >
                    <option value="Drought & Severe Moisture Deficit">Drought & Moisture Deficit</option>
                    <option value="Flash Flood & Waterlogging">Flash Flood & Waterlogging</option>
                    <option value="Unseasonal Hailstorm & Lodging">Unseasonal Hailstorm & Lodging</option>
                    <option value="Invasive Pest Outbreak (Fall Armyworm/Thrips)">Invasive Pest Outbreak</option>
                    <option value="Post-Harvest Mandi Price Collapse">Mandi Price Collapse</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Date Loss Noticed
                  </label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Estimated Damage (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newDamagePercent}
                    onChange={(e) => setNewDamagePercent(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Estimated Loss Value (₹)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={newEstimatedLoss}
                    onChange={(e) => setNewEstimatedLoss(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Simulated Photographic Attachment
                </label>
                <input
                  type="text"
                  value={simulatedPhotoName}
                  onChange={(e) => setSimulatedPhotoName(e.target.value)}
                  placeholder="e.g. plot_inundation_aug26.jpg"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Simulated file reference; no actual file storage used.</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Field Observations & Surveyor Notes
                </label>
                <textarea
                  rows="3"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Notes on crop stage, root damage, or localized bund conditions..."
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none', backgroundColor: '#15803d', color: '#ffffff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Submit Loss Intimation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
