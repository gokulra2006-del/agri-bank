import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, badgeText, badgeColor = 'green' }) {
  const getBadgeStyle = () => {
    if (badgeColor === 'green') return { bg: '#dcfce7', text: '#15803d' };
    if (badgeColor === 'blue') return { bg: '#e0f2fe', text: '#0284c7' };
    if (badgeColor === 'amber') return { bg: '#fef3c7', text: '#d97706' };
    return { bg: '#f1f5f9', text: '#475569' };
  };

  const badgeStyle = getBadgeStyle();

  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
          {title}
        </span>
        {Icon && (
          <div style={{ padding: '0.5rem', borderRadius: '0.375rem', backgroundColor: '#f1f5f9', color: '#1e3a8a' }}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
          {value}
        </span>
        {badgeText && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.125rem 0.5rem',
              borderRadius: '9999px',
              backgroundColor: badgeStyle.bg,
              color: badgeStyle.text
            }}
          >
            {badgeText}
          </span>
        )}
      </div>

      {subtitle && (
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
          {subtitle}
        </span>
      )}
    </div>
  );
}
