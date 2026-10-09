import React, { useState } from 'react';
import { Landmark, Shield, Search, FileText, CheckCircle2, Info, Sparkles, User } from 'lucide-react';
import { GOV_SCHEMES } from '../data/mockData';
import { matchFarmerSchemes } from '../utils/climatePlatformUtils';

export default function SchemesInsurance({ farmers = [] }) {
  const [activeTab, setActiveTab] = useState('library'); // 'library' or 'matcher'
  const [selectedFarmerId, setSelectedFarmerId] = useState(farmers[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const selectedFarmer = farmers.find(f => f.id === selectedFarmerId) || farmers[0];
  const matchedSchemes = selectedFarmer ? matchFarmerSchemes(selectedFarmer) : [];

  const safeSchemes = Array.isArray(GOV_SCHEMES) ? GOV_SCHEMES : [];
  const filtered = safeSchemes.filter(s => {
    if (!s) return false;
    const term = (searchTerm || '').toLowerCase();
    const matchSearch =
      (s.title || '').toLowerCase().includes(term) ||
      (s.benefits || '').toLowerCase().includes(term);
    const matchCat = categoryFilter === 'ALL' || s.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const categories = Array.from(new Set(safeSchemes.map(s => s?.category).filter(Boolean)));

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

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('library')}
          style={{
            padding: '0.45rem 0.875rem',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: activeTab === 'library' ? '#0f172a' : '#f1f5f9',
            color: activeTab === 'library' ? '#ffffff' : '#334155'
          }}
        >
          Scheme Reference Library
        </button>
        <button
          onClick={() => setActiveTab('matcher')}
          style={{
            padding: '0.45rem 0.875rem',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: activeTab === 'matcher' ? '#059669' : '#ecfdf5',
            color: activeTab === 'matcher' ? '#ffffff' : '#065f46',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <Sparkles size={14} />
          Farmer Scheme & Subsidy Matcher
        </button>
      </div>

      {activeTab === 'matcher' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Automatic Subsidy Eligibility Matcher
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.2rem' }}>
                Rule-based matching against land size, irrigation type, crop pattern, and existing loan liabilities.
              </p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>
                Select Farmer:
              </label>
              <select
                value={selectedFarmerId}
                onChange={(e) => setSelectedFarmerId(e.target.value)}
                style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8125rem', fontWeight: 600 }}
              >
                {farmers.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.landSize} ac • {f.primaryCrop} • {f.landType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {matchedSchemes.map((m) => {
              const isEligible = m.status === 'Eligible';
              return (
                <div key={m.schemeId} style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: isEligible ? '1px solid #86efac' : '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{m.category}</span>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: isEligible ? '#dcfce7' : '#fef3c7', color: isEligible ? '#166534' : '#92400e' }}>
                        {m.status}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', marginTop: '0.35rem' }}>{m.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem', lineHeight: 1.4 }}>{m.benefits}</p>

                    <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem' }}>
                      {m.reasonsMet.map((r, rIdx) => (
                        <div key={rIdx} style={{ color: '#166534' }}>✓ {r}</div>
                      ))}
                      {m.reasonsUnmet.map((u, uIdx) => (
                        <div key={uIdx} style={{ color: '#b91c1c' }}>✗ {u}</div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#1e40af', fontWeight: 600 }}>
                    Next Step: {m.nextStep}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reference Notice */}
      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Info size={18} color="#1d4ed8" />
        <span style={{ fontSize: '0.8125rem', color: '#1e40af' }}>
          <strong>Reference Repository:</strong> Curated schemes aligned with Priority Sector Lending (PSL) and NABARD/RBI crop insurance guidelines. Demo and reference content; check official sources for current rules.
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
