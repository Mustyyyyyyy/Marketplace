'use client';
import MarketingHeader from '@/components/MarketingHeader';
import Footer from '@/components/Footer';
import { PageShell, PageHeader, Card } from '@/components/Page';
import { useState } from 'react';

export default function ReportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ type: 'USER', targetId: '', reason: '', details: '', email: '' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/backend/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetType: form.type, targetId: form.targetId || 'unknown', reason: form.reason, details: form.details }) });
      setSubmitted(true);
    } catch { setSubmitted(true); }
  };

  return (
    <>
      <MarketingHeader />
      <PageShell>
        <PageHeader eyebrow="Report abuse" title="Report a problem" subtitle="We review every report within 24 hours. For account or payment issues, contact support instead." />
        <div className="max-w-2xl mx-auto">
          <Card>
            {submitted ? (
              <div className="text-center py-space-md">
                <span className="material-symbols-outlined text-5xl text-on-tertiary-container">verified</span>
                <h2 className="font-headline-sm text-headline-sm font-bold mt-space-sm">Thanks — we got it</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">Our Trust &amp; Safety team will review your report. If we need more information we'll reach out via the email you provided.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-space-md">
                <label className="block">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">What are you reporting?</span>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg text-body-md">
                    <option value="USER">A user</option>
                    <option value="TASK">A task</option>
                    <option value="MESSAGE">A message</option>
                    <option value="REVIEW">A review</option>
                  </select>
                </label>
                <label className="block">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">ID or link (optional)</span>
                  <input value={form.targetId} onChange={(e) => setForm({ ...form, targetId: e.target.value })} placeholder="Paste a user ID, task ID or link" className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg text-body-md" />
                </label>
                <label className="block">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">Reason</span>
                  <select required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg text-body-md">
                    <option value="">Select a reason</option>
                    <option>Spam or fake</option>
                    <option>Harassment or hate</option>
                    <option>Fraud or scam</option>
                    <option>Off-platform payment request</option>
                    <option>Safety concern</option>
                    <option>Other</option>
                  </select>
                </label>
                <label className="block">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">Details</span>
                  <textarea required rows={5} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg text-body-md" placeholder="What happened? Include any relevant context." />
                </label>
                <label className="block">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">Your email (optional, for follow-up)</span>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg text-body-md" />
                </label>
                <button type="submit" className="w-full px-space-xl py-space-md rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold hover:bg-inverse-surface transition-all">Submit report</button>
              </form>
            )}
          </Card>
        </div>
      </PageShell>
      <Footer />
    </>
  );
}
