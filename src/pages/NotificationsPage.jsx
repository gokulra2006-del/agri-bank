import React from 'react';
import { Bell, Check, Clock, AlertTriangle, FileText, CheckCircle2, Trash2 } from 'lucide-react';
import { saveNotifications } from '../data/mockStore';

export default function NotificationsPage({ notifications = [], onUpdateNotifications, onNavigate }) {
  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
    if (onUpdateNotifications) onUpdateNotifications(updated);
  };

  const handleClearAll = () => {
    saveNotifications([]);
    if (onUpdateNotifications) onUpdateNotifications([]);
  };

  const handleNotificationClick = (n) => {
    const updated = notifications.map(item => item.id === n.id ? { ...item, read: true } : item);
    saveNotifications(updated);
    if (onUpdateNotifications) onUpdateNotifications(updated);

    if (n.type === 'repayment') {
      onNavigate('repayments');
    } else if (n.type === 'document') {
      onNavigate('documents');
    } else if (n.type === 'application') {
      onNavigate('loans');
    } else {
      onNavigate('dashboard');
    }
  };

  const getIcon = (type) => {
    if (type === 'repayment') return <Clock size={18} color="#d97706" />;
    if (type === 'document') return <AlertTriangle size={18} color="#dc2626" />;
    if (type === 'application') return <FileText size={18} color="#2563eb" />;
    return <CheckCircle2 size={18} color="#15803d" />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
            System Notifications & Action Alerts
          </h1>
          <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            Operational reminders for document pendencies, harvest repayments, and loan sanctions
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
            <Check size={14} />
            Mark All Read
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleClearAll} style={{ color: '#dc2626' }}>
            <Trash2 size={14} />
            Clear All
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="card" style={{ padding: '0.5rem 0' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            No active notifications.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem 1.25rem',
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: n.read ? '#ffffff' : '#f0fdf4',
                cursor: 'pointer',
                transition: 'background-color 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = n.read ? '#ffffff' : '#f0fdf4'}
            >
              <div style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: '#f1f5f9' }}>
                {getIcon(n.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: n.read ? 600 : 700, color: '#0f172a' }}>
                    {n.title}
                  </h4>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{n.time}</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.4 }}>
                  {n.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
