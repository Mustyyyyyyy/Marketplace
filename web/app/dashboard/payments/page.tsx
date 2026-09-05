'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { Greeting, StatCard } from '@/components/DashboardBits';

export default function PaymentsPage() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('CARD');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const topUp = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(null); setBusy(true);
    try {
      const access = localStorage.getItem('access') || '';
      const r = await fetch('/api/backend/api/payments/deposit', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` }, body: JSON.stringify({ amount: Number(amount), method }) });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error || 'Top-up failed'); }
      const j = await r.json();
      setMsg(j.checkoutUrl ? `Redirecting to ${j.checkoutUrl}` : 'Top-up created.');
    } catch (e: any) { setMsg(e.message); } finally { setBusy(false); }
  };

  return (
    <DashboardShell>
      <Greeting name="payments" subtitle="Top up your wallet, manage payouts, and review your transaction history." />
      <section className="grid grid-cols-2 md:grid-cols-4 gap-space-md mb-space-xl">
        <StatCard label="Available balance" value="$0" icon="account_balance_wallet" tone="success" />
        <StatCard label="In escrow" value="$0" icon="lock" tone="info" />
        <StatCard label="Lifetime earned" value="$0" icon="trending_up" tone="success" trend="up" />
        <StatCard label="Pending payout" value="$0" icon="schedule" tone="warning" />
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
        <form onSubmit={topUp} className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm space-y-space-md">
          <h2 className="font-headline-sm text-headline-sm font-bold">Top up your wallet</h2>
          <label className="block"><span className="font-label-md text-label-md font-semibold">Amount</span><input required type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg" /></label>
          <label className="block"><span className="font-label-md text-label-md font-semibold">Method</span>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg">
              <option value="CARD">Card</option>
              <option value="BANK">Bank transfer</option>
              <option value="MOBILE_MONEY">Mobile money</option>
            </select>
          </label>
          <button disabled={busy} className="px-space-lg py-space-md rounded-xl bg-primary-container text-on-secondary-container font-label-lg text-label-lg font-bold disabled:opacity-60">{busy ? 'Working…' : 'Continue'}</button>
          {msg ? <p className="font-body-sm text-body-sm text-on-surface-variant">{msg}</p> : null}
        </form>
        <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm space-y-space-sm">
          <h2 className="font-headline-sm text-headline-sm font-bold">How payments work</h2>
          <ul className="list-disc pl-space-lg text-on-surface-variant font-body-md text-body-md space-y-1">
            <li>Customers fund the task when they accept an offer — funds sit in escrow.</li>
            <li>Taskers are paid out once the customer marks the work complete.</li>
            <li>Disputes pause the payout until our team resolves the case.</li>
            <li>Withdrawals are processed within 24 hours to your local bank or mobile money.</li>
          </ul>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Need help? <a className="text-secondary font-semibold" href="/help">Visit the help center →</a></p>
        </div>
      </div>
    </DashboardShell>
  );
}
