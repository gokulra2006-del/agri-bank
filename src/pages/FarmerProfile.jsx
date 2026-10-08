import React, { useState } from 'react';
import {
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  Landmark,
  FileText,
  ShieldCheck,
  Wheat,
  PlusCircle,
  FileCheck2,
  Clock,
  IndianRupee
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { formatINR, maskAadhaar } from '../data/mockStore';
import { calculateResilienceScore } from '../utils/resilienceEngine';
import { Award, ShieldAlert, Sparkles, Download } from 'lucide-react';

export default function FarmerProfile({
  farmerId,
  farmers = [],
  loans = [],
  repayments = [],
  documents = [],
  communications = [],
  onAddCommunication,
  onBack,
  onNavigateToLoan,
  onOpenNewLoan
}) {
  const farmer = farmers.find(f => f.id === farmerId);

  if (!farmer) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Farmer not found.</p>
        <button className="btn btn-secondary" onClick={onBack} style={{ marginTop: '1rem' }}>
          Back to Farmers List
        </button>
      </div>
    );
  }

  const farmerLoans = loans.filter(l => l.farmerId === farmer.id);
  const farmerRepayments = repayments.filter(r => r.farmerName.toLowerCase() === farmer.name.toLowerCase() || farmerLoans.some(l => l.id === r.loanId));
  const farmerDocs = documents.filter(d => d.farmerId === farmer.id);
  const farmerComms = communications.filter(c => c.farmerId === farmer.id);

  const [activeTab, setActiveTab] = useState('overview'); // overview, loans, repayments, docs, timeline
  const [newCommMsg, setNewCommMsg] = useState('');
  const [newCommCategory, setNewCommCategory] = useState('Follow-up Call');
  const [newCommType, setNewCommType] = useState('Call');
  const resilience = calculateResilienceScore(farmer);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top back button */}
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
          Back to Farmers Directory
        </button>
      </div>

      {/* Profile Header Card */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.25rem'
              }}
            >
              {farmer.name.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>
                  {farmer.name}
                </h1>
                <StatusBadge status={farmer.documentStatus} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803d', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  Risk Rating: {farmer.rating}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem', fontSize: '0.8125rem', color: '#64748b', flexWrap: 'wrap' }}>
                <span>ID: <strong>{farmer.id}</strong></span>
                <span>Phone: <strong>{farmer.phone}</strong></span>
                <span>Aadhaar: <strong>{maskAadhaar(farmer.aadhaarMasked)}</strong></span>
                <span>Branch: <strong>{farmer.assignedBranch}</strong></span>
              </div>
            </div>
          </div>

          <div>
            <button className="btn btn-primary btn-sm" onClick={() => onOpenNewLoan(farmer.id)}>
              <PlusCircle size={15} />
              Create Loan for Farmer
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', overflowX: 'auto' }}>
          {[
            { id: 'overview', label: 'Land & Household Profile' },
            { id: 'loans', label: `Loans (${farmerLoans.length})` },
            { id: 'repayments', label: `Repayment Ledger (${farmerRepayments.length})` },
            { id: 'docs', label: `Document Vault (${farmerDocs.length})` },
            { id: 'timeline', label: `Communications & Timeline (${farmerComms.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.8125rem',
                fontWeight: activeTab === tab.id ? 600 : 500,
                color: activeTab === tab.id ? '#15803d' : '#64748b',
                borderBottom: activeTab === tab.id ? '2px solid #15803d' : '2px solid transparent',
                background: 'none',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div style={{ backgroundColor: resilience.badgeBg, border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: resilience.badgeColor, color: '#fff', width: '38px', height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
              {resilience.score}
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                Farmer Resilience Score: {resilience.score}/100 • {resilience.category}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                Transparent climate & debt buffer score. No black-box automated decisions.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: resilience.badgeColor, backgroundColor: '#fff', padding: '0.25rem 0.625rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
              Consent: {farmer.consentRecorded ? 'Verified ✓' : 'Pending'}
            </span>
          </div>
        </div>
      )}

      {/* Main Overview Grid */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wheat size={18} color="#15803d" />
              Landholding & Agricultural Profile
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Total Operational Land:</span>
                <span style={{ fontWeight: 600 }}>{farmer.landSize} Acres</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Irrigation Type:</span>
                <span style={{ fontWeight: 600 }}>{farmer.landType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Primary Crop:</span>
                <span style={{ fontWeight: 600, color: '#15803d' }}>{farmer.primaryCrop}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Secondary Crop / Intercrop:</span>
                <span style={{ fontWeight: 600 }}>{farmer.secondaryCrop || 'None'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Village & Taluk:</span>
                <span style={{ fontWeight: 600 }}>{farmer.village}, {farmer.district}</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IndianRupee size={18} color="#1e3a8a" />
              Household Economics & Debt Capacity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Annual Crop Farm Income:</span>
                <span style={{ fontWeight: 600 }}>{formatINR(farmer.annualIncome)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Allied Animal Husbandry / Dairy:</span>
                <span style={{ fontWeight: 600, color: '#15803d' }}>{formatINR(farmer.alliedIncome)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Prior External Debt Burden:</span>
                <span style={{ fontWeight: 600, color: farmer.existingLoanBurden > 0 ? '#b91c1c' : '#475569' }}>
                  {formatINR(farmer.existingLoanBurden)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Assigned Field Officer:</span>
                <span style={{ fontWeight: 600 }}>Ramesh Kumar (ARO - Staff #ST-101)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Registration Date:</span>
                <span style={{ fontWeight: 600 }}>{farmer.registeredDate}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Loans */}
      {activeTab === 'loans' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
            Associated Agricultural Loans
          </h3>
          {farmerLoans.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.8125rem', textAlign: 'center', padding: '2rem' }}>
              No loan applications found for this farmer yet.
            </p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Loan ID</th>
                    <th>Loan Type</th>
                    <th>Sanctioned Amount</th>
                    <th>Harvest / Due Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {farmerLoans.map(loan => (
                    <tr key={loan.id}>
                      <td style={{ fontWeight: 600, color: '#1e3a8a' }}>{loan.id}</td>
                      <td>{loan.loanType}</td>
                      <td style={{ fontWeight: 600 }}>{formatINR(loan.sanctionedAmount || loan.appliedAmount)}</td>
                      <td>{loan.harvestDate}</td>
                      <td><StatusBadge status={loan.status} /></td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onNavigateToLoan(loan.id)}
                        >
                          View Application Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Repayments */}
      {activeTab === 'repayments' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
            Repayment Schedule & Realization
          </h3>
          {farmerRepayments.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.8125rem', textAlign: 'center', padding: '2rem' }}>
              No active repayment schedules logged.
            </p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Schedule ID</th>
                    <th>Linked Loan</th>
                    <th>Due Date</th>
                    <th>Amount Due</th>
                    <th>Amount Paid</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {farmerRepayments.map(rep => (
                    <tr key={rep.id}>
                      <td style={{ fontWeight: 600 }}>{rep.id}</td>
                      <td>{rep.loanId}</td>
                      <td>{rep.dueDate}</td>
                      <td style={{ fontWeight: 600 }}>{formatINR(rep.amountDue)}</td>
                      <td style={{ fontWeight: 600, color: '#15803d' }}>{formatINR(rep.amountPaid)}</td>
                      <td><StatusBadge status={rep.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Documents */}
      {activeTab === 'docs' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
            Verified Land & Identity Documents
          </h3>
          {farmerDocs.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.8125rem', textAlign: 'center', padding: '2rem' }}>
              No documents uploaded for this profile yet.
            </p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Document Type</th>
                    <th>File Name</th>
                    <th>Status</th>
                    <th>Verified By</th>
                  </tr>
                </thead>
                <tbody>
                  {farmerDocs.map(doc => (
                    <tr key={doc.id}>
                      <td style={{ fontWeight: 500 }}>{doc.type}</td>
                      <td style={{ color: '#64748b' }}>{doc.fileName || 'Not uploaded'}</td>
                      <td><StatusBadge status={doc.status} /></td>
                      <td>{doc.verifiedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Communications & Activity Timeline */}
      {activeTab === 'timeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* New Communication Entry Form */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.75rem' }}>
              Log Demo Communication or Field Follow-up
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCommMsg.trim()) return;
                const newEntry = {
                  id: `COM-${Date.now()}`,
                  farmerId: farmer.id,
                  type: newCommType,
                  category: newCommCategory,
                  message: newCommMsg,
                  sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
                  channel: newCommType === 'SMS' ? 'Automated SMS' : newCommType === 'Visit' ? 'Field App' : 'Branch Officer Call',
                  status: 'Logged'
                };
                if (onAddCommunication) onAddCommunication(newEntry);
                setNewCommMsg('');
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    Communication Mode
                  </label>
                  <select
                    value={newCommType}
                    onChange={(e) => setNewCommType(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="Call">Phone Call</option>
                    <option value="SMS">SMS Notice</option>
                    <option value="Visit">Physical Field Visit</option>
                    <option value="Branch">Branch Visit by Farmer</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    Activity Category
                  </label>
                  <select
                    value={newCommCategory}
                    onChange={(e) => setNewCommCategory(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="Follow-up Call">Follow-up Call</option>
                    <option value="Repayment Reminder">Repayment Reminder</option>
                    <option value="Document Request">Document Request</option>
                    <option value="Weather / Harvest Advisory">Weather / Harvest Advisory</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                  Interaction Summary Notes *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Record summary of conversation with farmer..."
                  value={newCommMsg}
                  onChange={(e) => setNewCommMsg(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary btn-sm">
                  <Send size={13} />
                  Post Activity to Timeline
                </button>
              </div>
            </form>
          </div>

          {/* Timeline Feed */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
              Historical Communications & Lifecycle Events
            </h3>

            {farmerComms.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.8125rem', textAlign: 'center', padding: '2rem' }}>
                No communication history recorded for this farmer.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {farmerComms.map((comm) => (
                  <div
                    key={comm.id}
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      padding: '0.875rem',
                      borderRadius: '0.375rem',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ padding: '0.4rem', borderRadius: '50%', backgroundColor: '#e0f2fe', color: '#0369a1', height: 'fit-content' }}>
                      <Clock size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#0f172a' }}>
                            {comm.category}
                          </span>
                          <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', backgroundColor: '#e2e8f0', color: '#334155' }}>
                            {comm.type} • {comm.channel}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{comm.sentAt}</span>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.4 }}>
                        {comm.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
