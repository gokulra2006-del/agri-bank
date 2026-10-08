import React, { useState } from 'react';
import {
  MapPin,
  Filter,
  Shield,
  AlertTriangle,
  Info,
  Droplets,
  Layers,
  Search,
  Users
} from 'lucide-react';
import { getVillageHeatmaps } from '../data/mockStore';

export default function VillageHeatmapPage({
  farmers = []
}) {
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [riskTypeFilter, setRiskTypeFilter] = useState('ALL'); // 'ALL', 'drought', 'disease', 'repayment'
  const [selectedVillage, setSelectedVillage] = useState(null);

  const rawHeatmaps = getVillageHeatmaps();

  // Privacy Threshold: Filter and count farmers per village in the local dataset
  const villageCounts = {};
  farmers.forEach(f => {
    villageCounts[f.village] = (villageCounts[f.village] || 0) + 1;
  });

  const districts = Array.from(new Set(rawHeatmaps.map(v => v.district)));

  // Filtered heatmaps
  const filteredVillages = rawHeatmaps.filter(v => {
    const matchDistrict = districtFilter === 'ALL' || v.district === districtFilter;
    let matchRisk = true;
    if (riskTypeFilter === 'drought') {
      matchRisk = v.rainfallStressIndex.includes('High') || v.rainfallStressIndex.includes('Moderate');
    } else if (riskTypeFilter === 'disease') {
      matchRisk = v.pestDiseasePressure.includes('High') || v.pestDiseasePressure.includes('Moderate');
    } else if (riskTypeFilter === 'repayment') {
      matchRisk = parseFloat(v.delayedRepaymentRate) > 8;
    }
    return matchDistrict && matchRisk;
  });

  const PRIVACY_THRESHOLD = 2; // Privacy rule: hide villages with fewer than 2 active registered farmers to prevent identification

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', backgroundColor: '#eff6ff', color: '#1e40af', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          <Shield size={14} />
          Aggregated Spatial Analytics • Zero Individual PII
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Village Risk Heatmap
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
          Anonymous, community-level risk indicators for drought exposure, crop disease pressure, and repayment delay rates.
        </p>
      </div>

      {/* Privacy Notice Banner */}
      <div style={{ padding: '0.875rem 1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem', color: '#166534' }}>
        <Info size={18} color="#15803d" />
        <div>
          <strong>Privacy Safeguard Standard:</strong> Individual farmer names, phone numbers, and financial balances are strictly excluded. Villages with fewer than {PRIVACY_THRESHOLD} registered farmers are suppressed to prevent indirect identification.
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>
                District:
              </label>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
              >
                <option value="ALL">All Operating Districts</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>
                Risk Type Filter:
              </label>
              <select
                value={riskTypeFilter}
                onChange={(e) => setRiskTypeFilter(e.target.value)}
                style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
              >
                <option value="ALL">All Risk Indicators</option>
                <option value="drought">Rainfall & Moisture Deficit</option>
                <option value="disease">Pest & Disease Pressure</option>
                <option value="repayment">Elevated Repayment Delay (&gt;8%)</option>
              </select>
            </div>
          </div>

          {/* Color & Text Accessible Legend */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.75rem' }}>
            <span style={{ fontWeight: 600, color: '#475569' }}>Risk Slabs:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#10b981' }} />
              <span>Low (Stable)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#f59e0b' }} />
              <span>Medium (Watch)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#ef4444' }} />
              <span>High (Elevated)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Village Heat Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {filteredVillages.map(v => {
          const registeredInApp = villageCounts[v.villageName] || 0;
          const isSuppressed = registeredInApp < PRIVACY_THRESHOLD;

          if (isSuppressed) {
            return (
              <div key={v.villageId} className="card" style={{ padding: '1.25rem', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
                  <Shield size={16} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{v.villageName} (Suppressed)</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                  Suppressed under privacy threshold (fewer than {PRIVACY_THRESHOLD} registered profiles). Data hidden to protect individual farmer identity.
                </p>
              </div>
            );
          }

          const isHigh = v.overallRiskTier === 'High';
          const isMed = v.overallRiskTier === 'Medium';
          const borderColor = isHigh ? '#fca5a5' : isMed ? '#fcd34d' : '#86efac';
          const headerBg = isHigh ? '#fef2f2' : isMed ? '#fffbeb' : '#f0fdf4';

          return (
            <div
              key={v.villageId}
              className="card"
              onClick={() => setSelectedVillage(v)}
              style={{
                padding: '1.25rem',
                border: `2px solid ${borderColor}`,
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={18} color="#059669" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {v.villageName}
                    </h3>
                  </div>
                  <span style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: headerBg,
                    color: isHigh ? '#b91c1c' : isMed ? '#b45309' : '#15803d'
                  }}>
                    {v.overallRiskTier} Risk Tier
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  {v.taluk}, {v.district} • {v.activeBorrowersCount} Borrowers
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Dominant Crop:</span>
                    <span style={{ fontWeight: 600 }}>{v.dominantCrop}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Rainfall Stress:</span>
                    <span style={{ fontWeight: 600, color: v.rainfallStressIndex.includes('High') ? '#b91c1c' : '#0f172a' }}>
                      {v.rainfallStressIndex}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Pest Pressure:</span>
                    <span style={{ fontWeight: 600, color: v.pestDiseasePressure.includes('High') ? '#b91c1c' : '#0f172a' }}>
                      {v.pestDiseasePressure}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Repayment Delay:</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{v.delayedRepaymentRate}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#475569' }}>
                <strong>Advisory:</strong> {v.advisoryNote}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
