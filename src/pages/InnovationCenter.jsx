import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Calendar,
  Sliders,
  MapPin,
  Mic,
  HeartHandshake,
  CheckCircle2,
  FileCheck,
  Award,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Droplets,
  Layers,
  Leaf,
  Info,
  Clock,
  Download,
  FileText,
  Volume2,
  ChevronRight,
  Shield,
  RefreshCw,
  Sun,
  Activity
} from 'lucide-react';
import { formatINR, maskAadhaar, getResilienceOverrides, saveResilienceOverrides } from '../data/mockStore';
import {
  calculateResilienceScore,
  calculateHarvestRepaymentSchedule,
  simulateFarmScenario,
  getClimateSafeSafeguards,
  computeFairnessAndBiasMetrics,
  FACTOR_WEIGHTS_EXPLANATIONS,
  DECISION_GOVERNANCE_NOTICE
} from '../utils/resilienceEngine';

export default function InnovationCenter({
  farmers = [],
  loans = [],
  assistanceList = [],
  villageHeatmaps = [],
  onUpdateFarmer,
  onUpdateAssistance,
  onLogAudit,
  currentRole = 'manager'
}) {
  const [activeTab, setActiveTab] = useState('resilience'); // 'resilience', 'simulator', 'harvest-planner', 'heatmaps', 'consent-passport', 'voice-notes', 'assistance', 'explainable-decision', 'impact-dashboard'
  const [selectedFarmerId, setSelectedFarmerId] = useState(farmers[0]?.id || 'FAR-001');

  // Selected farmer object
  const farmer = farmers.find(f => f.id === selectedFarmerId) || farmers[0];

  // Officer Overrides State
  const [overrides, setOverrides] = useState(getResilienceOverrides());
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideAdjustment, setOverrideAdjustment] = useState(0);
  const [overrideJustification, setOverrideJustification] = useState('');

  // Active calculations
  const resilienceResult = farmer ? calculateResilienceScore(farmer, overrides) : null;
  const climateSafeguards = farmer ? getClimateSafeSafeguards(resilienceResult.score, farmer.rating.includes('C') ? 'High' : 'Moderate') : [];
  const biasMetrics = computeFairnessAndBiasMetrics(farmers, loans);

  // 1. What-If Simulator State
  const [scenarioType, setScenarioType] = useState('DROUGHT');
  const [simBaseIncome, setSimBaseIncome] = useState(farmer?.annualIncome || 350000);
  const [simLoanRequested, setSimLoanRequested] = useState(150000);
  const simResult = simulateFarmScenario(simBaseIncome, simLoanRequested, scenarioType);

  // 2. Harvest-Linked Repayment Planner State
  const [sowDate, setSowDate] = useState('2025-07-15');
  const [cropDays, setCropDays] = useState(120);
  const [mandiBuffer, setMandiBuffer] = useState(15);
  const [plannerLoanAmt, setPlannerLoanAmt] = useState(100000);
  const [plannerInterestRate, setPlannerInterestRate] = useState(7.0);
  const harvestSchedule = calculateHarvestRepaymentSchedule({
    sowingDate: sowDate,
    cropDurationDays: cropDays,
    mandiSaleBufferDays: mandiBuffer,
    loanAmount: plannerLoanAmt,
    interestRate: plannerInterestRate
  });

  // 3. Consent & Data Passport State
  const [consentGranted, setConsentGranted] = useState(farmer?.consentRecorded || false);
  const [consentDownloadNotice, setConsentDownloadNotice] = useState(null);

  // 4. Voice-Based Field Notes State
  const [isRecording, setIsRecording] = useState(false);
  const [audioLang, setAudioLang] = useState('kn'); // kn = Kannada, hi = Hindi, ta = Tamil, te = Telugu, en = English
  const [audioTranscript, setAudioTranscript] = useState('');
  const [structuredNote, setStructuredNote] = useState(null);

  // 5. Promise-to-Pay / Assistance State
  const [promiseDate, setPromiseDate] = useState('2026-04-15');
  const [promiseAmount, setPromiseAmount] = useState('35000');
  const [delayReason, setDelayReason] = useState('Mandi unseasonal rain auction deferral');
  const [supportOffered, setSupportOffered] = useState('Granted 30-day harvest grace period and arranged warehousing receipt check');
  const [assistanceSuccessMsg, setAssistanceSuccessMsg] = useState(null);

  // Quick voice sample generator
  const handleSimulateVoiceRecord = () => {
    setIsRecording(true);
    setAudioTranscript('');
    setStructuredNote(null);

    setTimeout(() => {
      setIsRecording(false);
      let sampleRaw = '';
      if (audioLang === 'kn') {
        sampleRaw = 'ರೈತ ಬಸವರಾಜಪ್ಪ ಅವರ ಕಬ್ಬು ಬೆಳೆ ತಪಾಸಣೆ ಮಾಡಿದೆವು. ಕ್ಯಾನಲ್ ನೀರು ಲಭ್ಯವಿದೆ. ಗೊಬ್ಬರ ಹಾಕಿದ್ದಾರೆ. ಫಸಲು ಬರುವ ಮಾರ್ಚ್ 15 ಕ್ಕೆ ಸಿದ್ಧವಾಗಲಿದೆ. ಸಾಲ ಮರುಪಾವತಿ ಮಾಡುವುದಾಗಿ ಭರವಸೆ ನೀಡಿದ್ದಾರೆ.';
      } else if (audioLang === 'hi') {
        sampleRaw = 'किसान के खेत का निरीक्षण किया गया। नहर का पानी पर्याप्त है। फसल अच्छी स्थिति में है और मार्च मध्य तक कटाई होगी। किसान ने समय पर भुगतान का आश्वासन दिया।';
      } else if (audioLang === 'ta') {
        sampleRaw = 'விவசாயி நிலத்தை ஆய்வு செய்தோம். பயிர் நலம் திருப்திகரமாக உள்ளது. அடுத்த மாதம் அறுவடை எதிர்பார்க்கப்படுகிறது.';
      } else {
        sampleRaw = 'Field visit conducted for sugarcane plot. Irrigation canal discharge normal. Crop vegetative growth optimal. Harvest scheduled for March 15. Farmer confirmed prompt repayment post sugar mill delivery.';
      }

      setAudioTranscript(sampleRaw);
      setStructuredNote({
        farmerName: farmer.name,
        village: farmer.village,
        cropCondition: 'Vegetative growth optimal (No pest infestation observed)',
        irrigationStatus: 'Canal irrigation active and continuous',
        farmerConcern: 'Awaiting sugar factory harvesting cutting slip schedule',
        recommendedAction: 'Verify sugar factory procurement slip; schedule follow-up on March 20, 2026',
        nextFollowUpDate: '2026-03-20',
        capturedBy: 'ARO Ramesh Kumar (ST-101)'
      });

      if (onLogAudit) {
        onLogAudit({
          action: 'VOICE_FIELD_NOTE_PROCESSED',
          userRole: currentRole,
          entityId: farmer.id,
          entityType: 'Farmer',
          notes: `Transcribed regional voice note (${audioLang.toUpperCase()}) into structured field verification note.`
        });
      }
    }, 1800);
  };

  // Record Consent
  const handleToggleConsent = () => {
    const nextVal = !consentGranted;
    setConsentGranted(nextVal);
    if (onUpdateFarmer && farmer) {
      onUpdateFarmer({
        ...farmer,
        consentRecorded: nextVal,
        consentDate: nextVal ? new Date().toISOString().split('T')[0] : null
      });
    }
    if (onLogAudit) {
      onLogAudit({
        action: nextVal ? 'FARMER_CONSENT_RECORDED' : 'FARMER_CONSENT_REVOKED',
        userRole: currentRole,
        entityId: farmer.id,
        entityType: 'Farmer',
        notes: `Farmer consent ${nextVal ? 'granted' : 'withdrawn'} for agricultural credit evaluation.`
      });
    }
  };

  const handleDownloadPassport = () => {
    const passportData = {
      title: 'AgriSahay - Farmer Data Passport & Consent Record',
      issuedDate: new Date().toISOString(),
      farmer: {
        id: farmer.id,
        name: farmer.name,
        maskedAadhaar: maskAadhaar(farmer.aadhaarMasked),
        phone: farmer.phone,
        village: farmer.village,
        district: farmer.district,
        state: farmer.state,
        landSizeAcres: farmer.landSize,
        primaryCrop: farmer.primaryCrop,
        secondaryCrop: farmer.secondaryCrop,
        annualFarmIncome: farmer.annualIncome,
        alliedIncome: farmer.alliedIncome,
        resilienceScore: resilienceResult.score,
        resilienceCategory: resilienceResult.category
      },
      consentStatus: {
        consented: consentGranted,
        consentDate: farmer.consentDate || new Date().toISOString().split('T')[0],
        purposes: [
          'Agricultural credit evaluation and KCC Scale of Finance assessment',
          'Weather risk alert notification and contingency advisories',
          'Government subsidy and PMFBY crop insurance matching'
        ],
        thirdPartySharing: 'Strictly restricted to banking credit sanction and authorized PMFBY/government subsidy verification.'
      }
    };

    const blob = new Blob([JSON.stringify(passportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Data_Passport_${farmer.id}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setConsentDownloadNotice(`Data Passport for ${farmer.name} downloaded successfully!`);
    setTimeout(() => setConsentDownloadNotice(null), 4000);
  };

  // Add Supportive Promise to Pay
  const handleAddSupportPromise = (e) => {
    e.preventDefault();
    const newEntry = {
      id: `AST-${Date.now()}`,
      farmerId: farmer.id,
      farmerName: farmer.name,
      village: farmer.village,
      district: farmer.district,
      loanId: 'LN-2025-CURRENT',
      crop: farmer.primaryCrop,
      amountDue: Number(promiseAmount),
      promisedDate: promiseDate,
      reasonForDelay: delayReason,
      assistanceOffered: supportOffered,
      followUpDate: promiseDate,
      assignedOfficer: 'Branch Banking Unit',
      status: 'Supportive Plan Active',
      notes: 'Recorded with dignified supportive engagement.'
    };

    if (onUpdateAssistance) {
      onUpdateAssistance([newEntry, ...assistanceList]);
    }

    setAssistanceSuccessMsg(`Support plan and payment date recorded with dignity for ${farmer.name}.`);
    setTimeout(() => setAssistanceSuccessMsg(null), 4000);

    if (onLogAudit) {
      onLogAudit({
        action: 'ASSISTANCE_PLAN_RECORDED',
        userRole: currentRole,
        entityId: farmer.id,
        entityType: 'Farmer',
        notes: `Recorded repayment support plan. Promised Date: ${promiseDate}, Assistance: ${supportOffered}`
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
        color: '#ffffff',
        borderRadius: '12px',
        padding: '1.75rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.15)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              <Sparkles size={16} />
              Demo Innovation Center • Placement Showcase
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, letterSpacing: '-0.025em' }}>
              Farmer Resilience Banking Layer
            </h1>
            <p style={{ marginTop: '0.5rem', color: '#a7f3d0', fontSize: '0.9375rem', maxWidth: '780px', lineHeight: 1.5 }}>
              AgriSahay's distinctive combination of farmer resilience scoring, harvest-linked repayment planning, climate-safe underwriting, and explainable decisioning—tailored specifically for seasonal rural agriculture.
            </p>
          </div>

          {/* Farmer Switcher */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', minWidth: '260px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#d1fae5', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Simulated Borrower Focus:
            </label>
            <select
              value={selectedFarmerId}
              onChange={(e) => setSelectedFarmerId(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                padding: '0.5rem',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.875rem'
              }}
            >
              {farmers.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.village}, {f.primaryCrop})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Feature Tabs Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {[
            { id: 'resilience', label: '1. Explainable Resilience Index', icon: Shield },
            { id: 'harvest-planner', label: '2. Harvest Repayment Planner', icon: Calendar },
            { id: 'simulator', label: '3. What-If Farm Simulator', icon: Sliders },
            { id: 'climate-safe', label: '4. Climate Safeguards', icon: ShieldCheck },
            { id: 'heatmaps', label: '5. Community Risk Heatmap', icon: MapPin },
            { id: 'consent-passport', label: '6. Consent & Data Passport', icon: FileCheck },
            { id: 'voice-notes', label: '7. Voice Field Notes', icon: Mic },
            { id: 'assistance', label: '8. Promise-to-Pay & Assistance', icon: HeartHandshake },
            { id: 'explainable-decision', label: '9. Explainable Decisioning', icon: CheckCircle2 },
            { id: 'impact-dashboard', label: '10. Impact Dashboard', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.5rem 0.875rem',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: active ? '#ffffff' : 'rgba(255,255,255,0.15)',
                  color: active ? '#065f46' : '#ffffff',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: EXPLAINABLE FARMER RESILIENCE INDEX */}
      {activeTab === 'resilience' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Decision Governance Banner */}
          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Info size={18} style={{ color: '#2563eb', flexShrink: 0 }} />
            <span style={{ fontSize: '0.8125rem', color: '#1e40af' }}>
              <strong>Decision Support Governance:</strong> {DECISION_GOVERNANCE_NOTICE}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {/* Main Index Card */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                    Transparent Agronomic Metric (Zero Black-Box AI)
                  </span>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                    Explainable Farmer Resilience Index
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Borrower: <strong>{farmer.name}</strong> • {farmer.landSize} Acres ({farmer.primaryCrop})
                  </p>
                </div>

                <div style={{
                  textAlign: 'center',
                  backgroundColor: resilienceResult.badgeBg,
                  color: resilienceResult.badgeColor,
                  padding: '0.75rem 1.25rem',
                  borderRadius: '8px',
                  border: `1px solid ${resilienceResult.badgeColor}33`
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{resilienceResult.score}/100</div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, marginTop: '0.25rem', textTransform: 'uppercase' }}>
                    {resilienceResult.category}
                  </div>
                </div>
              </div>

              {/* Confidence & Override Indicator */}
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem' }}>
                <span style={{ color: '#475569' }}>
                  Data Confidence Level: <strong style={{ color: resilienceResult.confidencePercent >= 80 ? '#15803d' : '#d97706' }}>{resilienceResult.confidencePercent}%</strong>
                </span>
                {resilienceResult.isOverridden ? (
                  <span style={{ color: '#b45309', fontWeight: 600 }}>
                    ⚡ Officer Adjusted (Orig: {resilienceResult.originalIndex})
                  </span>
                ) : (
                  <span style={{ color: '#15803d', fontWeight: 500 }}>
                    Rule-Based Verifiable Score
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div style={{ marginTop: '1rem' }}>
                <div style={{ height: '8px', width: '100%', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${resilienceResult.score}%`, backgroundColor: resilienceResult.badgeColor, transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.375rem' }}>
                  <span>Vulnerable (0-54)</span>
                  <span>Moderate (55-74)</span>
                  <span>Climate-Safe (75-100)</span>
                </div>
              </div>

              {/* Override Button */}
              <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setIsOverrideModalOpen(true)}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  ⚡ Challenge / Record Officer Override
                </button>
              </div>

              {/* Positive and Risk Factors */}
              <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ backgroundColor: '#f0fdf4', padding: '0.75rem', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', marginBottom: '0.375rem' }}>
                    Positive Agronomic Buffers
                  </div>
                  {resilienceResult.positiveFactors.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.75rem', color: '#14532d' }}>
                      {resilienceResult.positiveFactors.map((pf, i) => <li key={i}>{pf}</li>)}
                    </ul>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>No major buffers logged</span>
                  )}
                </div>

                <div style={{ backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '6px', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.375rem' }}>
                    Vulnerability & Risk Factors
                  </div>
                  {resilienceResult.riskFactors.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.75rem', color: '#7f1d1d' }}>
                      {resilienceResult.riskFactors.map((rf, i) => <li key={i}>{rf}</li>)}
                    </ul>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#15803d' }}>Low systemic agronomic risk</span>
                  )}
                </div>
              </div>

              {/* Missing Data Impact */}
              {resilienceResult.missingInformation.length > 0 && (
                <div style={{ marginTop: '0.75rem', backgroundColor: '#fffbeb', padding: '0.75rem', borderRadius: '6px', border: '1px solid #fef08a' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', marginBottom: '0.25rem' }}>
                    Missing Information Affecting Confidence
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.75rem', color: '#78350f' }}>
                    {resilienceResult.missingInformation.map((mi, i) => <li key={i}>{mi}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* Factor Weights & Rationale Table */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                7-Factor Weighting Formula & Plain-Language Rationale
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 0 1rem 0' }}>
                Total 100 points. Formula: <em>Index = ∑ (Factor Points)</em>. Transparently calibrated to rural lending risks:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '420px', overflowY: 'auto' }}>
                {FACTOR_WEIGHTS_EXPLANATIONS.map((fw, idx) => (
                  <div key={idx} style={{ padding: '0.625rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '0.8125rem', color: '#1e293b' }}>{fw.factor} ({fw.maxPoints} pts / {fw.weightPercent})</strong>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                      {fw.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Aggregated Manager Bias Check Panel (Manager / Admin Role Only) */}
          {(currentRole === 'manager' || currentRole === 'admin') && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={18} style={{ color: '#15803d' }} />
                    Supervisory Bias & Parity Check (Aggregated Audit View)
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                    Branch Manager inspection tool monitoring systemic scoring differences across cohorts. Privacy threshold (N &lt; 5) strictly applied.
                  </p>
                </div>
              </div>

              {biasMetrics.disparityFlags.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  {biasMetrics.disparityFlags.map((fl, i) => (
                    <div key={i} style={{ backgroundColor: '#fffbeb', border: '1px solid #fef08a', borderRadius: '6px', padding: '0.75rem' }}>
                      <strong style={{ fontSize: '0.8125rem', color: '#92400e' }}>⚠️ {fl.title}: </strong>
                      <span style={{ fontSize: '0.8125rem', color: '#78350f' }}>{fl.message}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Dimension</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Cohort</th>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Borrowers (N)</th>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Avg Resilience Index</th>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Loan Approval Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {biasMetrics.cohorts.map((c, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>{c.category}</td>
                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>{c.groupName}</td>
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{c.isSuppressed ? '< 5 (Suppressed)' : c.count}</td>
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: 700 }}>{c.avgIndex}</td>
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{c.approvalRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Officer Override Modal */}
          {isOverrideModalOpen && (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: '1rem' }}>
              <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', maxWidth: '480px', width: '100%', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                  Record Officer Resilience Adjustment
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 0 1rem 0' }}>
                  Adjust the Explainable Index for {farmer.name} based on on-site verified agronomic grounds.
                </p>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Adjusted Index Value (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={overrideAdjustment || resilienceResult.score}
                    onChange={(e) => setOverrideAdjustment(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Original calculated index: {resilienceResult.originalIndex || resilienceResult.score}</span>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Mandatory Justification for Audit Log *
                  </label>
                  <textarea
                    rows="3"
                    value={overrideJustification}
                    onChange={(e) => setOverrideJustification(e.target.value)}
                    placeholder="e.g. Physical visit confirmed micro-sprinkler piping installed last week not yet updated in state registry..."
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsOverrideModalOpen(false)}
                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.8125rem', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!overrideJustification.trim()) {
                        alert('Justification comment is mandatory for banking compliance.');
                        return;
                      }
                      const updated = {
                        ...overrides,
                        [farmer.id]: {
                          adjustedScore: overrideAdjustment || resilienceResult.score,
                          reason: overrideJustification,
                          adjustedBy: currentRole,
                          adjustedAt: new Date().toISOString()
                        }
                      };
                      setOverrides(updated);
                      saveResilienceOverrides(updated);
                      setIsOverrideModalOpen(false);
                      if (onLogAudit) {
                        onLogAudit({
                          action: 'RESILIENCE_INDEX_OVERRIDE',
                          userRole: currentRole,
                          entityId: farmer.id,
                          entityType: 'Farmer',
                          previousStatus: String(resilienceResult.originalIndex || resilienceResult.score),
                          newStatus: String(overrideAdjustment || resilienceResult.score),
                          notes: `Officer override applied: ${overrideJustification}`
                        });
                      }
                      alert('Resilience adjustment saved and logged to audit trail.');
                    }}
                    style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none', backgroundColor: '#15803d', color: '#ffffff', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Commit Adjustment
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HARVEST-LINKED REPAYMENT PLANNER */}
      {activeTab === 'harvest-planner' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#059669' }}>
                Non-Linear Farm Cash Flow Scheduling
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                Harvest-Linked Repayment Planner
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                Replaces rigid monthly EMIs with dates customized to sowing duration, harvest windows, and local APMC mandi realization.
              </p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '0.5rem 0.875rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8125rem', color: '#334155' }}>
              Crop: <strong>{farmer.primaryCrop}</strong> • Acreage: <strong>{farmer.landSize} Acres</strong>
            </div>
          </div>

          {/* Interactive Parameters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                Sowing Date:
              </label>
              <input
                type="date"
                value={sowDate}
                onChange={(e) => setSowDate(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                Crop Duration (Days):
              </label>
              <input
                type="number"
                value={cropDays}
                onChange={(e) => setCropDays(Number(e.target.value))}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                Mandi Sale Buffer (Days):
              </label>
              <input
                type="number"
                value={mandiBuffer}
                onChange={(e) => setMandiBuffer(Number(e.target.value))}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
              <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>Post-harvest APMC payment clearing</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                Loan Principal (₹):
              </label>
              <input
                type="number"
                value={plannerLoanAmt}
                onChange={(e) => setPlannerLoanAmt(Number(e.target.value))}
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
                value={plannerInterestRate}
                onChange={(e) => setPlannerInterestRate(Number(e.target.value))}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
              <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>Standard KCC benchmark</span>
            </div>
          </div>

          {/* Computed Harvest Schedule Timeline */}
          {harvestSchedule && (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>1. Sowing & Disbursal</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{harvestSchedule.sowingDate}</div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>Initial working capital required</div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#fefce8', borderRadius: '8px', border: '1px solid #fef08a' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#854d0e', textTransform: 'uppercase' }}>2. Harvest Window</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{harvestSchedule.harvestStartDate}</div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>to {harvestSchedule.harvestEndDate} (Duration: {cropDays}d)</div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>3. Mandi Settlement Buffer</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>+{mandiBuffer} Days Buffer</div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>Prevents distress sales at low prices</div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#065f46', borderRadius: '8px', color: '#ffffff' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a7f3d0', textTransform: 'uppercase' }}>4. Single Bullet Due Date</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.25rem' }}>{harvestSchedule.repaymentDueDate}</div>
                  <div style={{ fontSize: '0.75rem', color: '#d1fae5', marginTop: '0.25rem' }}>Total: {formatINR(harvestSchedule.totalDueAtMandiSettlement)}</div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', padding: '0.875rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#334155' }}>
                <Info size={16} color="#059669" />
                <span><strong>Policy Rationale:</strong> {harvestSchedule.rationale}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WHAT-IF FARM SIMULATOR */}
      {activeTab === 'simulator' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#b91c1c' }}>
                Stress Testing & Scenario Analysis
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                What-If Farm Shock Simulator
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                Simulates real-world agricultural shocks (drought, price collapse, delayed rains, pest attacks) to evaluate income erosion and debt service capacity.
              </p>
            </div>

            <div style={{ backgroundColor: '#f1f5f9', padding: '0.5rem 0.875rem', borderRadius: '6px', fontSize: '0.8125rem', color: '#334155' }}>
              Base Income: <strong>{formatINR(simBaseIncome)}</strong> • Loan Requested: <strong>{formatINR(simLoanRequested)}</strong>
            </div>
          </div>

          {/* Scenario Selector Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            {[
              { id: 'NORMAL', label: 'Baseline (Normal)', icon: Sun },
              { id: 'DROUGHT', label: 'Severe Drought (-45%)', icon: AlertTriangle },
              { id: 'DELAYED_MONSOON', label: 'Delayed Monsoon (-20%)', icon: Clock },
              { id: 'PRICE_CRASH', label: 'Mandi Price Crash (-35%)', icon: TrendingUp },
              { id: 'PEST_ATTACK', label: 'Pest Infestation (-30%)', icon: Leaf },
              { id: 'INPUT_COST_SPIKE', label: 'Input Cost Inflation (+30% Cost)', icon: Sliders }
            ].map(sc => {
              const active = scenarioType === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => setScenarioType(sc.id)}
                  style={{
                    padding: '0.5rem 0.875rem',
                    borderRadius: '6px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: active ? '1px solid #0f172a' : '1px solid #cbd5e1',
                    backgroundColor: active ? '#0f172a' : '#ffffff',
                    color: active ? '#ffffff' : '#334155'
                  }}
                >
                  {sc.label}
                </button>
              );
            })}
          </div>

          {/* Scenario Results Panel */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
            <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Simulated Harvest Income</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: simResult.incomeLossPercent > 0 ? '#b91c1c' : '#059669', marginTop: '0.25rem' }}>
                {formatINR(simResult.simulatedIncome)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                {simResult.incomeLossPercent > 0 ? `-${simResult.incomeLossPercent}% drop from baseline` : 'Standard baseline harvest'}
              </div>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Safe Debt Servicing Capacity</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
                {formatINR(simResult.estimatedDebtCapacity)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                Max 45% of net income for safe debt service
              </div>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: simResult.repaymentStress === 'Deficit Risk' ? '#fef2f2' : '#f0fdf4', borderRadius: '8px', border: simResult.repaymentStress === 'Deficit Risk' ? '1px solid #fecaca' : '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: simResult.repaymentStress === 'Deficit Risk' ? '#991b1b' : '#166534', textTransform: 'uppercase' }}>
                Stress Assessment
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: simResult.repaymentStress === 'Deficit Risk' ? '#b91c1c' : '#15803d', marginTop: '0.25rem' }}>
                {simResult.repaymentStress}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
                Recommended Cap: <strong>{formatINR(simResult.simulatedLoanCeiling)}</strong>
              </div>
            </div>
          </div>

          {/* Recommended Policy Action */}
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1e293b' }}>
              Simulated Shock Dynamic:
            </div>
            <p style={{ fontSize: '0.875rem', color: '#334155', marginTop: '0.25rem', margin: 0 }}>
              {simResult.shockDescription}
            </p>
            <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', fontWeight: 700, color: '#047857' }}>
              Recommended Credit Safeguard:
            </div>
            <p style={{ fontSize: '0.875rem', color: '#065f46', marginTop: '0.25rem', margin: 0 }}>
              {simResult.policyAction}
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: CLIMATE-SAFE LOAN SAFEGUARDS */}
      {activeTab === 'climate-safe' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#059669' }}>
                Prudential Agricultural Safeguards
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                Climate-Safe Loan Recommendations
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                Structural risk mitigants tailored to the borrower's climate vulnerability tier and cropping profile.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
            {climateSafeguards.map((item, idx) => (
              <div key={idx} style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#059669', backgroundColor: '#dcfce7', padding: '0.125rem 0.5rem', borderRadius: '4px' }}>
                    {item.category}
                  </span>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.5rem' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.8125rem', color: '#475569', marginTop: '0.375rem', lineHeight: 1.5 }}>{item.description}</p>
                </div>
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                  <ShieldCheck size={14} />
                  <span>Configured in Sanction Letter</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: COMMUNITY RISK HEATMAP */}
      {activeTab === 'heatmaps' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#2563eb' }}>
                Aggregated Village Analytics (Zero Individual PII)
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                Community Risk Heatmap
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                Aggregates rainfall stress, pest incidents, irrigation dependency, and crop concentration at the village level.
              </p>
            </div>

            <div style={{ backgroundColor: '#eff6ff', padding: '0.5rem 0.875rem', borderRadius: '6px', border: '1px solid #bfdbfe', fontSize: '0.75rem', color: '#1e40af' }}>
              🔒 <strong>Privacy Guard:</strong> Never exposes individual farmer balances or personal credit records.
            </div>
          </div>

          {/* Village Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
            {villageHeatmaps.map((v) => {
              const isHigh = v.overallRiskTier === 'High';
              const isMed = v.overallRiskTier === 'Medium';
              const badgeBg = isHigh ? '#fee2e2' : isMed ? '#fef3c7' : '#dcfce7';
              const badgeColor = isHigh ? '#991b1b' : isMed ? '#92400e' : '#166534';

              return (
                <div key={v.villageId} style={{ backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={18} color="#059669" />
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{v.villageName}</h3>
                      </div>
                      <span style={{ backgroundColor: badgeBg, color: badgeColor, padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase' }}>
                        {v.overallRiskTier} Risk
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      {v.taluk}, {v.district} • {v.activeBorrowersCount} Active Borrowers
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Dominant Crop:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{v.dominantCrop}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Rainfall Stress:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{v.rainfallStressIndex}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Irrigation Dependency:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{v.irrigationDependency}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Pest/Disease Pressure:</span>
                        <span style={{ fontWeight: 600, color: v.pestDiseasePressure.includes('High') ? '#b91c1c' : '#1e293b' }}>
                          {v.pestDiseasePressure}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Delayed Repayment Rate:</span>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{v.delayedRepaymentRate}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', padding: '0.625rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#475569' }}>
                    <strong>Branch Advisory:</strong> {v.advisoryNote}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: FARMER CONSENT & DATA PASSPORT */}
      {activeTab === 'consent-passport' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#059669' }}>
                Farmer Rights & Transparent Governance
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                Farmer Consent & Portable Data Passport
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                Shows exactly what agricultural and personal data is recorded, for what purpose, and allows the farmer to download their own comprehensive Data Passport.
              </p>
            </div>

            <button
              onClick={handleDownloadPassport}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#059669',
                color: '#ffffff',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.875rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Download size={16} />
              Download Data Passport (JSON)
            </button>
          </div>

          {consentDownloadNotice && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '0.875rem' }}>
              ✓ {consentDownloadNotice}
            </div>
          )}

          {/* Consent Details Card */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Explicit Data Usage Scope:</h3>
              <ul style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: '#334155', paddingLeft: '1.25rem' }}>
                <li><strong>Identification & KYC:</strong> Masked Aadhaar ({maskAadhaar(farmer.aadhaarMasked)}), Name, Village location.</li>
                <li><strong>Agricultural Assets:</strong> Verified land size ({farmer.landSize} acres), soil profile, irrigation type.</li>
                <li><strong>Cropping & Harvest:</strong> Primary crop ({farmer.primaryCrop}), expected harvest date, and yield estimates.</li>
                <li><strong>Financials:</strong> Declared farm income, allied dairy revenue, and existing institutional debt.</li>
              </ul>

              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>Farmer Consent Status</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {consentGranted ? `Granted on ${farmer.consentDate || '2025-10-15'}` : 'Not yet explicitly recorded'}
                  </div>
                </div>

                <button
                  onClick={handleToggleConsent}
                  style={{
                    padding: '0.375rem 0.875rem',
                    borderRadius: '6px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: consentGranted ? '#dcfce7' : '#f1f5f9',
                    color: consentGranted ? '#166534' : '#475569'
                  }}
                >
                  {consentGranted ? 'Consent Verified ✓' : 'Record Consent'}
                </button>
              </div>
            </div>

            {/* Portable Summary Preview */}
            <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Portable Data Passport Preview:</h3>
              <div style={{ marginTop: '0.75rem', backgroundColor: '#0f172a', color: '#f8fafc', padding: '0.875rem', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'monospace', maxHeight: '200px', overflowY: 'auto' }}>
                <pre style={{ margin: 0 }}>
{JSON.stringify({
  passportId: `PASSPORT-${farmer.id}`,
  holder: farmer.name,
  village: farmer.village,
  district: farmer.district,
  landholding: `${farmer.landSize} Acres`,
  primaryCrop: farmer.primaryCrop,
  resilienceScore: `${resilienceResult.score}/100`,
  consentRecorded: consentGranted
}, null, 2)}
                </pre>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                Farmers can present this verifiable passport to access PMFBY insurance claims or agricultural subsidies at other institutions.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: VOICE-BASED FIELD NOTES */}
      {activeTab === 'voice-notes' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#059669' }}>
                Field Productivity Demonstration
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                Voice-Based Field Notes (Multilingual Speech to Structured Note)
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                Simulates field officers speaking in local languages (Kannada, Hindi, Tamil, Telugu) during farm inspections, converted into structured underwriting records.
              </p>
            </div>

            {/* Language Selector for Demo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>Demo Language:</span>
              <select
                value={audioLang}
                onChange={(e) => setAudioLang(e.target.value)}
                style={{ padding: '0.375rem 0.625rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8125rem', fontWeight: 600 }}
              >
                <option value="kn">Kannada (ಕನ್ನಡ)</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          {/* Interactive Record Simulator */}
          <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <button
              onClick={handleSimulateVoiceRecord}
              disabled={isRecording}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.625rem',
                backgroundColor: isRecording ? '#dc2626' : '#059669',
                color: '#ffffff',
                padding: '0.75rem 1.75rem',
                borderRadius: '9999px',
                fontSize: '0.9375rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease'
              }}
            >
              <Mic size={18} />
              {isRecording ? 'Listening in Field (Simulating Speech)...' : 'Record Demo Field Observation Note'}
            </button>

            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.75rem' }}>
              Simulates a 30-second speech audio stream converted into underwriting tags for <strong>{farmer.name}</strong>.
            </div>
          </div>

          {/* Transcription & Structured Output */}
          {audioTranscript && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <Volume2 size={16} />
                  Raw Audio Transcription ({audioLang.toUpperCase()})
                </div>
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#1e293b', fontStyle: 'italic', lineHeight: 1.5 }}>
                  "{audioTranscript}"
                </p>
              </div>

              {structuredNote && (
                <div style={{ padding: '1.25rem', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>
                    Structured Field Verification Output
                  </div>
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                    <div><strong>Crop Condition:</strong> {structuredNote.cropCondition}</div>
                    <div><strong>Irrigation Status:</strong> {structuredNote.irrigationStatus}</div>
                    <div><strong>Farmer Concern:</strong> {structuredNote.farmerConcern}</div>
                    <div><strong>Recommended Action:</strong> {structuredNote.recommendedAction}</div>
                    <div><strong>Next Follow-up Date:</strong> {structuredNote.nextFollowUpDate}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 8: PROMISE-TO-PAY & ASSISTANCE TRACKER */}
      {activeTab === 'assistance' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#059669' }}>
                Supportive Rural Engagement
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                Promise-to-Pay and Assistance Tracker
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                Records farmer repayment commitments with dignity, tracking the root agricultural reason for delay and supportive relief offered without negative labels.
              </p>
            </div>
          </div>

          {assistanceSuccessMsg && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '0.875rem' }}>
              ✓ {assistanceSuccessMsg}
            </div>
          )}

          {/* New Assistance Plan Form */}
          <form onSubmit={handleAddSupportPromise} style={{ marginTop: '1.5rem', padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                Promised Repayment Date:
              </label>
              <input
                type="date"
                value={promiseDate}
                onChange={(e) => setPromiseDate(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                Promised Amount (₹):
              </label>
              <input
                type="number"
                value={promiseAmount}
                onChange={(e) => setPromiseAmount(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                Agricultural Reason for Deferral (Supportive Diagnosis):
              </label>
              <input
                type="text"
                value={delayReason}
                onChange={(e) => setDelayReason(e.target.value)}
                placeholder="e.g. Awaiting mandi moisture deduction clearing / Mill payment token"
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                Assistance & Bank Support Facilitated:
              </label>
              <input
                type="text"
                value={supportOffered}
                onChange={(e) => setSupportOffered(e.target.value)}
                placeholder="e.g. 30-day grace period, warehouse receipt verification, PMFBY fast-track"
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                style={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Record Supportive Plan
              </button>
            </div>
          </form>

          {/* Active Assistance Table */}
          <div style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '0.75rem' }}>Farmer</th>
                  <th style={{ padding: '0.75rem' }}>Village</th>
                  <th style={{ padding: '0.75rem' }}>Amount Due</th>
                  <th style={{ padding: '0.75rem' }}>Promised Date</th>
                  <th style={{ padding: '0.75rem' }}>Agri Reason</th>
                  <th style={{ padding: '0.75rem' }}>Bank Support Provided</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {assistanceList.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: '#0f172a' }}>{item.farmerName}</td>
                    <td style={{ padding: '0.75rem', color: '#475569' }}>{item.village}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: '#0f172a' }}>{formatINR(item.amountDue)}</td>
                    <td style={{ padding: '0.75rem', color: '#059669', fontWeight: 600 }}>{item.promisedDate}</td>
                    <td style={{ padding: '0.75rem', color: '#334155' }}>{item.reasonForDelay}</td>
                    <td style={{ padding: '0.75rem', color: '#065f46' }}>{item.assistanceOffered}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ backgroundColor: '#eff6ff', color: '#1e40af', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 600 }}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 9: EXPLAINABLE LOAN DECISION PANEL */}
      {activeTab === 'explainable-decision' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#059669' }}>
                Transparent Underwriting Governance
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                Explainable Loan Decision Panel
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                Explicit breakdown of positive drivers, risk flags, missing data, and concrete steps to improve eligibility. The system never makes a final sanction decision automatically.
              </p>
            </div>

            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '0.5rem 0.875rem', borderRadius: '6px', fontSize: '0.75rem', color: '#991b1b', fontWeight: 600 }}>
              ⚠️ Zero Automated Sanction • Branch Manager Human Discretion Required
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
            {/* Positive Drivers */}
            <div style={{ padding: '1.25rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontWeight: 700, fontSize: '0.875rem' }}>
                <CheckCircle2 size={16} />
                Positive Lending Factors
              </div>
              <ul style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: '#14532d', paddingLeft: '1.25rem' }}>
                <li>Adequate landholding ({farmer.landSize} acres) meeting Scale of Finance criteria.</li>
                <li>Secondary dairy income ({formatINR(farmer.alliedIncome)}) provides non-crop cash flow.</li>
                <li>Assured water availability recorded via {farmer.landType}.</li>
                <li>Clean institutional repayment record with zero past write-offs.</li>
              </ul>
            </div>

            {/* Risk Drivers */}
            <div style={{ padding: '1.25rem', backgroundColor: '#fefce8', borderRadius: '8px', border: '1px solid #fef08a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#854d0e', fontWeight: 700, fontSize: '0.875rem' }}>
                <AlertTriangle size={16} />
                Risk Factors to Review
              </div>
              <ul style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: '#713f12', paddingLeft: '1.25rem' }}>
                <li>Price volatility risk on commercial cash crop ({farmer.primaryCrop}).</li>
                <li>District monsoon deficit in past 3-year historical cycle.</li>
                <li>Existing outstanding borrowing burden: {formatINR(farmer.existingLoanBurden)}.</li>
              </ul>
            </div>

            {/* Missing Information / Verification */}
            <div style={{ padding: '1.25rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e40af', fontWeight: 700, fontSize: '0.875rem' }}>
                <Info size={16} />
                Information Checklist
              </div>
              <ul style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: '#1e3a8a', paddingLeft: '1.25rem' }}>
                <li>Physical geo-tagged crop germination photo from ARO visit.</li>
                <li>Updated land record mutation copy (Pahani/Patta).</li>
                <li>PMFBY insurance policy enrollment receipt.</li>
              </ul>
            </div>

            {/* Actions to Improve Eligibility */}
            <div style={{ padding: '1.25rem', backgroundColor: '#faf5ff', borderRadius: '8px', border: '1px solid #e9d5ff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b21a8', fontWeight: 700, fontSize: '0.875rem' }}>
                <TrendingUp size={16} />
                Actions to Improve Terms
              </div>
              <ul style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: '#581c87', paddingLeft: '1.25rem' }}>
                <li>Enroll in intercropping scheme with short-duration pulses (+8 pts resilience).</li>
                <li>Adopt micro-drip irrigation with state subsidy (+12 pts resilience).</li>
                <li>Opt for harvest-linked bullet repayment schedule to prevent pre-harvest default.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: IMPACT DASHBOARD */}
      {activeTab === 'impact-dashboard' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#059669' }}>
                Measurable Operational Outcomes
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                AgriSahay Rural Impact Dashboard
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                Tracking measurable improvements in loan turnaround, field officer offline coverage, climate safeguards, and borrower financial health.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
            <div style={{ padding: '1.25rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>TAT Reduction</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>4.2 Days</div>
              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>Down from 18 days traditional paper turnaround</div>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>Offline Field Visits Completed</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>148 Visits</div>
              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>Logged in zero-connectivity villages without failure</div>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: '#fefce8', borderRadius: '8px', border: '1px solid #fef08a' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#854d0e', textTransform: 'uppercase' }}>Harvest-Aligned Schedules</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>84.5%</div>
              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>Loans mapped to post-harvest mandi payment window</div>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: '#faf5ff', borderRadius: '8px', border: '1px solid #e9d5ff' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b21a8', textTransform: 'uppercase' }}>Farmers with Climate Safeguards</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>92.8%</div>
              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>Covered under PMFBY insurance or drip financing</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
