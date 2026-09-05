'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { Greeting } from '@/components/DashboardBits';
import ImageUploader from '@/components/ImageUploader';

const COUNTRIES = [{ code: 'GB', name: 'United Kingdom', currency: 'GBP' }, { code: 'NG', name: 'Nigeria', currency: 'NGN' }, { code: 'US', name: 'United States', currency: 'USD' }, { code: 'DE', name: 'Germany', currency: 'EUR' }, { code: 'FR', name: 'France', currency: 'EUR' }, { code: 'IE', name: 'Ireland', currency: 'EUR' }, { code: 'NL', name: 'Netherlands', currency: 'EUR' }];
const CURRENCIES = ['NGN', 'USD', 'EUR', 'GBP'];

export default function NewTaskPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', description: '', mode: 'REMOTE', budgetType: 'FIXED', budgetAmount: '', currency: 'GBP', country: 'GB', city: '', categoryId: '' });
  const [categories, setCategories] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [publish, setPublish] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [coverImage, setCoverImage] = useState<string | null>(null);

  useEffect(() => { fetch('/api/backend/api/categories').then((r) => r.json()).then((j) => setCategories(j.categories || [])); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const amt = Number(form.budgetAmount);
    if (!form.title || form.title.length < 3) return setErr('Title too short');
    if (!form.description || form.description.length < 10) return setErr('Description too short');
    if (!amt || amt <= 0) return setErr('Budget must be positive');
    setLoading(true);
    try {
      const access = localStorage.getItem('access') || '';
      const r = await fetch('/api/backend/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` }, body: JSON.stringify({ ...form, budgetAmount: amt, categoryId: form.categoryId || undefined, city: form.city || undefined }) });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error || 'Create failed'); }
      const t = await r.json();
      if (coverImage) { await fetch(`/api/backend/api/tasks/${t.id}/media`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` }, body: JSON.stringify({ url: coverImage, kind: 'IMAGE' }) }).catch(() => null); }
      if (publish) { await fetch(`/api/backend/api/tasks/${t.id}/publish`, { method: 'POST', headers: { Authorization: `Bearer ${access}` } }); }
      router.push(`/tasks/${t.id}`);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <DashboardShell>
      <Greeting
        name="a new task"
        subtitle="Tell us what you need. Three quick steps and you\u2019ll be receiving offers in minutes."
        action={
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((n) => (
              <span key={n} className={`w-8 h-8 rounded-full font-label-lg text-label-lg font-bold flex items-center justify-center ${n <= step ? 'bg-primary-container text-on-secondary-container' : 'bg-surface-container text-on-surface-variant'}`}>{n}</span>
            ))}
          </div>
        }
      />

      <form onSubmit={submit} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-space-lg space-y-space-md max-w-3xl">
        {err ? <div className="bg-error-container text-on-error-container rounded-xl p-space-sm text-sm">{err}</div> : null}

        {step === 1 ? (
          <>
            <h2 className="font-headline-sm text-headline-sm font-bold">What do you need done?</h2>
            <label className="block"><span className="font-label-md text-label-md font-semibold">Title</span><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Fix leaking kitchen sink" className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg" /></label>
            <label className="block"><span className="font-label-md text-label-md font-semibold">Description</span><textarea required rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg" placeholder="Describe the task in detail" /></label>
            <div className="flex justify-end">
              <button type="button" onClick={() => setStep(2)} className="px-space-lg py-space-md rounded-xl bg-primary-container text-on-secondary-container font-label-lg text-label-lg font-bold">Continue</button>
            </div>
          </>
        ) : step === 2 ? (
          <>
            <h2 className="font-headline-sm text-headline-sm font-bold">Budget &amp; mode</h2>
            <div className="grid grid-cols-2 gap-space-md">
              <label className="block"><span className="font-label-md text-label-md font-semibold">Mode</span>
                <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg">
                  <option value="REMOTE">Remote</option><option value="LOCAL">Local</option>
                </select>
              </label>
              <label className="block"><span className="font-label-md text-label-md font-semibold">Type</span>
                <select value={form.budgetType} onChange={(e) => setForm({ ...form, budgetType: e.target.value })} className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg">
                  <option value="FIXED">Fixed price</option><option value="HOURLY">Hourly</option>
                </select>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-space-md">
              <label className="block"><span className="font-label-md text-label-md font-semibold">Amount</span><input required type="number" value={form.budgetAmount} onChange={(e) => setForm({ ...form, budgetAmount: e.target.value })} className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg" /></label>
              <label className="block"><span className="font-label-md text-label-md font-semibold">Currency</span>
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg">
                  {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(1)} className="px-space-lg py-space-md rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg font-bold">Back</button>
              <button type="button" onClick={() => setStep(3)} className="px-space-lg py-space-md rounded-xl bg-primary-container text-on-secondary-container font-label-lg text-label-lg font-bold">Continue</button>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-headline-sm text-headline-sm font-bold">Location &amp; category</h2>
            <div className="grid grid-cols-2 gap-space-md">
              <label className="block"><span className="font-label-md text-label-md font-semibold">Country</span>
                <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value, currency: COUNTRIES.find((c) => c.code === e.target.value)?.currency || form.currency })} className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg">
                  {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </label>
              <label className="block"><span className="font-label-md text-label-md font-semibold">City (optional)</span><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg" /></label>
            </div>
            <label className="block"><span className="font-label-md text-label-md font-semibold">Category</span>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg">
                <option value="">— None —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <div>
              <ImageUploader kind="task-media" value={coverImage} onChange={setCoverImage} shape="wide" label="Cover image (optional)" />
            </div>
            <label className="flex items-center gap-2 text-body-md"><input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} /> Publish immediately</label>
            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(2)} className="px-space-lg py-space-md rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg font-bold">Back</button>
              <button disabled={loading} className="px-space-lg py-space-md rounded-xl bg-primary-container text-on-secondary-container font-label-lg text-label-lg font-bold disabled:opacity-60">{loading ? 'Saving…' : publish ? 'Publish task' : 'Save draft'}</button>
            </div>
          </>
        )}
      </form>
    </DashboardShell>
  );
}
