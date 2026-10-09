import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PlusCircle,
  FileText,
  User,
  ShieldCheck,
  Send,
  X,
  Search,
  Check,
  Sparkles,
  Wand2
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import OfflineSyncBadge from '../components/OfflineSyncBadge';
import ConfirmationModal from '../components/ConfirmationModal';
import { logAudit } from '../utils/audit';
import { saveOfflineQueue, getOfflineQueue } from '../data/mockStore';
import { extractSmartVisitNotes } from '../utils/climatePlatformUtils';
import { useTranslation } from '../context/LanguageContext';

export default function FieldOfficerMode({
  visits = [],
  farmers = [],
  onUpdateVisits,
  onAddVisit,
  onOpenNewFarmer,
  isOfflineMode,
  onToggleOffline
}) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeModalVisit, setActiveModalVisit] = useState(null); // for editing/completing visit notes
  const [isNewVisitModalOpen, setIsNewVisitModalOpen] = useState(false);

  // New Visit Form State
  const [newVisitData, setNewVisitData] = useState({
    farmerId: farmers[0]?.id || '',
    purpose: 'Crop emergence and field verification',
    scheduledDate: new Date().toISOString().split('T')[0],
    cropCondition: 'Good / Healthy Growth',
    irrigationCondition: 'Adequate Canal/Borewell Water',
    notes: ''
  });

  // Complete Visit Form State
  const [visitNotesInput, setVisitNotesInput] = useState('');
  const [cropConditionInput, setCropConditionInput] = useState('Good / Healthy Growth');
  const [irrigationInput, setIrrigationInput] = useState('Adequate Canal Flow');
  const [rtcVerified, setRtcVerified] = useState(true);
  const [cropPhotoTaken, setCropPhotoTaken] = useState(true);
  const [neighborInquiryDone, setNeighborInquiryDone] = useState(true);

  // Smart Notes Assistant (rule-based demo)
  const [smartNotesLang, setSmartNotesLang] = useState('en');
  const [smartExtractionResult, setSmartExtractionResult] = useState(null);

  const handleRunSmartAssistant = () => {
    if (!visitNotesInput.trim()) return;
    const extracted = extractSmartVisitNotes(visitNotesInput, smartNotesLang);
    setSmartExtractionResult(extracted);
    if (extracted) {
      if (extracted.cropCondition) setCropConditionInput(extracted.cropCondition);
      if (extracted.irrigationCondition) setIrrigationInput(extracted.irrigationCondition);
    }
  };

  const filteredVisits = visits.filter(v => {
    const matchSearch =
      v.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleOpenCompleteModal = (visit) => {
    setActiveModalVisit(visit);
    setVisitNotesInput(visit.notes || '');
    setCropConditionInput(visit.cropCondition || 'Good / Healthy Growth');
    setIrrigationInput(visit.irrigationCondition || 'Adequate Canal Flow');
    setRtcVerified(visit.docChecklist?.rtcVerified ?? true);
    setCropPhotoTaken(visit.docChecklist?.cropPhotoTaken ?? true);
    setNeighborInquiryDone(visit.docChecklist?.neighborInquiryDone ?? true);
  };

  const handleSaveVisitInspection = (e) => {
    e.preventDefault();
    if (!activeModalVisit) return;

    const updated = visits.map(v => {
      if (v.id === activeModalVisit.id) {
        return {
          ...v,
          status: 'Completed',
          cropCondition: cropConditionInput,
          irrigationCondition: irrigationInput,
          notes: visitNotesInput,
          completedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          docChecklist: {
            rtcVerified,
            cropPhotoTaken,
            neighborInquiryDone
          }
        };
      }
      return v;
    });

    onUpdateVisits(updated);

    if (isOfflineMode) {
      const queue = getOfflineQueue();
      saveOfflineQueue([...queue, { type: 'VISIT_INSPECTION', id: activeModalVisit.id, timestamp: Date.now() }]);
    }

    logAudit({
      action: 'FIELD_VISIT_COMPLETED',
      userRole: 'Agriculture Relationship Officer',
      entityId: activeModalVisit.id,
      entityType: 'Field Visit',
      previousStatus: activeModalVisit.status,
      newStatus: 'Completed',
      notes: `Inspection completed for ${activeModalVisit.farmerName}. Crop: ${cropConditionInput}.`
    });

    setActiveModalVisit(null);
  };

  const handleCreateNewVisit = (e) => {
    e.preventDefault();
    const farmer = farmers.find(f => f.id === newVisitData.farmerId);
    if (!farmer) return;

    const newVisit = {
      id: `VIS-2026-0${visits.length + 1}`,
      farmerId: farmer.id,
      farmerName: farmer.name,
      village: farmer.village,
      phone: farmer.phone,
      officerId: 'ST-101',
      officerName: 'Ramesh Kumar (ARO)',
      scheduledDate: newVisitData.scheduledDate,
      status: 'Scheduled',
      purpose: newVisitData.purpose,
      cropCondition: newVisitData.cropCondition,
      irrigationCondition: newVisitData.irrigationCondition,
      docChecklist: {
        rtcVerified: false,
        cropPhotoTaken: false,
        neighborInquiryDone: false
      },
      locationVerified: true,
      notes: newVisitData.notes || 'Field schedule logged.',
      completedAt: null
    };

    onAddVisit(newVisit);

    if (isOfflineMode) {
      const queue = getOfflineQueue();
      saveOfflineQueue([...queue, { type: 'NEW_FIELD_VISIT', id: newVisit.id, timestamp: Date.now() }]);
    }

    logAudit({
      action: 'FIELD_VISIT_SCHEDULED',
      userRole: 'Agriculture Relationship Officer',
      entityId: newVisit.id,
      entityType: 'Field Visit',
      previousStatus: 'None',
      newStatus: 'Scheduled',
      notes: `Visit scheduled for ${farmer.name} on ${newVisitData.scheduledDate}.`
    });

    setIsNewVisitModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header with Officer Mode Badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
              {t('fieldOfficer.title')}
            </h1>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '9999px', backgroundColor: '#e0e7ff', color: '#3730a3' }}>
              ARO Mobile Portal
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            {t('fieldOfficer.subtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <OfflineSyncBadge
            isOffline={isOfflineMode}
            onToggleOffline={onToggleOffline}
            role="Agriculture Relationship Officer"
          />

          <button className="btn btn-secondary" onClick={onOpenNewFarmer}>
            <PlusCircle size={15} />
            {t('farmers.registerBtn')}
          </button>

          <button className="btn btn-primary" onClick={() => setIsNewVisitModalOpen(true)}>
            <Calendar size={15} />
            {t('fieldOfficer.scheduleVisitBtn')}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search farmer, village, purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.25rem', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Status:</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Visits ({visits.length})</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Follow-up Required">Follow-up Required</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visits Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filteredVisits.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', gridColumn: '1 / -1' }}>
            No field inspections found matching your criteria.
          </div>
        ) : (
          filteredVisits.map(visit => (
            <div key={visit.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e3a8a' }}>{visit.id}</span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                    {visit.farmerName}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                    <MapPin size={13} color="#64748b" />
                    <span>{visit.village} • {visit.phone}</span>
                  </div>
                </div>

                <StatusBadge status={visit.status} />
              </div>

              {/* Geo location demo tag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontSize: '0.7rem',
                    fontWeight: 600
                  }}
                >
                  <Check size={12} /> Location verified (demo)
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Scheduled: <strong>{visit.scheduledDate}</strong>
                </span>
              </div>

              {/* Purpose & Findings */}
              <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div>
                  <strong style={{ color: '#475569', fontSize: '0.75rem' }}>Inspection Objective:</strong>
                  <p style={{ color: '#0f172a', fontWeight: 500 }}>{visit.purpose}</p>
                </div>
                {visit.cropCondition && (
                  <div>
                    <strong style={{ color: '#475569', fontSize: '0.75rem' }}>Observed Crop Health:</strong>
                    <p style={{ color: '#15803d', fontWeight: 600 }}>{visit.cropCondition}</p>
                  </div>
                )}
                {visit.notes && (
                  <div>
                    <strong style={{ color: '#475569', fontSize: '0.75rem' }}>ARO Field Observation Note:</strong>
                    <p style={{ color: '#334155', fontStyle: 'italic', fontSize: '0.75rem' }}>{visit.notes}</p>
                  </div>
                )}
              </div>

              {/* Checklist tags */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.7rem' }}>
                <span style={{ padding: '0.1rem 0.4rem', borderRadius: '3px', backgroundColor: visit.docChecklist?.rtcVerified ? '#dcfce7' : '#fee2e2', color: visit.docChecklist?.rtcVerified ? '#15803d' : '#b91c1c' }}>
                  RTC Title: {visit.docChecklist?.rtcVerified ? 'Verified' : 'Pending'}
                </span>
                <span style={{ padding: '0.1rem 0.4rem', borderRadius: '3px', backgroundColor: visit.docChecklist?.cropPhotoTaken ? '#dcfce7' : '#fee2e2', color: visit.docChecklist?.cropPhotoTaken ? '#15803d' : '#b91c1c' }}>
                  Crop Photo: {visit.docChecklist?.cropPhotoTaken ? 'Captured' : 'Missing'}
                </span>
                <span style={{ padding: '0.1rem 0.4rem', borderRadius: '3px', backgroundColor: visit.docChecklist?.neighborInquiryDone ? '#dcfce7' : '#fef3c7', color: visit.docChecklist?.neighborInquiryDone ? '#15803d' : '#b45309' }}>
                  Peer Check: {visit.docChecklist?.neighborInquiryDone ? 'Satisfied' : 'Pending'}
                </span>
              </div>

              {/* Action */}
              <div style={{ marginTop: 'auto', paddingTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                {visit.status !== 'Completed' ? (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleOpenCompleteModal(visit)}
                  >
                    Conduct / Complete Inspection
                  </button>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Completed on {visit.completedAt}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Complete Inspection Modal */}
      {activeModalVisit && (
        <div className="modal-overlay" onClick={() => setActiveModalVisit(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '38rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>
                  Record Field Verification Notes
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {activeModalVisit.farmerName} • {activeModalVisit.village}
                </span>
              </div>
              <button onClick={() => setActiveModalVisit(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveVisitInspection} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                  Observed Crop Stand & Health
                </label>
                <select
                  value={cropConditionInput}
                  onChange={(e) => setCropConditionInput(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Good / Healthy Growth">Good / Healthy Growth (Expected normal yield)</option>
                  <option value="Excellent / High Yield Potential">Excellent / High Yield Potential</option>
                  <option value="Moderate (Partial stress observed)">Moderate (Partial stress observed)</option>
                  <option value="Pest Attack / Disease Damage Reported">Pest Attack / Disease Damage Reported</option>
                  <option value="Drought / Moisture Deficit Stressed">Drought / Moisture Deficit Stressed</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                  Irrigation Source Availability
                </label>
                <select
                  value={irrigationInput}
                  onChange={(e) => setIrrigationInput(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Adequate Canal Flow">Adequate Canal Flow</option>
                  <option value="Borewell Functional & Normal Yield">Borewell Functional & Normal Yield</option>
                  <option value="Open Well Water Level Low">Open Well Water Level Low</option>
                  <option value="Dry Spell / Rainfed only">Dry Spell / Rainfed only</option>
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                    Detailed Field Officer Scrutiny Note *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <select
                      value={smartNotesLang}
                      onChange={(e) => setSmartNotesLang(e.target.value)}
                      style={{ fontSize: '0.75rem', padding: '0.15rem 0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="en">English</option>
                      <option value="kn">Kannada (ಕನ್ನಡ)</option>
                      <option value="hi">Hindi (हिन्दी)</option>
                      <option value="ta">Tamil (தமிழ்)</option>
                      <option value="te">Telugu (తెలుగు)</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleRunSmartAssistant}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        backgroundColor: '#ecfdf5',
                        color: '#065f46',
                        border: '1px solid #a7f3d0',
                        borderRadius: '4px',
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Wand2 size={12} />
                      Smart Notes Assistant (rule-based demo)
                    </button>
                  </div>
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder="Record observations regarding harvest dates, mandi tie-ups, pest treatments, or missing documents..."
                  value={visitNotesInput}
                  onChange={(e) => setVisitNotesInput(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Smart Assistant Output Card */}
              {smartExtractionResult && (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '0.75rem', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <strong style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Sparkles size={13} />
                      Smart Notes Assistant (rule-based demo) Extracted:
                    </strong>
                    <span style={{ backgroundColor: smartExtractionResult.cropRisk === 'High' ? '#fee2e2' : '#dcfce7', color: smartExtractionResult.cropRisk === 'High' ? '#991b1b' : '#166534', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                      {smartExtractionResult.cropRisk} Risk Flag
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', color: '#14532d' }}>
                    <div>• <strong>Crop Condition:</strong> {smartExtractionResult.cropCondition}</div>
                    <div>• <strong>Irrigation:</strong> {smartExtractionResult.irrigationCondition}</div>
                    <div>• <strong>Pest / Disease:</strong> {smartExtractionResult.pestDetails}</div>
                    <div>• <strong>Suggested Follow-up:</strong> {smartExtractionResult.suggestedFollowUpDate}</div>
                  </div>
                  {smartExtractionResult.missingDocs.length > 0 && (
                    <div style={{ marginTop: '0.35rem', color: '#b91c1c' }}>
                      ⚠️ <strong>Missing Documents Flagged:</strong> {smartExtractionResult.missingDocs.join(', ')}
                    </div>
                  )}
                  <div style={{ marginTop: '0.35rem', color: '#166534', fontStyle: 'italic' }}>
                    Suggested Action: {smartExtractionResult.suggestedAction}
                  </div>
                </div>
              )}

              <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Field Audit Checklist:</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rtcVerified}
                    onChange={(e) => setRtcVerified(e.target.checked)}
                  />
                  Survey number and boundaries matched with RTC / 7-12 extract
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={cropPhotoTaken}
                    onChange={(e) => setCropPhotoTaken(e.target.checked)}
                  />
                  Geotagged crop plot photo captured in field device
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={neighborInquiryDone}
                    onChange={(e) => setNeighborInquiryDone(e.target.checked)}
                  />
                  Inquiry with neighboring cultivator confirming peaceful possession
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModalVisit(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Complete Inspection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule New Visit Modal */}
      {isNewVisitModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNewVisitModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '34rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>
                Schedule Field Inspection Visit
              </h3>
              <button onClick={() => setIsNewVisitModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateNewVisit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                  Farmer Borrower *
                </label>
                <select
                  value={newVisitData.farmerId}
                  onChange={(e) => setNewVisitData({ ...newVisitData, farmerId: e.target.value })}
                  style={{ width: '100%' }}
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
                  Inspection Date *
                </label>
                <input
                  type="date"
                  required
                  value={newVisitData.scheduledDate}
                  onChange={(e) => setNewVisitData({ ...newVisitData, scheduledDate: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                  Inspection Purpose *
                </label>
                <input
                  type="text"
                  required
                  value={newVisitData.purpose}
                  onChange={(e) => setNewVisitData({ ...newVisitData, purpose: e.target.value })}
                  placeholder="e.g. Pre-sanction land boundary verification"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsNewVisitModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
