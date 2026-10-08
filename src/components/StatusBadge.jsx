import React from 'react';

export default function StatusBadge({ status, type = 'loan' }) {
  let bg = '#f1f5f9';
  let text = '#475569';
  let border = '#cbd5e1';

  const s = (status || '').toLowerCase();

  if (s.includes('approved') || s.includes('verified') || s.includes('paid') || s.includes('low risk')) {
    bg = '#dcfce7'; // green-100
    text = '#15803d'; // green-700
    border = '#bbf7d0';
  } else if (s.includes('disbursed')) {
    bg = '#e0e7ff'; // indigo-100
    text = '#3730a3'; // indigo-800
    border = '#c7d2fe';
  } else if (s.includes('under review') || s.includes('due soon') || s.includes('medium risk')) {
    bg = '#fef3c7'; // amber-100
    text = '#b45309'; // amber-700
    border = '#fde68a';
  } else if (s.includes('submitted') || s.includes('pending') || s.includes('draft')) {
    bg = '#e0f2fe'; // sky-100
    text = '#0369a1'; // sky-700
    border = '#bae6fd';
  } else if (s.includes('rejected') || s.includes('overdue') || s.includes('missing') || s.includes('manual review')) {
    bg = '#fee2e2'; // red-100
    text = '#b91c1c'; // red-700
    border = '#fecaca';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.55rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: bg,
        color: text,
        border: `1px solid ${border}`,
        whiteSpace: 'nowrap'
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: text,
          marginRight: '0.375rem'
        }}
      />
      {status}
    </span>
  );
}
