import React from 'react';
import { HelpCircle, FileCheck2, Calendar, ShieldCheck, PhoneCall, CheckCircle2, AlertCircle } from 'lucide-react';

export default function HelpDesk() {
  const faqs = [
    {
      q: '1. What documents are required for an Agricultural Crop Loan (KCC)?',
      a: 'Farmers need: (1) Copy of Land Record (RTC / 7-12 extract or Patta), (2) Masked Aadhaar Card for e-KYC, (3) Active Bank Passbook copy, and (4) Sowing certificate or declaration from the Village Administrative Officer.'
    },
    {
      q: '2. How does crop-calendar repayment work instead of monthly EMI?',
      a: 'Unlike salaried loans, crop loans recognize that farmers earn income only after harvest and mandi auctions. Therefore, principal and interest are structured as a bullet payment due 30 to 45 days post-harvest (e.g. December for Kharif crops, April for Rabi crops).'
    },
    {
      q: '3. What is the 3% Prompt Repayment Incentive (Interest Subvention)?',
      a: 'Under the Government Modified Interest Subvention Scheme (MISS), standard crop loans up to Rs. 3 Lakh carry a concessional interest rate of 7%. Farmers who repay their dues on or before the harvest due date receive an extra 3% interest rebate, making the net effective borrowing rate only 4% per year!'
    },
    {
      q: '4. How does PMFBY Crop Insurance protect my loan?',
      a: 'Pradhan Mantri Fasal Bima Yojana (PMFBY) covers crop losses resulting from localized hail, floods, unseasonal rain, or pest attacks. The premium for Kharif crops is only 2%, and for Rabi crops is 1.5%. If a notified natural calamity occurs, claim payouts directly credit your loan account.'
    },
    {
      q: '5. What happens after submitting a loan application?',
      a: 'The branch assigns an Agriculture Relationship Officer (ARO) to visit your field. The officer verifies survey boundaries, examines crop emergence, and checks water availability. Once the field verification report is uploaded, the Credit Sanction Committee approves the loan and funds are disbursed to your account.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '52rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
          Farmer Support & Financial Literacy Desk
        </h1>
        <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          Simple, non-technical guidance explaining agricultural credit, document checklists, and harvest repayments
        </p>
      </div>

      {/* Branch Contact Card */}
      <div className="card" style={{ padding: '1.25rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#15803d' }}>
            <PhoneCall size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#14532d' }}>
              Branch Agricultural Helpline & Field Help
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#166534' }}>
              Free advisory for smallholder and marginal farmers (Demo Contact)
            </span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.8125rem', color: '#14532d' }}>
          <div>
            <strong>Toll-Free Helpline (Demo):</strong>
            <p>1800-425-0099 (Mon–Sat, 9:00 AM – 5:00 PM)</p>
          </div>
          <div>
            <strong>Village Camp Office:</strong>
            <p>Plot #14, APMC Yard Road, Mandya Central, Karnataka</p>
          </div>
        </div>
      </div>

      {/* Step by step procedure */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
          4 Easy Steps to Your Agriculture Loan
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {[
            { step: '1', title: 'Registration & KYC', desc: 'Submit RTC / 7-12 extract, Aadhaar, and bank passbook with your field officer.' },
            { step: '2', title: 'Farm Inspection', desc: 'Officer visits your land to verify crop sowing, soil, and irrigation access.' },
            { step: '3', title: 'Scale of Finance Limit', desc: 'Credit amount is fixed according to district crop cultivation guidelines.' },
            { step: '4', title: 'Post-Harvest Repayment', desc: 'Pay back comfortably after harvesting and selling your produce in the mandi.' }
          ].map(s => (
            <div key={s.step} style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#15803d', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                {s.step}
              </div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>{s.title}</h4>
              <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
          Frequently Asked Questions (Farmer Knowledge Base)
        </h3>

        {faqs.map((f, i) => (
          <div key={i} style={{ borderBottom: i === faqs.length - 1 ? 'none' : '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e3a8a', marginBottom: '0.25rem' }}>
              {f.q}
            </h4>
            <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5 }}>
              {f.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
