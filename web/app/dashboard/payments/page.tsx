'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { Greeting, StatCard } from '@/components/DashboardBits';

type Payment = {
  id: string;
  hireId: string;
  grossAmount: number;
  platformFee: number;
  taskerAmount: number;
  currency: string;
  status: string;
  createdAt: string;
};

export default function PaymentsPage() {
  const [hireId, setHireId] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [wallet, setWallet] = useState({ escrow: 0, earnings: 0, withdrawn: 0, available: 0 });
  const [connect, setConnect] = useState<{ connected: boolean; accountName?: string } | null>(null);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('GBP');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [country, setCountry] = useState('NG');
  const [banks, setBanks] = useState<Array<{ code: string; name: string }>>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const access = localStorage.getItem('access') || '';
    const headers = { Authorization: `Bearer ${access}` };
    const [paymentsResponse, connectResponse] = await Promise.all([
      fetch('/api/backend/api/payments/mine', { headers }),
      fetch('/api/backend/api/payments/connect/status', { headers }),
    ]);
    if (paymentsResponse.ok) {
      const result = await paymentsResponse.json();
      setPayments(Array.isArray(result.payments) ? result.payments : []);
      setWallet(result.wallet && typeof result.wallet === 'object' ? result.wallet : { escrow: 0, earnings: 0, withdrawn: 0, available: 0 });
    }
    if (connectResponse.ok) setConnect(await connectResponse.json());
  };

  useEffect(() => {
    setHireId(new URLSearchParams(window.location.search).get('hireId'));
    void load();
    const timer = window.setInterval(() => void load(), 5000);
    const refresh = () => void load();
    window.addEventListener('focus', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, []);

  useEffect(() => {
    if (connect?.connected) return;
    const access = localStorage.getItem('access') || '';
    fetch(`/api/backend/api/payments/connect/banks/${country}`, { headers: { Authorization: `Bearer ${access}` } })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Unable to load banks.')))
      .then((result) => setBanks(Array.isArray(result.banks) ? result.banks : []))
      .catch(() => setBanks([]));
  }, [country, connect?.connected]);

  const startCheckout = async () => {
    if (!hireId) return;
    setBusy(true); setMessage(null);
    try {
      const access = localStorage.getItem('access') || '';
      const response = await fetch(`/api/backend/api/payments/hires/${hireId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` },
        body: JSON.stringify({ redirectUrl: `${window.location.origin}/dashboard/payments?paid=1` }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.checkoutUrl) throw new Error(result.error || 'Unable to start checkout.');
      window.location.assign(result.checkoutUrl);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to start checkout.');
      setBusy(false);
    }
  };

  const startBankSetup = async () => {
    setBusy(true); setMessage(null);
    try {
      const access = localStorage.getItem('access') || '';
      const response = await fetch('/api/backend/api/payments/connect/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` },
        body: JSON.stringify({ bankCode, accountNumber, country }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Unable to verify bank account.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to open bank setup.');
      setBusy(false);
    }
  };

  const requestPayout = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage(null);
    try {
      const access = localStorage.getItem('access') || '';
      const response = await fetch('/api/backend/api/payments/connect/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` },
        body: JSON.stringify({ amount: Number(amount), currency }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Unable to request payout.');
      setMessage(`Payout ${result.status}. Flutterwave is processing it to your connected bank account.`);
      setAmount('');
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to request payout.');
    } finally {
      setBusy(false);
    }
  };

  const pending = payments.filter((payment) => ['PROCESSING', 'REQUIRES_PAYMENT'].includes(payment.status)).length;

  return (
    <DashboardShell>
      <Greeting name="payments" subtitle="Customers pay securely before work starts. Taskers receive 80% after completion, with 20% retained by TaskSphere." />
      {message ? <div className="mb-space-md rounded-xl border border-outline-variant bg-surface-container-low p-space-md text-on-surface-variant">{message}</div> : null}

      {hireId ? (
        <section className="mb-space-xl rounded-2xl border border-secondary bg-secondary-container p-space-lg">
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-secondary-container">Payment required for this hire</h2>
          <p className="mt-1 text-on-secondary-container">Your payment is held securely until the work is accepted. The tasker receives 80% after completion.</p>
          <button onClick={startCheckout} disabled={busy} className="mt-space-md rounded-xl bg-secondary px-space-lg py-space-sm font-label-lg text-label-lg font-bold text-on-secondary disabled:opacity-60">
            {busy ? 'Opening checkout…' : 'Pay securely with Flutterwave'}
          </button>
        </section>
      ) : null}

      <section className="mb-space-xl grid grid-cols-2 gap-space-md md:grid-cols-4">
        <StatCard label="Available wallet" value={`£${wallet.available.toLocaleString()}`} icon="account_balance_wallet" tone="success" />
        <StatCard label="In escrow" value={`£${wallet.escrow.toLocaleString()}`} icon="lock" tone="info" />
        <StatCard label="Pending payments" value={pending} icon="schedule" tone="warning" />
        <StatCard label="Transactions" value={payments.length} icon="receipt_long" tone="neutral" />
      </section>

      <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-2">
        <section className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm">
          <h2 className="font-headline-sm text-headline-sm font-bold">Receive payouts locally</h2>
          <p className="mt-1 text-on-surface-variant">Verify your local bank account through Flutterwave. Bank availability and settlement times depend on your country.</p>
          <button onClick={startBankSetup} disabled={busy} className="mt-space-md rounded-xl bg-primary-container px-space-lg py-space-sm font-label-lg text-label-lg font-bold text-on-primary disabled:opacity-60">
            {connect?.connected ? `Bank verified: ${connect.accountName || 'ready'}` : 'Verify bank account'}
          </button>
          {!connect?.connected ? (
            <div className="mt-space-md grid grid-cols-1 gap-space-sm sm:grid-cols-3">
              <select value={country} onChange={(event) => setCountry(event.target.value)} className="rounded-lg bg-surface-container-low px-space-md py-space-sm"><option value="NG">Nigeria</option><option value="GH">Ghana</option><option value="KE">Kenya</option><option value="ZA">South Africa</option></select>
              <select value={bankCode} onChange={(event) => setBankCode(event.target.value)} className="rounded-lg bg-surface-container-low px-space-md py-space-sm"><option value="">Select bank</option>{banks.map((bank) => <option key={bank.code} value={bank.code}>{bank.name}</option>)}</select>
              <input value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} placeholder="Account number" inputMode="numeric" className="rounded-lg bg-surface-container-low px-space-md py-space-sm" />
            </div>
          ) : null}
          {connect?.connected ? (
            <form onSubmit={requestPayout} className="mt-space-lg space-y-space-sm border-t border-outline-variant pt-space-lg">
              <h3 className="font-label-lg text-label-lg font-bold">Withdraw available earnings</h3>
              <div className="flex gap-space-sm">
                <input required min="1" type="number" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount" className="min-w-0 flex-1 rounded-lg bg-surface-container-low px-space-md py-space-sm" />
                <select value={currency} onChange={(event) => setCurrency(event.target.value)} className="rounded-lg bg-surface-container-low px-space-md py-space-sm"><option>GBP</option><option>USD</option><option>EUR</option></select>
              </div>
              <button disabled={busy} className="rounded-xl bg-tertiary px-space-lg py-space-sm font-label-md text-label-md font-bold text-on-tertiary disabled:opacity-60">Request bank payout</button>
            </form>
          ) : null}
        </section>

        <section className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm">
          <h2 className="font-headline-sm text-headline-sm font-bold">Transaction history</h2>
          {payments.length === 0 ? <p className="mt-space-md text-on-surface-variant">No payments yet.</p> : (
            <div className="mt-space-md space-y-space-sm">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between gap-space-sm rounded-xl bg-surface-container-low p-space-sm">
                  <div><p className="font-label-md text-label-md font-semibold">{payment.currency} {payment.grossAmount.toLocaleString()}</p><p className="text-xs text-on-surface-variant">{new Date(payment.createdAt).toLocaleDateString()}</p></div>
                  <span className="rounded-full bg-surface-container px-space-sm py-1 text-[10px] font-bold uppercase">{payment.status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
