import React, { useState } from 'react';
import { Landmark, Shield, Search, FileText, CheckCircle2, Info } from 'lucide-react';
import { GOV_SCHEMES } from '../data/mockData';

export default function SchemesInsurance() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filtered = GOV_SCHEMES.filter(s => {
    const matchSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.benefits.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || s.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const categories = Array.from(new Set(GOV_SCHEMES.map(s => s.category)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
          Government Subsidies, PMFBY & Interest Concession Desk
        </h1>
        <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          Reference library for branch officers to assist farmers with official credit subsidies and risk mitigation
        </p>
      </div>

      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Info size={18} color="#1d4ed8" />
        <span style={{ fontSize: '0.8125rem', color: '#1e40af' }}>
          <strong>Reference Repository:</strong> Curated schemes aligned with Priority Sector Lending (PSL) and NABARD/RBI crop insurance guidelines.
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search scheme name or benefit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.25rem', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Category:</span>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="ALL">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Schemes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {filtered.map(scheme => (
          <div key={scheme.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                  {scheme.title}
                </h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803d' }}>
                  {scheme.category}
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '4px', fontWeight: 600 }}>
                Active in Branch
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem' }}>
              <div>
                <strong style={{ color: '#0f172a' }}>Coverage Scope:</strong>
                <p style={{ color: '#475569', marginTop: '0.1rem' }}>{scheme.coverage}</p>
              </div>
              <div>
                <strong style={{ color: '#0f172a' }}>Premium / Cost Sharing:</strong>
                <p style={{ color: '#475569', marginTop: '0.1rem' }}>{scheme.premiumShare}</p>
              </div>
            </div>

            <div style={{ fontSize: '0.8125rem', color: '#334155' }}>
              <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.2rem' }}>Eligibility:</strong>
              {scheme.eligibility}
            </div>

            <div style={{ fontSize: '0.8125rem', color: '#334155' }}>
              <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.2rem' }}>Key Benefits:</strong>
              {scheme.benefits}
            </div>

            <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', marginTop: 'auto' }}>
              <strong>Required Documents:</strong> {scheme.documentsNeeded}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
