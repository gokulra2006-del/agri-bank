import React, { useEffect } from 'react';
import { Bell, Check, Clock, AlertTriangle, FileText, CheckCircle2, X } from 'lucide-react';
import { saveNotifications } from '../data/mockStore';

export default function NotificationPanel({ isOpen, onClose, notifications = [], onUpdateNotifications, onNavigate }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
    if (onUpdateNotifications) onUpdateNotifications(updated);
  };

  const handleItemClick = (notif) => {
    const updated = notifications.map(n => n.id === notif.id ? { ...n, read: true } : n);
    saveNotifications(updated);
    if (onUpdateNotifications) onUpdateNotifications(updated);

    if (notif.type === 'repayment') {
      onNavigate('repayments');
    } else if (notif.type === 'document') {
      onNavigate('documents');
    } else if (notif.type === 'application') {
      onNavigate('loans');
    } else {
      onNavigate('dashboard');
    }
    onClose();
  };

  const getIcon = (type) => {
    if (type === 'repayment') return <Clock size={16} color="#d97706" />;
    if (type === 'document') return <AlertTriangle size={16} color="#dc2626" />;
    if (type === 'application') return <FileText size={16} color="#2563eb" />;
    return <CheckCircle2 size={16} color="#15803d" />;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Notifications and Alerts Panel"
      style={{
        position: 'fixed',
        top: '64px',
        right: '1.5rem',
        width: '360px',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        zIndex: 50,
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={16} color="#1e3a8a" />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
            Notifications & Alerts
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleMarkAllRead}
            style={{ background: 'none', border: 'none', fontSize: '0.7rem', color: '#15803d', fontWeight: 600, cursor: 'pointer' }}
          >
            Mark all read
          </button>
          <button
            onClick={onClose}
            aria-label="Close notifications panel"
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8125rem' }}>
            No active alerts
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleItemClick(n)}
              style={{
                display: 'flex',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: n.read ? '#ffffff' : '#f0fdf4',
                cursor: 'pointer',
                transition: 'background-color 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = n.read ? '#ffffff' : '#f0fdf4'}
            >
              <div style={{ marginTop: '0.125rem' }}>
                {getIcon(n.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.125rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: n.read ? 500 : 600, color: '#0f172a' }}>
                    {n.title}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{n.time}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.35 }}>
                  {n.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ padding: '0.5rem 1rem', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
        <button
          onClick={() => {
            onNavigate('notifications');
            onClose();
          }}
          style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: '#1e3a8a', fontWeight: 600, cursor: 'pointer' }}
        >
          View all notifications →
        </button>
      </div>
    </div>
  );
}
