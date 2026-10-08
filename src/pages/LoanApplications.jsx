import React, { useState } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  Eye,
  FileText,
  Calendar,
  Wheat,
  IndianRupee,
  ShieldAlert,
  X
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { calculateAgriEligibility, formatINR } from '../data/mockStore';

export default function LoanApplications({
  loans = [],
  farmers = [],
  onSelectLoan,
  onAddLoan,
  initialFarmerId = null
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Loan Form State
  const [formData, setFormData] = useState({
    farmerId: initialFarmerId || (farmers[0]?.id || ''),
    loanType: 'Crop Production (KCC)',
    appliedAmount: 120000,
    purpose: 'Crop seasonal inputs (Seeds, fertilizer, drip maintenance)',
    crop: 'Paddy',
    landAcreage: 2.5,
    harvestDate: '2026-03-31',
    sowingDate: '2025-10-01',
    tenureMonths: 12,
    repaymentScheduleType: 'Bullet / Post-Harvest Lump Sum',
    interestRate: 7.0,
    remarks: 'Field inquiry completed by Agri Relationship Officer.'
  });

  const statuses = ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Disbursed'];

  const filtered = loans.filter(l => {
    const matchSearch =
      l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.crop.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleFarmerChange = (fid) => {
    const found = farmers.find(f => f.id === fid);
    if (found) {
      setFormData(prev => ({
        ...prev,
        farmerId: fid,
        crop: found.primaryCrop,
        landAcreage: found.landSize
      }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const farmer = farmers.find(f => f.id === formData.farmerId);
    if (!farmer) {
      alert('Please select a valid registered farmer.');
      return;
    }

    const assessment = calculateAgriEligibility({
      landSize: formData.landAcreage,
      crop: formData.crop,
      annualIncome: farmer.annualIncome,
      alliedIncome: farmer.alliedIncome,
      existingLoanBurden: farmer.existingLoanBurden
    });

    const newLoan = {
      ...formData,
      id: `LN-2025-${Math.floor(140 + loans.length + 1)}`,
      farmerName: farmer.name,
      branchId: farmer.assignedBranch,
      appliedAmount: Number(formData.appliedAmount),
      sanctionedAmount: 0,
      appliedDate: new Date().toISOString().split('T')[0],
      approvedDate: null,
      disbursedDate: null,
      status: 'Submitted',
      riskScore: assessment.riskCategory,
      scaleOfFinanceRecommended: assessment.rawEligibleAmount,
      disbursedAccount: ''
    };

    onAddLoan(newLoan);
    setIsModalOpen(false);
  };

  // Inline preview calculation for the modal
  const selectedFarmerObj = farmers.find(f => f.id === formData.farmerId);
  const liveEligibility = selectedFarmerObj
    ? calculateAgriEligibility({
        landSize: formData.landAcreage,
        crop: formData.crop,
        annualIncome: selectedFarmerObj.annualIncome,
        alliedIncome: selectedFarmerObj.alliedIncome,
        existingLoanBurden: selectedFarmerObj.existingLoanBurden
      })
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
            Agricultural Loan Origination & Applications
          </h1>
          <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            End-to-end processing pipeline from Draft to Disbursement with harvest-aligned underwriting
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (farmers.length === 0) {
              alert('Please register at least one farmer first.');
              return;
            }
            setIsModalOpen(true);
          }}
        >
          <PlusCircle size={16} />
          Create New Application
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by Loan ID, Farmer, Crop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.25rem', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Filter Status:</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses ({loans.length})</option>
              {statuses.map(st => (
                <option key={st} value={st}>
                  {st} ({loans.filter(l => l.status === st).length})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loans Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Loan Ref & Date</th>
                <th>Farmer</th>
                <th>Product Type</th>
                <th>Crop & Acreage</th>
                <th>Applied Amount</th>
                <th>Harvest Due Date</th>
                <th>Risk Profile</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No agricultural loan applications found.
                  </td>
                </tr>
              ) : (
                filtered.map((loan) => (
                  <tr key={loan.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: '#1e3a8a', display: 'block' }}>{loan.id}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{loan.appliedDate}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, color: '#0f172a', display: 'block' }}>{loan.farmerName}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{loan.farmerId}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem' }}>{loan.loanType}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, display: 'block' }}>{loan.crop}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{loan.landAcreage} Acres</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{formatINR(loan.appliedAmount)}</span>
                      {loan.sanctionedAmount > 0 && loan.sanctionedAmount !== loan.appliedAmount && (
                        <span style={{ fontSize: '0.7rem', color: '#15803d', display: 'block' }}>
                          Sanctioned: {formatINR(loan.sanctionedAmount)}
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: '#334155' }}>{loan.harvestDate}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>{loan.repaymentScheduleType}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: loan.riskScore === 'Low Risk' ? '#15803d' : loan.riskScore === 'Medium Risk' ? '#b45309' : '#b91c1c'
                        }}
                      >
                        {loan.riskScore}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={loan.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onSelectLoan(loan.id)}
                        title="View Detailed Application & Workflow"
                      >
                        <Eye size={14} />
                        Review / Action
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Loan Application Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '42rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>
                  New Agricultural Loan Application
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Scale of Finance assessment will be automatically computed
                </span>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    Select Farmer Borrower *
                  </label>
                  <select
                    value={formData.farmerId}
                    onChange={(e) => handleFarmerChange(e.target.value)}
                    style={{ width: '100%' }}
                    required
                  >
                    {farmers.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.id}) - {f.village}, {f.district}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    Loan Product Scheme *
                  </label>
                  <select
                    value={formData.loanType}
                    onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="Crop Production (KCC)">Crop Production (KCC - Kisan Credit Card)</option>
                    <option value="Agricultural Term Loan (Equipment/Pump)">Agricultural Term Loan (Equipment/Pump)</option>
                    <option value="Farm Modernization & Horticulture">Farm Modernization & Horticulture</option>
                    <option value="Allied Agri (Dairy & Veggies)">Allied Agri (Dairy & Veggies)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    Applied Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.appliedAmount}
                    onChange={(e) => setFormData({ ...formData, appliedAmount: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    Crop Cultivated
                  </label>
                  <select
                    value={formData.crop}
                    onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="Paddy">Paddy (Rice)</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Sugarcane">Sugarcane</option>
                    <option value="Vegetables & Tomato">Vegetables & Tomato</option>
                    <option value="Pulses">Pulses</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    Acreage Cultivated
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.landAcreage}
                    onChange={(e) => setFormData({ ...formData, landAcreage: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    Expected Harvest Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.harvestDate}
                    onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    Repayment Structure
                  </label>
                  <select
                    value={formData.repaymentScheduleType}
                    onChange={(e) => setFormData({ ...formData, repaymentScheduleType: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="Bullet / Post-Harvest Lump Sum">Bullet / Post-Harvest Lump Sum</option>
                    <option value="Bi-Annual (Post-Harvest)">Bi-Annual (Post-Harvest)</option>
                    <option value="Quarterly Seasonal">Quarterly Seasonal</option>
                    <option value="Monthly Allied EMI">Monthly Allied EMI</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    Interest Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                  Purpose of Credit
                </label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Instant Rule Engine Preview Box */}
              {liveEligibility && (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.375rem', padding: '0.75rem', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: '#15803d' }}>Scale of Finance Benchmark:</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatINR(liveEligibility.rawEligibleAmount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#475569' }}>Calculated Risk Tier:</span>
                    <span style={{ fontWeight: 600, color: liveEligibility.riskColor === 'green' ? '#15803d' : '#b45309' }}>
                      {liveEligibility.riskCategory}
                    </span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Loan Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
