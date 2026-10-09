import React, { useState } from 'react';
import {
  Search,
  Filter,
  UserPlus,
  Eye,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  FileCheck2,
  AlertTriangle,
  X
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ConfirmationModal from '../components/ConfirmationModal';
import { formatINR, formatDate } from '../data/mockStore';
import { calculateResilienceScore } from '../utils/resilienceEngine';
import { useTranslation } from '../context/LanguageContext';

export default function Farmers({
  farmers = [],
  onAddFarmer,
  onUpdateFarmer,
  onDeleteFarmer,
  onSelectFarmer,
  currentRole = 'manager'
}) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setPage] = useState(1);
  const itemsPerPage = 5;

  // Add/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState(null);
  const [formError, setFormError] = useState(null);

  // Delete modal state
  const [deleteModalTarget, setDeleteModalTarget] = useState(null);

  // Form inputs state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    village: '',
    district: 'Mandya',
    state: 'Karnataka',
    landSize: 2.5,
    landType: 'Irrigated Canal',
    primaryCrop: 'Paddy',
    secondaryCrop: 'Ragi',
    annualIncome: 250000,
    alliedIncome: 30000,
    existingLoanBurden: 0,
    documentStatus: 'Verified',
    assignedBranch: 'BR-01'
  });

  const crops = Array.from(new Set(farmers.map(f => f.primaryCrop)));
  const districts = Array.from(new Set(farmers.map(f => f.district)));

  // Filter & Search Logic
  const filtered = farmers.filter(f => {
    const matchSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.phone.includes(searchTerm) ||
      f.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCrop = selectedCrop === 'ALL' || f.primaryCrop === selectedCrop;
    const matchDistrict = selectedDistrict === 'ALL' || f.district === selectedDistrict;
    return matchSearch && matchCrop && matchDistrict;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'land') return b.landSize - a.landSize;
    if (sortBy === 'income') return b.annualIncome - a.annualIncome;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openAddModal = () => {
    setEditingFarmer(null);
    setFormError(null);
    setFormData({
      name: '',
      phone: '+91 ',
      village: '',
      district: 'Mandya',
      state: 'Karnataka',
      landSize: 2.5,
      landType: 'Irrigated Canal',
      primaryCrop: 'Paddy',
      secondaryCrop: 'Pulses',
      annualIncome: 250000,
      alliedIncome: 30000,
      existingLoanBurden: 0,
      documentStatus: 'Pending Verification',
      assignedBranch: 'BR-01'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (farmer) => {
    setEditingFarmer(farmer);
    setFormError(null);
    setFormData({ ...farmer });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.name.trim() || !formData.phone.trim()) {
      setFormError('Please fill out the farmer name and contact phone number.');
      return;
    }

    const cleanPhone = formData.phone.trim().replace(/[\s\-\+]/g, '');
    if (cleanPhone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Duplicate farmer validation: check if phone already exists
    const duplicate = farmers.find(f => {
      const existingClean = (f.phone || '').trim().replace(/[\s\-\+]/g, '');
      return existingClean.endsWith(cleanPhone.slice(-10)) && (!editingFarmer || f.id !== editingFarmer.id);
    });

    if (duplicate) {
      setFormError(`A farmer with this mobile number is already registered: ${duplicate.name} (${duplicate.id}, ${duplicate.village}).`);
      return;
    }

    if (editingFarmer) {
      onUpdateFarmer({
        ...editingFarmer,
        ...formData,
        landSize: Number(formData.landSize),
        annualIncome: Number(formData.annualIncome),
        alliedIncome: Number(formData.alliedIncome),
        existingLoanBurden: Number(formData.existingLoanBurden)
      });
    } else {
      const nextNum = farmers.length + 1;
      const newFarmer = {
        ...formData,
        id: `FAR-${String(nextNum).padStart(3, '0')}`,
        aadhaarMasked: 'XXXX-XXXX-' + Math.floor(1000 + Math.random() * 9000),
        registeredDate: new Date().toISOString().split('T')[0],
        landSize: Number(formData.landSize),
        annualIncome: Number(formData.annualIncome),
        alliedIncome: Number(formData.alliedIncome),
        existingLoanBurden: Number(formData.existingLoanBurden),
        rating: 'A (Low Risk)',
        assignedOfficer: 'ST-101'
      };
      onAddFarmer(newFarmer);
    }
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
            {t('farmers.title')}
          </h1>
          <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            {t('farmers.subtitle')}
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <UserPlus size={16} />
          {t('farmers.registerBtn')}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', flex: 1, minWidth: '280px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder={t('farmers.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                style={{ paddingLeft: '2.25rem', width: '100%' }}
              />
            </div>

            <select
              value={selectedCrop}
              onChange={(e) => {
                setSelectedCrop(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">{t('common.all')} {t('common.crop')}</option>
              {crops.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">{t('common.all')} {t('common.district')}</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{t('farmers.sortBy')}:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">{t('farmers.sortName')}</option>
              <option value="land">{t('farmers.sortLand')}</option>
              <option value="income">{t('farmers.sortIncome')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Farmers Table / Responsive Cards */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('farmers.colName')}</th>
                <th>{t('farmers.colVillage')}</th>
                <th>{t('farmers.colCrops')}</th>
                <th>{t('farmers.colResilience')}</th>
                <th>{t('farmers.colIncome')}</th>
                <th>{t('farmers.colStatus')}</th>
                <th style={{ textAlign: 'right' }}>{t('farmers.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No matching farmers found.
                  </td>
                </tr>
              ) : (
                paginated.map((farmer) => {
                  const res = calculateResilienceScore(farmer);
                  return (
                    <tr key={farmer.id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span
                            onClick={() => onSelectFarmer(farmer.id)}
                            style={{ fontWeight: 600, color: '#1e3a8a', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            {farmer.name}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{farmer.id} • {farmer.phone}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem' }}>
                          <MapPin size={13} color="#64748b" />
                          <span>{farmer.village}, {farmer.district}</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{farmer.state}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500, display: 'block' }}>{farmer.primaryCrop}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{farmer.landSize} Acres ({farmer.landType})</span>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: res.badgeBg,
                            color: res.badgeColor,
                            border: `1px solid ${res.badgeColor}33`
                          }}
                          title={res.category}
                        >
                          {res.score}/100
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{formatINR(farmer.annualIncome)}</span>
                        {farmer.alliedIncome > 0 && (
                          <span style={{ fontSize: '0.7rem', color: '#15803d', display: 'block' }}>
                            +{formatINR(farmer.alliedIncome)} allied
                          </span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={farmer.documentStatus} />
                      </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: '#475569' }}>{farmer.assignedBranch}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onSelectFarmer(farmer.id)}
                          title={t('farmers.viewProfile')}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(farmer)}
                          title={t('farmers.editFarmer')}
                        >
                          <Edit2 size={14} />
                        </button>
                        {currentRole !== 'officer' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#dc2626' }}
                            onClick={() => setDeleteModalTarget(farmer)}
                            title={t('farmers.deleteFarmer')}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {t('common.showingCount', { count: paginated.length })} ({filtered.length} total)
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              {t('common.back')}
            </button>
            <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', padding: '0 0.5rem' }}>
              {currentPage} / {totalPages}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Farmer Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '38rem', padding: '1.5rem' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="farmer-modal-heading"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h3 id="farmer-modal-heading" style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>
                {editingFarmer ? 'Edit Farmer Profile' : 'Register New Agricultural Borrower'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div
                style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '0.375rem',
                  padding: '0.625rem 0.875rem',
                  color: '#b91c1c',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem'
                }}
                role="alert"
                aria-live="polite"
              >
                <AlertTriangle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '0.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Basavarajappa H."
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    Mobile Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98451 00000"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    Village
                  </label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    placeholder="Keragodu"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    District
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    Landholding (Acres) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={formData.landSize}
                    onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    Irrigation / Land Type
                  </label>
                  <select
                    value={formData.landType}
                    onChange={(e) => setFormData({ ...formData, landType: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="Irrigated Canal">Irrigated Canal</option>
                    <option value="Borewell Irrigated">Borewell Irrigated</option>
                    <option value="Drip Irrigated">Drip Irrigated</option>
                    <option value="Rainfed">Rainfed</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    Primary Crop
                  </label>
                  <select
                    value={formData.primaryCrop}
                    onChange={(e) => setFormData({ ...formData, primaryCrop: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="Sugarcane">Sugarcane</option>
                    <option value="Paddy">Paddy (Rice)</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Grapes / Horticulture">Grapes / Horticulture</option>
                    <option value="Chilli">Chilli</option>
                    <option value="Tomato & Vegetables">Tomato & Vegetables</option>
                    <option value="Pulses">Pulses</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    Annual Farm Income (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.annualIncome}
                    onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    Allied Income (₹ Dairy/Poultry)
                  </label>
                  <input
                    type="number"
                    value={formData.alliedIncome}
                    onChange={(e) => setFormData({ ...formData, alliedIncome: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    Existing Loan Liabilities (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.existingLoanBurden}
                    onChange={(e) => setFormData({ ...formData, existingLoanBurden: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingFarmer ? t('common.save') : t('farmers.registerBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={Boolean(deleteModalTarget)}
        title={t('farmers.modalDeleteTitle')}
        message={t('farmers.modalDeleteConfirm', { farmerName: deleteModalTarget?.name || '', farmerId: deleteModalTarget?.id || '' })}
        details="This will also cascade remove linked demo records from this session. Immutable audit log will record this event."
        confirmVariant="danger"
        confirmLabel={t('common.delete')}
        onClose={() => setDeleteModalTarget(null)}
        onConfirm={() => {
          if (deleteModalTarget) {
            onDeleteFarmer(deleteModalTarget.id);
            setDeleteModalTarget(null);
          }
        }}
      />
    </div>
  );
}
