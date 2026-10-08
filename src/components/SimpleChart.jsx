import React from 'react';

// Monthly applications bar chart
export function MonthlyApplicationsBarChart({ data = [] }) {
  const max = Math.max(...data.map(d => d.value), 10);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '160px', gap: '0.75rem', paddingTop: '1rem' }}>
        {data.map((item, idx) => {
          const heightPercent = Math.round((item.value / max) * 100);
          return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                {item.value}
              </span>
              <div
                style={{
                  width: '100%',
                  maxWidth: '36px',
                  height: `${Math.max(heightPercent, 8)}%`,
                  backgroundColor: '#15803d',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.3s ease',
                  opacity: idx === data.length - 1 ? 1 : 0.85
                }}
                title={`${item.month}: ${item.value} applications`}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                {item.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Loan Status donut / distribution bar
export function LoanStatusDistribution({ statusCounts = {} }) {
  const statuses = [
    { label: 'Approved', count: statusCounts.Approved || 0, color: '#15803d' },
    { label: 'Disbursed', count: statusCounts.Disbursed || 0, color: '#3730a3' },
    { label: 'Under Review', count: statusCounts['Under Review'] || 0, color: '#f59e0b' },
    { label: 'Submitted / Draft', count: (statusCounts.Submitted || 0) + (statusCounts.Draft || 0), color: '#0284c7' },
    { label: 'Rejected', count: statusCounts.Rejected || 0, color: '#ef4444' }
  ];

  const total = statuses.reduce((sum, s) => sum + s.count, 0) || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* Progress segmented bar */}
      <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
        {statuses.map((s, idx) => {
          const pct = ((s.count / total) * 100).toFixed(1);
          if (s.count === 0) return null;
          return (
            <div
              key={idx}
              style={{
                width: `${pct}%`,
                backgroundColor: s.color,
                transition: 'width 0.3s'
              }}
              title={`${s.label}: ${s.count} (${pct}%)`}
            />
          );
        })}
      </div>

      {/* Legend list */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
        {statuses.map((s, idx) => {
          const pct = Math.round((s.count / total) * 100);
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: s.color, flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{s.label}</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{s.count} <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '0.7rem' }}>({pct}%)</span></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
