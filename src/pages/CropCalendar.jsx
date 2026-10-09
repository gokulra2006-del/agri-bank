import React, { useState } from 'react';
import { Calendar, Droplets, Clock, TrendingUp, Search, Info, IndianRupee } from 'lucide-react';
import { CROP_CALENDAR } from '../data/mockData';
import { formatINR } from '../data/mockStore';

export default function CropCalendar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('ALL');

  const filteredCrops = (CROP_CALENDAR || []).filter(c => {
    if (!c) return false;
    const term = (searchTerm || '').toLowerCase();
    const matchSearch = (c.cropName || '').toLowerCase().includes(term);
    const matchSeason = seasonFilter === 'ALL' || (c.season || '').toLowerCase().includes(seasonFilter.toLowerCase());
    return matchSearch && matchSeason;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
          Crop Calendar & Agro-Climatic Credit Scheduling
        </h1>
        <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          Aligning loan disbursement and bullet repayment maturities with crop duration and mandi liquidity
        </p>
      </div>

      {/* Rationale callout */}
      <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <Info size={18} color="#15803d" style={{ marginTop: '0.125rem' }} />
        <div style={{ fontSize: '0.8125rem', color: '#166534', lineHeight: 1.45 }}>
          <strong>Why Crop-Calendar Lending Matters in Rural Banking:</strong>
          <br />
          Standard retail banks expect monthly EMIs, forcing farmers into default during vegetative/growth stages. AgriSahay maps gestation periods so interest only accrues during cultivation and repayments occur right after mandi auctions.
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search crop name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.25rem', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Season:</span>
            <select value={seasonFilter} onChange={(e) => setSeasonFilter(e.target.value)}>
              <option value="ALL">All Seasons</option>
              <option value="Kharif">Kharif (Monsoon)</option>
              <option value="Rabi">Rabi (Winter)</option>
              <option value="Annual">Annual / Perennial</option>
              <option value="Multi">Multi-Season</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Crop Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filteredCrops.map(crop => (
          <div key={crop.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  {crop.cropName}
                </h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803d' }}>
                  {crop.season}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', backgroundColor: '#f1f5f9', borderRadius: '4px', color: '#475569', fontWeight: 500 }}>
                {crop.growthDuration}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Sowing Window:</span>
                <span style={{ fontWeight: 600 }}>{crop.sowingWindow}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Harvest Period:</span>
                <span style={{ fontWeight: 600, color: '#15803d' }}>{crop.harvestWindow}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Scale of Finance:</span>
                <span style={{ fontWeight: 700, color: '#1e3a8a' }}>{formatINR(crop.scaleOfFinancePerAcre)} / Acre</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Water Need:</span>
                <span style={{ fontWeight: 500 }}>{crop.waterRequirement}</span>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#334155', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
              <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.2rem' }}>
                Repayment Strategy:
              </strong>
              {crop.repaymentPattern}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
              <span style={{ color: '#64748b' }}>Recommended Credit Tenure:</span>
              <span style={{ fontWeight: 700, color: '#1e3a8a' }}>{crop.recommendedLoanMonths} Months</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
