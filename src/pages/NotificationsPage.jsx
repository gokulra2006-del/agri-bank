import React, { useState } from 'react';
import {
  Bell,
  Check,
  Clock,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Trash2,
  Filter,
  MessageSquare,
  Mail,
  Smartphone,
  ShieldAlert,
  Send,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';
import { saveNotifications } from '../data/mockStore';

export default function NotificationsPage({ notifications = [], onUpdateNotifications, onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedChannel, setSelectedChannel] = useState('ALL');
  const [filterRead, setFilterRead] = useState('ALL');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateLang, setTemplateLang] = useState('kn');

  const CATEGORIES = [
    { id: 'ALL', label: 'All Alerts' },
    { id: 'UPCOMING_REPAYMENT', label: 'Upcoming Repayments' },
    { id: 'FIELD_VISIT_DUE', label: 'Field Visits Due' },
    { id: 'MISSING_DOCUMENT', label: 'Missing Documents' },
    { id: 'CROP_LOSS_REPORT', label: 'Crop-Loss Reports' },
    { id: 'INSURANCE_DEADLINE', label: 'Insurance Deadlines' },
    { id: 'CONSENT_EXPIRY', label: 'Consent Expiry' },
    { id: 'FAILED_SYNC', label: 'Failed Sync' },
    { id: 'MANAGER_APPROVAL', label: 'Manager Approvals' },
    { id: 'FARMER_FOLLOW_UP', label: 'Farmer Follow-ups' }
  ];

  const REGIONAL_TEMPLATES = {
    UPCOMING_REPAYMENT: {
      en: 'Dear {farmerName}, your harvest loan installment of ₹{amount} is scheduled after Mandi harvest auction on {date}. Contact your branch officer for grace period assistance.',
      kn: 'ಗೌರವಾನ್ವಿತ {farmerName}, ನಿಮ್ಮ ಸುಗ್ಗಿಯ ಸಾಲದ ಕಂತು ₹{amount} ದಿನಾಂಕ {date} ರಂದು ನಿಗದಿಯಾಗಿದೆ. ಮಂಡಿ ಮಾರಾಟದ ನಂತರ ಪಾವತಿಸಿ.',
      hi: 'प्रिय {farmerName}, आपकी फसल ऋण किस्त ₹{amount} की तिथि {date} तय है। मंडी बिक्री के बाद भुगतान करें।',
      ta: 'மதிப்பிற்குரிய {farmerName}, உங்கள் அறுவடை கடன் தவணை ₹{amount} தேதி {date} அன்று செலுத்தப்பட வேண்டும்.',
      te: 'గౌరవనీయ {farmerName}, మీ పంట రుణ వాయిదా ₹{amount} తేదీ {date} న చెల్లించవలసి ఉంది.'
    },
    PMFBY_DEADLINE: {
      en: 'PMFBY 72-Hour Alert: Please report any localized crop flood/drought loss within 72 hours to ensure surveyor claim eligibility.',
      kn: 'ಪಿಎಂಎಫ್‌ಬಿವೈ ಎಚ್ಚರಿಕೆ: ಪ್ರವಾಹ ಅಥವಾ ಬರ ಹಾನಿಯನ್ನು 72 ಗಂಟೆಗಳ ಒಳಗೆ ಸಮೀಕ್ಷಕ ಪರಿಹಾರಕ್ಕಾಗಿ ನಮೂದಿಸಿ.',
      hi: 'पीएमएफबीवाई सूचना: सर्वेक्षण दावे के लिए बाढ़ या सूखे के नुकसान की सूचना 72 घंटे के भीतर दर्ज करें।'
    }
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true, is_read: true }));
    saveNotifications(updated);
    if (onUpdateNotifications) onUpdateNotifications(updated);
  };

  const handleClearAll = () => {
    saveNotifications([]);
    if (onUpdateNotifications) onUpdateNotifications([]);
  };

  const handleNotificationClick = (n) => {
    const updated = notifications.map(item => item.id === n.id ? { ...item, read: true, is_read: true } : item);
    saveNotifications(updated);
    if (onUpdateNotifications) onUpdateNotifications(updated);

    if (n.category === 'UPCOMING_REPAYMENT' || n.type === 'repayment') {
      if (onNavigate) onNavigate('repayments');
    } else if (n.category === 'FAILED_SYNC') {
      if (onNavigate) onNavigate('sync-monitor');
    } else if (n.category === 'CROP_LOSS_REPORT') {
      if (onNavigate) onNavigate('credit-protection');
    } else if (n.category === 'MANAGER_APPROVAL' || n.type === 'application') {
      if (onNavigate) onNavigate('loans');
    }
  };

  const filtered = notifications.filter(n => {
    const catMatch = selectedCategory === 'ALL' || n.category === selectedCategory || (selectedCategory === 'UPCOMING_REPAYMENT' && n.type === 'repayment') || (selectedCategory === 'MANAGER_APPROVAL' && n.type === 'application') || (selectedCategory === 'MISSING_DOCUMENT' && n.type === 'document');
    const chanMatch = selectedChannel === 'ALL' || (n.channel || 'IN_APP') === selectedChannel;
    const isRead = Boolean(n.read || n.is_read);
    const readMatch = filterRead === 'ALL' || (filterRead === 'UNREAD' && !isRead) || (filterRead === 'READ' && isRead);
    return catMatch && chanMatch && readMatch;
  });

  const getChannelBadge = (channel = 'IN_APP') => {
    if (channel === 'SIMULATED_SMS') {
      return <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 600 }}>Simulated SMS</span>;
    }
    if (channel === 'SIMULATED_EMAIL') {
      return <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: '#f3e8ff', color: '#7e22ce', fontWeight: 600 }}>Simulated Email</span>;
    }
    if (channel === 'SIMULATED_WHATSAPP') {
      return <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 600 }}>Simulated WhatsApp</span>;
    }
    return <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 600 }}>In-App</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
            Notification & Follow-up Command Center
          </h1>
          <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            Automated alerts for repayments, PMFBY deadlines, document pendencies, and field sync events.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowTemplateModal(true)}>
            <MessageSquare size={14} />
            Regional Message Templates
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
            <Check size={14} />
            Mark All Read
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleClearAll} style={{ color: '#dc2626' }}>
            <Trash2 size={14} />
            Clear Queue
          </button>
        </div>
      </div>

      {/* Compliance Disclaimer Banner */}
      <div style={{ padding: '0.75rem 1rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', color: '#1e3a8a', fontSize: '0.8125rem', lineHeight: '1.5' }}>
        <strong>Simulated Communication Notice:</strong> External delivery channels (SMS, Email, WhatsApp) are illustrative simulations for pilot evaluation. No commercial SMS gateways or real cellular messages are dispatched.
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Filter size={14} /> Category:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ fontSize: '0.8125rem', padding: '0.35rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
          >
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Channel:</span>
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            style={{ fontSize: '0.8125rem', padding: '0.35rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
          >
            <option value="ALL">All Channels</option>
            <option value="IN_APP">In-App</option>
            <option value="SIMULATED_SMS">Simulated SMS</option>
            <option value="SIMULATED_EMAIL">Simulated Email</option>
            <option value="SIMULATED_WHATSAPP">Simulated WhatsApp</option>
          </select>

          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginLeft: '0.5rem' }}>Status:</span>
          <select
            value={filterRead}
            onChange={(e) => setFilterRead(e.target.value)}
            style={{ fontSize: '0.8125rem', padding: '0.35rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
          >
            <option value="ALL">All</option>
            <option value="UNREAD">Unread Only</option>
            <option value="READ">Read Only</option>
          </select>
        </div>
      </div>

      {/* Notifications list */}
      <div className="card" style={{ padding: '0' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: '#94a3b8' }}>
            <Bell size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <div style={{ fontWeight: 600 }}>No notifications matching criteria</div>
            <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Try clearing filters or switching category.</div>
          </div>
        ) : (
          filtered.map((n) => {
            const isRead = Boolean(n.read || n.is_read);
            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid #f1f5f9',
                  backgroundColor: isRead ? '#ffffff' : '#f0fdf4',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isRead ? '#ffffff' : '#f0fdf4'}
              >
                <div style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: isRead ? '#f1f5f9' : '#dcfce7', color: isRead ? '#64748b' : '#15803d', marginTop: '0.125rem' }}>
                  <Bell size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: isRead ? 600 : 700, color: '#0f172a', margin: 0 }}>
                        {n.title}
                      </h4>
                      {getChannelBadge(n.channel)}
                      {n.delivery_status && (
                        <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                          ● {n.delivery_status}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {n.time || n.created_at ? new Date(n.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    {n.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Regional Templates Modal */}
      {showTemplateModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '1.5rem', maxWidth: '600px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Regional Language Notification Templates
              </h3>
              <button onClick={() => setShowTemplateModal(false)} className="btn btn-secondary btn-sm">✕</button>
            </div>
            
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>
              Standardized rural banking follow-up messages translated into regional languages for respectful borrower communication.
            </p>

            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Select Language:</span>
              <select
                value={templateLang}
                onChange={(e) => setTemplateLang(e.target.value)}
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.8125rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              >
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="en">English</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.875rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Harvest Repayment Due Template
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#334155', fontStyle: 'italic', lineHeight: 1.5 }}>
                  "{REGIONAL_TEMPLATES.UPCOMING_REPAYMENT[templateLang] || REGIONAL_TEMPLATES.UPCOMING_REPAYMENT.en}"
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '0.875rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  PMFBY 72-Hour Loss Reporting Alert
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#334155', fontStyle: 'italic', lineHeight: 1.5 }}>
                  "{REGIONAL_TEMPLATES.PMFBY_DEADLINE[templateLang] || REGIONAL_TEMPLATES.PMFBY_DEADLINE.en}"
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button onClick={() => setShowTemplateModal(false)} className="btn btn-primary btn-sm">
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
