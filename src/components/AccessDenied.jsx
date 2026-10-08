import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AccessDenied({ roleName = 'Current Role', onNavigateHome }) {
  return (
    <div style={{ padding: '3rem 1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <ShieldAlert size={28} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
          Access Restricted
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          Your active demo role (<strong>{roleName}</strong>) does not have authorization to view this banking screen. Use the demo role switcher in the top bar to switch to an authorized role.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={onNavigateHome}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
