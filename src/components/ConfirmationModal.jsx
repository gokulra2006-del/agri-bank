import React, { useEffect, useRef } from 'react';
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
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      // Focus modal content
      if (modalRef.current) {
        const focusable = modalRef.current.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
        if (focusable.length > 0) {
          focusable[0].focus();
        }
      }

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        } else if (e.key === 'Tab' && modalRef.current) {
          const focusable = Array.from(modalRef.current.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"])'));
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        ref={modalRef}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '1.5rem' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-desc"
      >
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
            <h3 id="confirm-modal-title" style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close confirmation dialog"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={20} />
          </button>
        </div>

        <p id="confirm-modal-desc" style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem', lineHeight: '1.5' }}>
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
