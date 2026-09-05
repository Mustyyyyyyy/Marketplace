'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FirebaseAuthButton from '@/components/FirebaseAuthButton';
import { setTokens, setCachedUser, fetchMe } from '@/lib/auth';

const COUNTRIES = [
  { code: 'US', name: 'United States', currency: 'USD', phone: '+1' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', phone: '+44' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', phone: '+234' },
  { code: 'IE', name: 'Ireland', currency: 'EUR', phone: '+353' },
  { code: 'DE', name: 'Germany', currency: 'EUR', phone: '+49' },
  { code: 'FR', name: 'France', currency: 'EUR', phone: '+33' },
  { code: 'NL', name: 'Netherlands', currency: 'EUR', phone: '+31' },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', phone: '+27' },
  { code: 'KE', name: 'Kenya', currency: 'KES', phone: '+254' },
  { code: 'GH', name: 'Ghana', currency: 'GHS', phone: '+233' },
  { code: 'IN', name: 'India', currency: 'INR', phone: '+91' },
];

export default function GetStartedPage() {
  const router = useRouter();
  const [role, setRole] = useState<'CUSTOMER' | 'TASKER'>('CUSTOMER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+44');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [country, setCountry] = useState('GB');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const c = COUNTRIES.find((x) => x.code === country);
    if (c) setPhone(c.phone);
  }, [country]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const c = COUNTRIES.find((x) => x.code === country)!;
    try {
      const r = await fetch('/api/backend/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          phone,
          role,
          displayName: name,
          country,
          currency: c.currency,
          locale: 'en',
        }),
      });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error || 'Registration failed'); }
      // Auto-login so the user is authed when they reach /verify-identity.
      const lr = await fetch('/api/backend/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const j = await lr.json();
      if (j?.accessToken) {
        setTokens(j.accessToken, j.refreshToken);
        // Pre-warm /me so the next page renders instantly.
        await fetchMe(true);
      }
      router.push('/verify-identity');
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const onFirebaseSuccess = async (j: any) => {
    if (j?.accessToken) {
      setTokens(j.accessToken, j.refreshToken);
      await fetchMe(true);
    }
    router.push('/verify-identity');
  };

  return (
    <main className="w-full min-h-screen bg-surface flex items-center justify-center px-gutter-mobile py-space-3xl">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-md p-space-xl border border-outline-variant">
        <div className="flex items-center gap-space-sm mb-space-lg">
          <span className="material-symbols-outlined text-3xl text-secondary">task_alt</span>
          <span className="font-headline-sm text-headline-sm font-bold text-on-surface">TaskSphere</span>
        </div>
        <div className="flex items-center gap-space-sm">
          <span className="px-space-sm py-1 rounded-full bg-secondary text-on-secondary text-[10px] font-bold uppercase">Step 1 of 2 · Profile</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mt-space-sm">Create your account</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1 mb-space-lg">
          Tell us who you are. Next we&apos;ll verify your identity based on your country.
        </p>
        {err ? <div className="bg-error-container text-on-error-container rounded-xl p-space-sm mb-space-md text-sm">{err}</div> : null}

        <FirebaseAuthButton mode="signup" role={role} onSuccess={onFirebaseSuccess} onError={(m) => setErr(m)} disabled={loading} />

        <div className="my-space-md flex items-center gap-space-sm">
          <div className="flex-1 h-px bg-outline-variant" />
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">or with email</span>
          <div className="flex-1 h-px bg-outline-variant" />
        </div>

        <div className="grid grid-cols-2 gap-space-xs mb-space-md">
          {(['CUSTOMER', 'TASKER'] as const).map((r) => (
            <button key={r} type="button" onClick={() => setRole(r)} className={`px-space-md py-space-md rounded-xl font-label-lg text-label-lg font-semibold border-2 transition-all ${role === r ? 'border-secondary bg-secondary-fixed text-secondary' : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant'}`}>
              {r === 'CUSTOMER' ? 'I need a tasker' : 'I want to earn'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="flex flex-col gap-space-md">
          <label className="flex flex-col gap-1">
            <span className="font-label-md text-label-md font-semibold text-on-surface">Full name</span>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="bg-surface-container-low px-space-md py-space-sm rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-secondary" autoComplete="name" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-label-md text-label-md font-semibold text-on-surface">Email</span>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-surface-container-low px-space-md py-space-sm rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-secondary" autoComplete="email" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-label-md text-label-md font-semibold text-on-surface">Phone</span>
            <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-surface-container-low px-space-md py-space-sm rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-secondary" autoComplete="tel" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-label-md text-label-md font-semibold text-on-surface">Password</span>
            <div className="relative">
              <input required minLength={8} type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-surface-container-low px-space-md py-space-sm pr-12 rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-secondary" autoComplete="new-password" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-space-sm top-1/2 -translate-y-1/2 text-on-surface-variant font-label-md text-label-md font-semibold">{show ? 'Hide' : 'Show'}</button>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Minimum 8 characters</span>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-label-md text-label-md font-semibold text-on-surface">Country</span>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="bg-surface-container-low px-space-md py-space-sm rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-secondary">
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </label>
          <button disabled={loading} className="mt-space-xs px-space-xl py-space-md rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold hover:bg-inverse-surface transition-all disabled:opacity-60">
            {loading ? 'Creating…' : 'Continue to verification →'}
          </button>
        </form>
        <p className="text-on-surface-variant font-body-sm text-body-sm mt-space-md">By creating an account you agree to our <Link className="text-secondary font-semibold" href="/terms">Terms</Link> and <Link className="text-secondary font-semibold" href="/privacy">Privacy policy</Link>.</p>
        <p className="text-center mt-space-lg text-on-surface-variant font-body-md text-body-md">Already have an account? <Link className="text-secondary font-semibold" href="/sign-in">Sign in</Link></p>
      </div>
    </main>
  );
}
