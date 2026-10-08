import React, { useState } from 'react';
import { Building2, Users, MapPin, IndianRupee, Briefcase, CheckCircle2 } from 'lucide-react';
import { getBranches, getStaff } from '../data/mockStore';
import { formatINR } from '../data/mockStore';

export default function BranchesStaff() {
  const branches = getBranches();
  const staff = getStaff();
  const [selectedBranchId, setSelectedBranchId] = useState('ALL');

  const filteredStaff = staff.filter(s =>
    selectedBranchId === 'ALL' || s.branchId === selectedBranchId
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
          Branches & Field Staff Operations
        </h1>
        <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          Workload allocation, portfolio distribution, and Agri Relationship Officer (ARO) field metrics
        </p>
      </div>

      {/* Branch Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {branches.map(branch => (
          <div key={branch.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                  {branch.name}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {branch.code} • {branch.district}, {branch.state}
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontWeight: 600 }}>
                {branch.id}
              </span>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Branch Manager:</span>
                <span style={{ fontWeight: 600 }}>{branch.manager}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Active Farmers:</span>
                <span style={{ fontWeight: 600 }}>{branch.activeFarmers}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Live Agri Loans:</span>
                <span style={{ fontWeight: 600 }}>{branch.activeLoans}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Total Disbursed:</span>
                <span style={{ fontWeight: 700, color: '#15803d' }}>{formatINR(branch.totalDisbursed)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Staff Section */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
              Field Relationship & Credit Sanction Officers
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Officers assigned for village camp verifications and recovery visits
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Branch:</span>
            <select value={selectedBranchId} onChange={(e) => setSelectedBranchId(e.target.value)}>
              <option value="ALL">All Branches</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Officer ID & Name</th>
                <th>Role Designation</th>
                <th>Branch Assigned</th>
                <th>Contact Details</th>
                <th>Borrowers Managed</th>
                <th>Pending Verifications</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map(st => {
                const b = branches.find(branch => branch.id === st.branchId);
                return (
                  <tr key={st.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: '#0f172a', display: 'block' }}>{st.name}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{st.id}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: '#1e3a8a', fontWeight: 500 }}>{st.role}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem' }}>{b ? b.name : st.branchId}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', display: 'block' }}>{st.phone}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{st.email}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{st.assignedFarmers} Farmers</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: st.pendingVerifications > 5 ? '#dc2626' : '#d97706' }}>
                        {st.pendingVerifications} Pending
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
