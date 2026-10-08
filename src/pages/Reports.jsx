import React, { useState } from 'react';
import { BarChart3, Download, FileSpreadsheet, Printer, Filter, CheckCircle2, IndianRupee, Layers, CheckSquare, Clock } from 'lucide-react';
import { formatINR, maskAadhaar, formatDate } from '../data/mockStore';

export default function Reports({ loans = [], farmers = [], repayments = [], branches = [] }) {
  const [reportType, setReportType] = useState('portfolio'); // 'portfolio', 'repayment', 'farmer'
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [cropFilter, setCropFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [downloadNotice, setDownloadNotice] = useState(null);

  // Dynamic filter lists
  const crops = Array.from(new Set(farmers.map(f => f.primaryCrop)));

  // Filtered dataset
  const filteredLoans = loans.filter(l => {
    const matchBranch = branchFilter === 'ALL' || l.branchId === branchFilter;
    const matchCrop = cropFilter === 'ALL' || l.crop.toLowerCase().includes(cropFilter.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchBranch && matchCrop && matchStatus;
  });

  const filteredFarmers = farmers.filter(f => {
    const matchBranch = branchFilter === 'ALL' || f.assignedBranch === branchFilter;
    const matchCrop = cropFilter === 'ALL' || f.primaryCrop === cropFilter;
    const matchStatus = statusFilter === 'ALL' || f.documentStatus === statusFilter;
    return matchBranch && matchCrop && matchStatus;
  });

  const filteredRepayments = repayments.filter(r => {
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchStatus;
  });

  // Summary Metrics
  const totalApps = filteredLoans.length;
  const approvedCount = filteredLoans.filter(l => l.status === 'Approved' || l.status === 'Disbursed').length;
  const disbursedAmt = filteredLoans
    .filter(l => l.status === 'Disbursed')
    .reduce((sum, l) => sum + (l.sanctionedAmount || l.appliedAmount), 0);
  const overdueCount = repayments.filter(r => r.status === 'Overdue').length;
  const totalDue = repayments.reduce((s, r) => s + r.amountDue, 0);
  const totalPaid = repayments.reduce((s, r) => s + r.amountPaid, 0);
  const collectionRate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    if (reportType === 'portfolio') {
      csvContent += "Loan ID,Farmer Name,Branch,Product,Crop,Acreage,Applied Amount,Sanctioned Amount,Status,Harvest Date\n";
      filteredLoans.forEach(l => {
        csvContent += `"${l.id}","${l.farmerName}","${l.branchId}","${l.loanType}","${l.crop}",${l.landAcreage},${l.appliedAmount},${l.sanctionedAmount},"${l.status}","${l.harvestDate}"\n`;
      });
    } else if (reportType === 'repayment') {
      csvContent += "Schedule ID,Loan ID,Farmer Name,Due Date,Amount Due,Amount Paid,Status,Season\n";
      filteredRepayments.forEach(r => {
        csvContent += `"${r.id}","${r.loanId}","${r.farmerName}","${r.dueDate}",${r.amountDue},${r.amountPaid},"${r.status}","${r.cropSeason}"\n`;
      });
    } else {
      csvContent += "Farmer ID,Name,Phone,Masked Aadhaar,Village,District,Acreage,Primary Crop,Annual Income,Document Status\n";
      filteredFarmers.forEach(f => {
        csvContent += `"${f.id}","${f.name}","${f.phone}","${maskAadhaar(f.aadhaarMasked)}","${f.village}","${f.district}",${f.landSize},"${f.primaryCrop}",${f.annualIncome},"${f.documentStatus}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AgriSahay_${reportType}_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadNotice(`CSV Export generated successfully for ${reportType.toUpperCase()} report with privacy-masked Aadhaar.`);
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Toast Notice */}
      {downloadNotice && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '0.375rem', padding: '0.75rem 1rem', fontSize: '0.8125rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} />
          {downloadNotice}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
            Agricultural Portfolio Reports & MIS Exports
          </h1>
          <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            Comprehensive reporting for Priority Sector Lending (PSL) compliance and recovery monitoring
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={15} />
            Print / Save PDF
          </button>
          <button className="btn btn-primary" onClick={handleExportCSV}>
            <FileSpreadsheet size={15} />
            Export to Excel / CSV
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Filtered Applications</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>
            {totalApps}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#15803d' }}>{approvedCount} Sanctioned</span>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Portfolio Disbursed</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#15803d', marginTop: '0.25rem' }}>
            {formatINR(disbursedAmt)}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Active deployed capital</span>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Overdue Accounts</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#dc2626', marginTop: '0.25rem' }}>
            {overdueCount}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#dc2626' }}>Requires field follow-up</span>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Collection Realization</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e3a8a', marginTop: '0.25rem' }}>
            {collectionRate}%
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{formatINR(totalPaid)} realized</span>
        </div>
      </div>

      {/* Filter Options */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Select Report:</span>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="portfolio">Agri-Loan Portfolio & Sanctions</option>
              <option value="repayment">Harvest Repayment & Recovery Collection</option>
              <option value="farmer">Farmer Registrations & Land Base</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Branch:</span>
            <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
              <option value="ALL">All Branches (Consolidated)</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Crop:</span>
            <select value={cropFilter} onChange={(e) => setCropFilter(e.target.value)}>
              <option value="ALL">All Crops</option>
              {crops.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Status:</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="Disbursed">Disbursed</option>
              <option value="Approved">Approved</option>
              <option value="Under Review">Under Review</option>
              <option value="Submitted">Submitted</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
              <option value="Verified">Verified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Table View */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a' }}>
            {reportType === 'portfolio' ? 'Loan Origination & Sanctions Portfolio' : reportType === 'repayment' ? 'Harvest Collection & Recovery Realization' : 'Registered Farmers & Landholding Registry'}
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Generated on {new Date().toLocaleDateString('en-IN')}
          </span>
        </div>

        <div className="table-container">
          {reportType === 'portfolio' && (
            <table>
              <thead>
                <tr>
                  <th>Loan ID</th>
                  <th>Borrower Farmer</th>
                  <th>Product Type</th>
                  <th>Crop</th>
                  <th>Acreage</th>
                  <th>Applied</th>
                  <th>Sanctioned</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600, color: '#1e3a8a' }}>{l.id}</td>
                    <td>{l.farmerName}</td>
                    <td>{l.loanType}</td>
                    <td>{l.crop}</td>
                    <td>{l.landAcreage} Ac</td>
                    <td>{formatINR(l.appliedAmount)}</td>
                    <td style={{ fontWeight: 600, color: '#15803d' }}>{formatINR(l.sanctionedAmount || l.appliedAmount)}</td>
                    <td>{l.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'repayment' && (
            <table>
              <thead>
                <tr>
                  <th>Schedule ID</th>
                  <th>Loan ID</th>
                  <th>Farmer</th>
                  <th>Harvest Cycle</th>
                  <th>Due Date</th>
                  <th>Amount Due</th>
                  <th>Amount Realized</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {repayments.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.id}</td>
                    <td style={{ color: '#1e3a8a' }}>{r.loanId}</td>
                    <td>{r.farmerName}</td>
                    <td>{r.cropSeason}</td>
                    <td>{formatDate(r.dueDate)}</td>
                    <td style={{ fontWeight: 600 }}>{formatINR(r.amountDue)}</td>
                    <td style={{ fontWeight: 600, color: '#15803d' }}>{formatINR(r.amountPaid)}</td>
                    <td>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'farmer' && (
            <table>
              <thead>
                <tr>
                  <th>Farmer ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Village / District</th>
                  <th>Landholding</th>
                  <th>Primary Crop</th>
                  <th>Annual Income</th>
                  <th>KYC Status</th>
                </tr>
              </thead>
              <tbody>
                {farmers.map(f => (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 600, color: '#1e3a8a' }}>{f.id}</td>
                    <td>{f.name}</td>
                    <td>{f.phone}</td>
                    <td>{f.village}, {f.district}</td>
                    <td>{f.landSize} Acres</td>
                    <td>{f.primaryCrop}</td>
                    <td>{formatINR(f.annualIncome)}</td>
                    <td>{f.documentStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
