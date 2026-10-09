import React from 'react';
import { useTranslation } from '../context/LanguageContext';

export default function StatusBadge({ status, type = 'loan' }) {
  const { t } = useTranslation();
  let bg = '#f1f5f9';
  let text = '#475569';
  let border = '#cbd5e1';

  const s = (status || '').toLowerCase();
  let displayLabel = status;

  if (s.includes('approved')) {
    bg = '#dcfce7';
    text = '#15803d';
    border = '#bbf7d0';
    displayLabel = t('languagePreview.statusApproved', {}, 'Approved');
  } else if (s.includes('verified') || s.includes('paid') || s.includes('low risk')) {
    bg = '#dcfce7';
    text = '#15803d';
    border = '#bbf7d0';
  } else if (s.includes('disbursed')) {
    bg = '#e0e7ff';
    text = '#3730a3';
    border = '#c7d2fe';
    displayLabel = t('languagePreview.statusDisbursed', {}, 'Disbursed');
  } else if (s.includes('under review')) {
    bg = '#fef3c7';
    text = '#b45309';
    border = '#fde68a';
  } else if (s.includes('due soon')) {
    bg = '#fef3c7';
    text = '#b45309';
    border = '#fde68a';
    displayLabel = t('languagePreview.statusDueSoon', {}, 'Due Soon');
  } else if (s.includes('medium risk')) {
    bg = '#fef3c7';
    text = '#b45309';
    border = '#fde68a';
  } else if (s.includes('submitted')) {
    bg = '#e0f2fe';
    text = '#0369a1';
    border = '#bae6fd';
    displayLabel = t('languagePreview.statusSubmitted', {}, 'Submitted');
  } else if (s.includes('pending') || s.includes('draft')) {
    bg = '#e0f2fe';
    text = '#0369a1';
    border = '#bae6fd';
  } else if (s.includes('rejected')) {
    bg = '#fee2e2';
    text = '#b91c1c';
    border = '#fecaca';
    displayLabel = t('languagePreview.statusRejected', {}, 'Rejected');
  } else if (s.includes('overdue')) {
    bg = '#fee2e2';
    text = '#b91c1c';
    border = '#fecaca';
    displayLabel = t('languagePreview.statusOverdue', {}, 'Overdue');
  } else if (s.includes('missing') || s.includes('manual review')) {
    bg = '#fee2e2';
    text = '#b91c1c';
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
      {displayLabel}
    </span>
  );
}
