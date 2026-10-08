import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  Download,
  AlertTriangle,
  Info,
  CheckCircle2,
  FileText,
  User,
  Clock,
  Send,
  Eye,
  RefreshCw
} from 'lucide-react';
import { maskAadhaar, formatINR } from '../data/mockStore';

export default function PrivacyCenterPage({
  farmers = [],
  loans = [],
  documents = [],
  visits = [],
  onUpdateFarmer,
  onLogAudit,
  currentRole = 'manager'
}) {
  const [selectedFarmerId, setSelectedFarmerId] = useState(farmers[0]?.id || '');
  const [activeTab, setActiveTab] = useState('consent'); // 'consent', 'stored-info', 'explainer', 'correction'
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState(null);
  const [correctionSubmitted, setCorrectionSubmitted] = useState(false);
  const [correctionNote, setCorrectionNote] = useState('');

  const farmer = farmers.find(f => f.id === selectedFarmerId) || farmers[0];
  const farmerLoans = loans.filter(l => l.farmerId === farmer?.id);
  const farmerDocs = documents.filter(d => d.farmerId === farmer?.id);
  const farmerVisits = visits.filter(v => v.farmerId === farmer?.id);

  // Consent scopes state with fallback defaults
  const [consentScopes, setConsentScopes] = useState({
    dataCollection: farmer?.consentRecorded !== false,
    loanProcessing: true,
    smsReminders: farmer?.consentRecorded !== false,
    documentStorage: true,
    reportSharing: true
  });

  const handleToggleScope = (scopeKey) => {
    const nextVal = !consentScopes[scopeKey];
    const updatedScopes = { ...consentScopes, [scopeKey]: nextVal };
    setConsentScopes(updatedScopes);

    // Save back to farmer profile
    if (onUpdateFarmer && farmer) {
      onUpdateFarmer({
        ...farmer,
        consentRecorded: updatedScopes.dataCollection,
        consentPreferences: updatedScopes
      });
    }

    if (onLogAudit) {
      onLogAudit({
        action: nextVal ? 'CONSENT_SCOPE_GRANTED' : 'CONSENT_SCOPE_WITHDRAWN',
        userRole: currentRole,
        entityId: farmer.id,
        entityType: 'Farmer Consent',
        notes: `Farmer consent for ${scopeKey} changed to ${nextVal ? 'GRANTED' : 'WITHDRAWN'}. Recorded by ${currentRole}.`
      });
    }
  };

  const handleDownloadFullPassport = () => {
    const dataPackage = {
      title: 'AgriSahay - Farmer Stored Data Passport',
      exportTimestamp: new Date().toISOString(),
      disclaimer: 'Personal data extract generated under Farmer Data Rights. For borrower verification and credit mobility.',
      farmerProfile: {
        id: farmer.id,
        name: farmer.name,
        maskedAadhaar: maskAadhaar(farmer.aadhaarMasked),
        phone: farmer.phone,
        village: farmer.village,
        district: farmer.district,
        state: farmer.state,
        totalLandAcres: farmer.landSize,
        irrigationType: farmer.landType,
        primaryCrop: farmer.primaryCrop,
        secondaryCrop: farmer.secondaryCrop,
        annualFarmIncome: farmer.annualIncome,
        alliedIncome: farmer.alliedIncome
      },
      consentStatus: consentScopes,
      loans: farmerLoans.map(l => ({
        id: l.id,
        type: l.loanType,
        amount: l.sanctionedAmount || l.appliedAmount,
        status: l.status,
        harvestDate: l.harvestDate
      })),
      fieldVisits: farmerVisits.map(v => ({
        id: v.id,
        date: v.date,
        cropCondition: v.cropCondition,
        officer: v.officerName
      })),
      documents: farmerDocs.map(d => ({
        id: d.id,
        type: d.type,
        status: d.status
      }))
    };

    const blob = new Blob([JSON.stringify(dataPackage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Farmer_Data_Passport_${farmer.id}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccessNotice(`Complete Data Passport for ${farmer.name} downloaded successfully.`);
    setTimeout(() => setDownloadSuccessNotice(null), 4000);
  };

  const handleCorrectionSubmit = (e) => {
    e.preventDefault();
    setCorrectionSubmitted(true);

    if (onLogAudit) {
      onLogAudit({
        action: 'FARMER_CORRECTION_REQUESTED',
        userRole: currentRole,
        entityId: farmer.id,
        entityType: 'Farmer',
        notes: `Correction request logged: "${correctionNote}". Sent to Branch Operations Admin.`
      });
    }

    setTimeout(() => {
      setCorrectionSubmitted(false);
      setCorrectionNote('');
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', backgroundColor: '#ecfdf5', color: '#065f46', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          <Lock size={14} />
          Digital Personal Data Protection & Borrower Transparency
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Farmer Consent & Privacy Center
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
          Transparent management of farmer consent scopes, data usage disclosures, and portable Data Passport downloads.
        </p>
      </div>

      {downloadSuccessNotice && (
        <div style={{ padding: '0.875rem', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} />
          <strong>{downloadSuccessNotice}</strong>
        </div>
      )}

      {/* Farmer Selector */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>
              Borrower Context:
            </label>
            <select
              value={selectedFarmerId}
              onChange={(e) => setSelectedFarmerId(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', fontWeight: 600 }}
            >
              {farmers.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.village} • Aadhaar: {maskAadhaar(f.aadhaarMasked)})
                </option>
              ))}
            </select>
          </div>

          {/* Tab Selector */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { id: 'consent', label: '1. Consent Scopes' },
              { id: 'stored-info', label: '2. View My Stored Data' },
              { id: 'explainer', label: '3. Data Usage Explainer' },
              { id: 'correction', label: '4. Request Correction' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === tab.id ? '#0f172a' : '#f1f5f9',
                  color: activeTab === tab.id ? '#ffffff' : '#334155'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TAB 1: CONSENT SCOPES */}
      {activeTab === 'consent' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            Individual Consent Records for {farmer.name}
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.25rem' }}>
            Withdrawing consent immediately takes effect across the platform. For example, withdrawing SMS communication prevents automated reminder dispatches.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              {
                key: 'dataCollection',
                title: 'Agricultural Data Collection',
                desc: 'Capturing acreage, soil classification, primary and secondary seasonal cropping pattern.'
              },
              {
                key: 'loanProcessing',
                title: 'Credit Evaluation & Scale of Finance',
                desc: 'Computing eligible borrowing capacity and repayment schedules for agricultural facilities.'
              },
              {
                key: 'smsReminders',
                title: 'SMS Reminders & Weather Advisories',
                desc: 'Automated transactional SMS dispatches for harvest reminders and localized meteorological alerts.'
              },
              {
                key: 'documentStorage',
                title: 'Digital Land Records Vault',
                desc: 'Preserving verified RTC (Pahani/Patta) extracts and government subsidy receipts.'
              },
              {
                key: 'reportSharing',
                title: 'Anonymized Priority Sector Lending Reporting',
                desc: 'Including aggregated statistics in mandatory priority sector lending reporting.'
              }
            ].map(item => {
              const isGranted = consentScopes[item.key];
              return (
                <div key={item.key} style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a' }}>{item.title}</span>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: isGranted ? '#dcfce7' : '#fee2e2', color: isGranted ? '#166534' : '#991b1b' }}>
                        {isGranted ? 'Granted ✓' : 'Withdrawn ✗'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', margin: 0 }}>
                      {item.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleScope(item.key)}
                    style={{
                      padding: '0.4rem 0.875rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: isGranted ? '#fee2e2' : '#dcfce7',
                      color: isGranted ? '#991b1b' : '#166534'
                    }}
                  >
                    {isGranted ? 'Withdraw Consent' : 'Grant Consent'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: STORED INFORMATION & DOWNLOAD */}
      {activeTab === 'stored-info' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Borrower Stored Data Transparency Screen
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
                All personal and agricultural information held on file for {farmer.name}.
              </p>
            </div>

            <button
              onClick={handleDownloadFullPassport}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Download size={16} />
              Download My Data (JSON)
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8125rem' }}>
              <strong>Profile & Contact:</strong>
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div>Aadhaar: <strong>{maskAadhaar(farmer.aadhaarMasked)}</strong></div>
                <div>Phone: <strong>{farmer.phone}</strong></div>
                <div>Village: <strong>{farmer.village}, {farmer.district}</strong></div>
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8125rem' }}>
              <strong>Land & Cropping:</strong>
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div>Operational Acreage: <strong>{farmer.landSize} Acres</strong></div>
                <div>Irrigation Type: <strong>{farmer.landType}</strong></div>
                <div>Primary Crop: <strong>{farmer.primaryCrop}</strong></div>
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8125rem' }}>
              <strong>Economics:</strong>
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div>Annual Farm Income: <strong>{formatINR(farmer.annualIncome)}</strong></div>
                <div>Allied Dairy: <strong>{formatINR(farmer.alliedIncome)}</strong></div>
                <div>External Liabilities: <strong>{formatINR(farmer.existingLoanBurden)}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DATA USAGE EXPLAINER */}
      {activeTab === 'explainer' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
            Plain-Language Data Usage Explainer
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', fontSize: '0.8125rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <strong style={{ color: '#0f172a' }}>1. What Data is Collected?</strong>
              <p style={{ marginTop: '0.5rem', color: '#475569', lineHeight: 1.5 }}>
                We collect your name, village location, masked identification, operational landholding survey numbers, cropping pattern, and self-declared agricultural cash inflows.
              </p>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <strong style={{ color: '#0f172a' }}>2. Why is it Used?</strong>
              <p style={{ marginTop: '0.5rem', color: '#475569', lineHeight: 1.5 }}>
                To calculate transparent agricultural borrowing limits, structure harvest-aligned repayment schedules that avoid pre-harvest default, and notify you of subsidized government schemes.
              </p>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <strong style={{ color: '#0f172a' }}>3. Who Can Access It?</strong>
              <p style={{ marginTop: '0.5rem', color: '#475569', lineHeight: 1.5 }}>
                Access is strictly restricted to assigned Agriculture Relationship Officers and Branch Managers. Your financial records are never shared with commercial marketing third parties.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REQUEST CORRECTION */}
      {activeTab === 'correction' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            Farmer Data Rectification & Correction Request
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.25rem' }}>
            If any recorded landholding acreage, primary crop, or contact number is inaccurate, submit a correction request to the branch credit team.
          </p>

          {correctionSubmitted ? (
            <div style={{ padding: '1rem', backgroundColor: '#ecfdf5', borderRadius: '8px', color: '#065f46', fontSize: '0.875rem' }}>
              ✓ Correction request submitted for {farmer.name}. An audit log entry has been registered for the Operations Admin.
            </div>
          ) : (
            <form onSubmit={handleCorrectionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <textarea
                rows={4}
                value={correctionNote}
                onChange={(e) => setCorrectionNote(e.target.value)}
                placeholder="Describe the discrepancy (e.g. Acreage should be updated to 3.2 acres following new patta registration, or crop changed from Cotton to Groundnut)..."
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary">
                  Submit Rectification Request
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
