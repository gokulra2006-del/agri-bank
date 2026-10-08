import React, { useState } from 'react';
import { FolderOpen, Upload, CheckCircle2, Clock, AlertTriangle, FileText, Search, PlusCircle, X } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ConfirmationModal from '../components/ConfirmationModal';

export default function Documents({ documents = [], farmers = [], onUpdateDocuments }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState(null);

  const [newDocData, setNewDocData] = useState({
    farmerId: farmers[0]?.id || '',
    type: 'Land Record (RTC / 7-12 Extract)',
    fileName: 'Land_RTC_Record.pdf'
  });

  const filtered = documents.filter(d => {
    const farmer = farmers.find(f => f.id === d.farmerId);
    const farmerName = farmer ? farmer.name.toLowerCase() : '';
    const matchSearch =
      (d.fileName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmerName.includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSimulatedUpload = (e) => {
    e.preventDefault();
    const docId = `DOC-${Math.floor(110 + documents.length + 1)}`;
    const newDoc = {
      id: docId,
      farmerId: newDocData.farmerId,
      loanId: 'LN-2025-081',
      type: newDocData.type,
      status: 'Under Verification',
      fileName: newDocData.fileName,
      uploadDate: new Date().toISOString().split('T')[0],
      verifiedBy: 'Pending'
    };

    onUpdateDocuments([...documents, newDoc]);
    setIsUploadModalOpen(false);
  };

  const handleConfirmVerification = () => {
    if (!verifyTarget) return;
    const updated = documents.map(d =>
      d.id === verifyTarget.id
        ? { ...d, status: 'Verified', verifiedBy: 'Gokul Sharma (Credit Officer)' }
        : d
    );
    onUpdateDocuments(updated);
    setVerifyTarget(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Digital Document Wallet Banner */}
      <div style={{ padding: '0.875rem 1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem', color: '#166534' }}>
        <CheckCircle2 size={18} color="#15803d" />
        <div>
          <strong>Digital Farmer Document Wallet:</strong> Simulated wallet metadata view. No actual files or PII are stored on external servers. Access is restricted under farmer consent.
        </div>
      </div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
            Documents Vault & KYC Verification
          </h1>
          <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            Verification of Land RTC / 7-12 Extracts, e-KYC Aadhaar records, and PMFBY policy receipts
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsUploadModalOpen(true)}>
          <Upload size={16} />
          Simulate Document Upload
        </button>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search file name, type, farmer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.25rem', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Verification Status:</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Documents</option>
              <option value="Verified">Verified</option>
              <option value="Under Verification">Under Verification</option>
              <option value="Missing">Missing</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Doc ID & Type</th>
                <th>Farmer Borrower</th>
                <th>File Name</th>
                <th>Upload Date</th>
                <th>Verification Status</th>
                <th>Verified By</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No matching documents found.
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => {
                  const farmer = farmers.find(f => f.id === doc.farmerId);
                  return (
                    <tr key={doc.id}>
                      <td>
                        <span style={{ fontWeight: 600, color: '#1e3a8a', display: 'block' }}>{doc.id}</span>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{doc.type}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500, display: 'block' }}>{farmer ? farmer.name : doc.farmerId}</span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{doc.farmerId}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', color: doc.fileName ? '#0f172a' : '#dc2626' }}>
                          {doc.fileName || 'Not yet uploaded'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>{doc.uploadDate || '-'}</span>
                      </td>
                      <td>
                        <StatusBadge status={doc.status} />
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', color: '#475569' }}>{doc.verifiedBy}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {doc.status !== 'Verified' && doc.fileName && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setVerifyTarget(doc)}
                          >
                            Mark Verified
                          </button>
                        )}
                        {doc.status === 'Verified' && (
                          <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>
                            Audit Cleared
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulated Upload Modal */}
      {isUploadModalOpen && (
        <div className="modal-overlay" onClick={() => setIsUploadModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>
                Simulate KYC / Land Record Upload
              </h3>
              <button onClick={() => setIsUploadModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSimulatedUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                  Farmer Account
                </label>
                <select
                  value={newDocData.farmerId}
                  onChange={(e) => setNewDocData({ ...newDocData, farmerId: e.target.value })}
                  style={{ width: '100%' }}
                >
                  {farmers.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                  Document Category
                </label>
                <select
                  value={newDocData.type}
                  onChange={(e) => setNewDocData({ ...newDocData, type: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="Land Record (RTC / 7-12 Extract)">Land Record (RTC / 7-12 Extract)</option>
                  <option value="Aadhaar Card (e-KYC)">Aadhaar Card (e-KYC)</option>
                  <option value="PMFBY Crop Insurance Policy">PMFBY Crop Insurance Policy</option>
                  <option value="Bank Statement / No-Objection Certificate">Bank Statement / No-Objection Certificate</option>
                  <option value="Crop Sowing Certificate">Crop Sowing Certificate</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                  Simulated File Name
                </label>
                <input
                  type="text"
                  value={newDocData.fileName}
                  onChange={(e) => setNewDocData({ ...newDocData, fileName: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsUploadModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Simulate Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verification Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(verifyTarget)}
        title="Approve Document Verification"
        message={`Confirm verification for "${verifyTarget?.type}" uploaded for ${verifyTarget?.fileName}?`}
        details="This clears the audit requirement for legal title scrutiny."
        confirmVariant="primary"
        confirmLabel="Verify Document"
        onClose={() => setVerifyTarget(null)}
        onConfirm={handleConfirmVerification}
      />
    </div>
  );
}
