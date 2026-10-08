import React, { useState } from 'react';
import {
  CalendarCheck2,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  IndianRupee,
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ConfirmationModal from '../components/ConfirmationModal';
import { formatINR } from '../data/mockStore';

export default function Repayments({ repayments = [], onUpdateRepayment }) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentModalRep, setPaymentModalRep] = useState(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState('');
  const [reminderToast, setReminderToast] = useState(null);

  const filtered = repayments.filter(r => {
    const matchSearch =
      r.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.loanId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalDue = repayments.reduce((s, r) => s + r.amountDue, 0);
  const totalCollected = repayments.reduce((s, r) => s + r.amountPaid, 0);
  const totalPending = totalDue - totalCollected;

  const handleSendReminder = (rep) => {
    onUpdateRepayment({
      ...rep,
      smsReminderSent: true
    });
    setReminderToast(`SMS Reminder dispatched to ${rep.farmerName}: "Dear Customer, your agricultural loan repayment of ${formatINR(rep.amountDue - rep.amountPaid)} is due on ${rep.dueDate}."`);
    setTimeout(() => setReminderToast(null), 4000);
  };

  const handleConfirmPayment = () => {
    if (!paymentModalRep) return;
    const paid = Number(paymentAmountInput);
    const newPaid = (paymentModalRep.amountPaid || 0) + paid;
    const newStatus = newPaid >= paymentModalRep.amountDue ? 'Paid' : 'Partially Paid';

    onUpdateRepayment({
      ...paymentModalRep,
      amountPaid: newPaid,
      status: newStatus,
      lastPaymentDate: new Date().toISOString().split('T')[0]
    });
    setPaymentModalRep(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Toast alert */}
      {reminderToast && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '0.375rem', padding: '0.75rem 1rem', fontSize: '0.8125rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} />
          {reminderToast}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
          Harvest-Linked Repayments & Collection Ledger
        </h1>
        <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          Tracking agricultural credit realizations synchronised with crop harvesting and mandi auction cycles
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Scheduled Demand</span>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>
            {formatINR(totalDue)}
          </div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Realized / Paid</span>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#15803d', marginTop: '0.25rem' }}>
            {formatINR(totalCollected)}
          </div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Outstanding Balance</span>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#b91c1c', marginTop: '0.25rem' }}>
            {formatINR(totalPending)}
          </div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Recovery Percentage</span>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1e3a8a', marginTop: '0.25rem' }}>
            {totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search farmer or loan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.25rem', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Status:</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Schedules</option>
              <option value="Due Soon">Due Soon</option>
              <option value="Overdue">Overdue</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Repayments Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Schedule ID & Loan</th>
                <th>Farmer Name</th>
                <th>Crop Harvest Cycle</th>
                <th>Due Date</th>
                <th>Amount Due</th>
                <th>Amount Realized</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No matching repayment records found.
                  </td>
                </tr>
              ) : (
                filtered.map((rep) => (
                  <tr key={rep.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: '#1e3a8a', display: 'block' }}>{rep.id}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{rep.loanId} (Inst #{rep.installmentNumber})</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{rep.farmerName}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: '#475569' }}>{rep.cropSeason}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: rep.status === 'Overdue' ? '#dc2626' : '#0f172a' }}>
                        {rep.dueDate}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{formatINR(rep.amountDue)}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#15803d' }}>{formatINR(rep.amountPaid)}</span>
                      {rep.lastPaymentDate && (
                        <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>
                          On {rep.lastPaymentDate}
                        </span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={rep.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        {rep.status !== 'Paid' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleSendReminder(rep)}
                            title="Send SMS Payment Reminder"
                          >
                            <Send size={13} />
                            {rep.smsReminderSent ? 'Resend SMS' : 'Send SMS'}
                          </button>
                        )}
                        {rep.status !== 'Paid' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setPaymentModalRep(rep);
                              setPaymentAmountInput(rep.amountDue - rep.amountPaid);
                            }}
                          >
                            Record Payment
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {paymentModalRep && (
        <div className="modal-overlay" onClick={() => setPaymentModalRep(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
              Record Payment Receipt
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1rem' }}>
              Receiving installment for {paymentModalRep.farmerName} ({paymentModalRep.loanId}).
            </p>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                Payment Amount Collected (₹)
              </label>
              <input
                type="number"
                value={paymentAmountInput}
                onChange={(e) => setPaymentAmountInput(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setPaymentModalRep(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleConfirmPayment}>Confirm & Post Receipt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
