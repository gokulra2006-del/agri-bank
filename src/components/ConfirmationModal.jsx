import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, X } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm Action',
  confirmVariant = 'primary', // 'primary', 'blue', 'danger'
  onConfirm,
  onClose,
  details
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {confirmVariant === 'danger' ? (
              <div style={{ padding: '0.5rem', background: '#fee2e2', borderRadius: '50%', color: '#dc2626' }}>
                <AlertTriangle size={20} />
              </div>
            ) : confirmVariant === 'blue' ? (
              <div style={{ padding: '0.5rem', background: '#e0e7ff', borderRadius: '50%', color: '#3730a3' }}>
                <CheckCircle2 size={20} />
              </div>
            ) : (
              <div style={{ padding: '0.5rem', background: '#dcfce7', borderRadius: '50%', color: '#15803d' }}>
                <AlertCircle size={20} />
              </div>
            )}
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem', lineHeight: '1.5' }}>
          {message}
        </p>

        {details && (
          <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0', marginBottom: '1.25rem', fontSize: '0.8125rem', color: '#334155' }}>
            {details}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`btn btn-${confirmVariant}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
