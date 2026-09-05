'use client';
import MarketingHeader from '@/components/MarketingHeader';
import Footer from '@/components/Footer';
import { PageShell, PageHeader, Card } from '@/components/Page';
import { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'general', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('Contact submissions are not configured yet. Please use one of the direct email channels.');
  };

  return (
    <>
      <MarketingHeader />
      <PageShell>
        <PageHeader eyebrow="Contact" title="Get in touch" subtitle="We read every message. Most get a reply within 24 hours, Monday–Friday." />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg max-w-5xl mx-auto">
          <Card className="lg:col-span-2">
            {sent ? (
              <div className="py-space-md text-center">
                <span className="material-symbols-outlined text-5xl text-on-tertiary-container">verified</span>
                <h2 className="font-headline-sm text-headline-sm font-bold mt-space-sm">Thanks — message received</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">We'll be in touch within one business day.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-space-md">
                {error ? <div className="bg-error-container text-on-error-container rounded-xl p-space-sm text-sm">{error}</div> : null}
                <div className="grid grid-cols-2 gap-space-md">
                  <label><span className="font-label-md text-label-md font-semibold">Name</span><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg" /></label>
                  <label><span className="font-label-md text-label-md font-semibold">Email</span><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg" /></label>
                </div>
                <label className="block"><span className="font-label-md text-label-md font-semibold">Subject</span>
                  <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg">
                    <option value="general">General question</option>
                    <option value="support">Customer support</option>
                    <option value="partnership">Partnership</option>
                    <option value="press">Press</option>
                    <option value="legal">Legal</option>
                  </select>
                </label>
                <label className="block"><span className="font-label-md text-label-md font-semibold">Message</span>
                  <textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg" />
                </label>
                <button type="submit" className="w-full px-space-xl py-space-md rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold hover:bg-inverse-surface transition-all">Send message</button>
              </form>
            )}
          </Card>
          <Card>
            <h3 className="font-headline-sm text-headline-sm font-bold">Direct channels</h3>
            <ul className="mt-space-sm space-y-space-sm font-body-md text-body-md text-on-surface-variant">
              <li><strong>Support:</strong> support@tasksphere.example</li>
              <li><strong>Trust &amp; Safety:</strong> trust@tasksphere.example</li>
              <li><strong>Press:</strong> press@tasksphere.example</li>
              <li><strong>Partnerships:</strong> partners@tasksphere.example</li>
              <li><strong>Legal:</strong> legal@tasksphere.example</li>
            </ul>
            <h3 className="font-headline-sm text-headline-sm font-bold mt-space-lg">Offices</h3>
            <ul className="mt-space-sm space-y-space-sm font-body-md text-body-md text-on-surface-variant">
              <li>Lagos · 1 Market Square</li>
              <li>London · 25 Old Street</li>
              <li>New York · 50 Bond Street</li>
              <li>Berlin · 12 Mitte Platz</li>
            </ul>
          </Card>
        </div>
      </PageShell>
      <Footer />
    </>
  );
}
