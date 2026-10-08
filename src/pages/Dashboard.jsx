import React from 'react';
import {
  Users,
  FileClock,
  CheckCircle2,
  TrendingUp,
  Landmark,
  UserPlus,
  PlusCircle,
  AlertTriangle,
  ArrowRight,
  Send,
  CalendarCheck2
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { MonthlyApplicationsBarChart, LoanStatusDistribution } from '../components/SimpleChart';
import { formatINR } from '../data/mockStore';

export default function Dashboard({
  farmers = [],
  loans = [],
  repayments = [],
  onNavigate,
  onOpenRegisterFarmer,
  onOpenNewLoan
}) {
  const totalFarmers = farmers.length;
  const pendingLoans = loans.filter(l => l.status === 'Submitted' || l.status === 'Under Review').length;
  const approvedLoans = loans.filter(l => l.status === 'Approved').length;
  const activeLoans = loans.filter(l => l.status === 'Disbursed').length;

  const totalDisbursedAmt = loans
    .filter(l => l.status === 'Disbursed')
    .reduce((sum, l) => sum + (l.sanctionedAmount || 0), 0);

  // Collection calculation
  const totalDueAmt = repayments.reduce((sum, r) => sum + r.amountDue, 0);
  const totalPaidAmt = repayments.reduce((sum, r) => sum + r.amountPaid, 0);
  const collectionRate = totalDueAmt > 0 ? Math.round((totalPaidAmt / totalDueAmt) * 100) : 0;

  // Monthly trends mock data
  const monthlyData = [
    { month: 'Jul', value: 8 },
    { month: 'Aug', value: 14 },
    { month: 'Sep', value: 18 },
    { month: 'Oct', value: 24 },
    { month: 'Nov', value: 29 },
    { month: 'Dec', value: 34 }
  ];

  // Status map
  const statusCounts = loans.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});

  const recentLoans = [...loans].slice(-4).reverse();
  const upcomingRepayments = repayments.filter(r => r.status === 'Due Soon' || r.status === 'Overdue');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header with Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
            Agriculture Credit Overview
          </h1>
          <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            Ujjivan SFB Agriculture Banking Desk & Rural Credit Lifecycle Monitor
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              backgroundColor: '#047857',
              color: '#ffffff',
              padding: '0.5rem 0.875rem',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={() => onNavigate('innovation-center')}
          >
            ✨ Innovation Center (10 New Features)
          </button>
          <button
            className="btn btn-secondary"
            onClick={onOpenRegisterFarmer}
          >
            <UserPlus size={16} />
            Register Farmer
          </button>
          <button
            className="btn btn-primary"
            onClick={onOpenNewLoan}
          >
            <PlusCircle size={16} />
            New Loan Application
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <MetricCard
          title="Total Farmers"
          value={totalFarmers}
          subtitle="Registered in Branch Service Area"
          icon={Users}
          badgeText="+12% MoM"
          badgeColor="green"
        />
        <MetricCard
          title="Pending Applications"
          value={pendingLoans}
          subtitle="Awaiting Field / Credit Sanction"
          icon={FileClock}
          badgeText="Action Needed"
          badgeColor="amber"
        />
        <MetricCard
          title="Sanctioned / Approved"
          value={approvedLoans}
          subtitle="Ready for documentation & payout"
          icon={CheckCircle2}
          badgeText="Pipeline"
          badgeColor="blue"
        />
        <MetricCard
          title="Active Disbursed Loans"
          value={activeLoans}
          subtitle={`Total Portfolio: ${formatINR(totalDisbursedAmt)}`}
          icon={Landmark}
          badgeText="Live"
          badgeColor="green"
        />
        <MetricCard
          title="Collection Efficiency"
          value={`${collectionRate}%`}
          subtitle={`${formatINR(totalPaidAmt)} of ${formatINR(totalDueAmt)} collected`}
          icon={TrendingUp}
          badgeText="Harvest Tied"
          badgeColor="green"
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Monthly Inflow Chart */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a' }}>
                Monthly Agri-Loan Applications
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Seasonal spike observed during Kharif sowing (July-Oct)
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803d', backgroundColor: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              CY 2025-26
            </span>
          </div>
          <MonthlyApplicationsBarChart data={monthlyData} />
        </div>

        {/* Portfolio Status Distribution */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a' }}>
                Loan Portfolio Pipeline
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Status distribution of current agricultural loan accounts
              </p>
            </div>
            <button
              onClick={() => onNavigate('loans')}
              style={{ background: 'none', border: 'none', color: '#1e3a8a', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
            >
              View Pipeline →
            </button>
          </div>
          <LoanStatusDistribution statusCounts={statusCounts} />
        </div>
      </div>

      {/* Tables Row: Recent Applications & Upcoming Repayments */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {/* Recent Applications */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a' }}>
                Recent Loan Applications
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Latest submissions from branch field officers
              </p>
            </div>
            <button
              onClick={() => onNavigate('loans')}
              style={{ background: 'none', border: 'none', color: '#1e3a8a', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
            >
              See all ({loans.length}) →
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Farmer</th>
                  <th>Crop / Land</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLoans.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: '#1e3a8a', display: 'block' }}>{l.id}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{l.appliedDate}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, color: '#0f172a', display: 'block' }}>{l.farmerName}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{l.farmerId}</span>
                    </td>
                    <td>
                      <span style={{ display: 'block', fontWeight: 500 }}>{l.crop}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{l.landAcreage} Acres</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{formatINR(l.appliedAmount)}</span>
                    </td>
                    <td>
                      <StatusBadge status={l.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Repayment Reminders */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a' }}>
                Upcoming Harvest Repayments
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Harvest-linked seasonal due dates
              </p>
            </div>
            <button
              onClick={() => onNavigate('repayments')}
              style={{ background: 'none', border: 'none', color: '#1e3a8a', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Manage ({repayments.length}) →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {upcomingRepayments.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8125rem' }}>
                No pending harvest repayments due soon.
              </div>
            ) : (
              upcomingRepayments.map((rep) => (
                <div
                  key={rep.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #e2e8f0',
                    backgroundColor: rep.status === 'Overdue' ? '#fef2f2' : '#f8fafc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#0f172a' }}>
                        {rep.farmerName}
                      </span>
                      <StatusBadge status={rep.status} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                      Due Date: <strong>{rep.dueDate}</strong> • {rep.cropSeason}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803d' }}>
                      Outstanding: {formatINR(rep.amountDue - rep.amountPaid)}
                    </span>
                  </div>

                  <div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => alert(`Simulated SMS Reminder sent to ${rep.farmerName} for due date ${rep.dueDate}.`)}
                      title="Send SMS Reminder"
                    >
                      <Send size={13} />
                      Reminder
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
