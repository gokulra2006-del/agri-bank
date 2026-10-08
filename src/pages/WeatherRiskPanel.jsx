import React, { useState } from 'react';
import { CloudSun, AlertTriangle, Droplets, Wind, ShieldAlert, Info, Search } from 'lucide-react';
import { getWeatherRisks } from '../data/mockStore';

export default function WeatherRiskPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const weatherRisks = getWeatherRisks();

  const filtered = weatherRisks.filter(item => {
    const matchSearch =
      item.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDistrict = districtFilter === 'ALL' || item.district === districtFilter;
    return matchSearch && matchDistrict;
  });

  const districts = Array.from(new Set(weatherRisks.map(w => w.district)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
            Weather & Agro-Climatic Risk Monitoring
          </h1>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '9999px', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
            Demo Risk Indicators
          </span>
        </div>
        <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          Simulated district-level monsoon rainfall, drought warnings, and pest triggers linked to credit underwriting
        </p>
      </div>

      {/* Demo disclaimer banner */}
      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Info size={18} color="#1d4ed8" />
        <span style={{ fontSize: '0.8125rem', color: '#1e40af' }}>
          <strong>Demo Notice:</strong> No live satellite or external weather API is used. Simulated agro-climatic indicators represent how rural banks monitor regional weather stress to adjust credit lines.
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search crop, district, condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.25rem', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>District:</span>
            <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
              <option value="ALL">All Operating Districts</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Weather Risk Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filtered.map(item => (
          <div key={item.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e3a8a' }}>{item.district}, {item.state}</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  {item.crop}
                </h3>
              </div>

              <span
                style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: item.riskLevel === 'High' ? '#fee2e2' : item.riskLevel === 'Medium' ? '#fef3c7' : '#dcfce7',
                  color: item.riskLevel === 'High' ? '#b91c1c' : item.riskLevel === 'Medium' ? '#b45309' : '#15803d'
                }}
              >
                {item.riskLevel} Risk
              </span>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div>
                <strong style={{ color: '#475569', fontSize: '0.75rem' }}>Weather & Agro Phenomenon:</strong>
                <p style={{ color: '#0f172a', fontWeight: 500 }}>{item.weatherCondition}</p>
              </div>
              <div>
                <strong style={{ color: '#475569', fontSize: '0.75rem' }}>Financial Impact Rationale:</strong>
                <p style={{ color: '#334155' }}>{item.reason}</p>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#15803d', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', marginTop: 'auto' }}>
              <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.15rem' }}>Suggested Banking Action:</strong>
              {item.suggestedAction}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
