'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { Greeting, StatCard } from '@/components/DashboardBits';
import ImageUploader from '@/components/ImageUploader';
export default function ProfilePage() {
  const [me, setMe] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({ displayName: '', country: 'GB', currency: 'GBP', locale: 'en', bio: '' });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPublicId, setAvatarPublicId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const access = localStorage.getItem('access') || '';
    fetch('/api/backend/api/auth/me', { headers: { Authorization: `Bearer ${access}` } }).then((r) => r.json()).then((j) => setMe(j.user));
    fetch('/api/backend/api/profile/me', { headers: { Authorization: `Bearer ${access}` } }).then((r) => r.json()).then((j) => {
      setProfile(j.profile);
      setForm({
        displayName: j.profile.displayName || '',
        country: j.profile.country || 'GB',
        currency: j.profile.currency || 'GBP',
        locale: j.profile.locale || 'en',
        bio: j.profile.customerProfile?.bio || j.profile.taskerProfile?.bio || '',
      });
      setAvatarUrl(j.profile.avatarUrl || null);
      setAvatarPublicId(j.profile.avatarPublicId || null);
    });
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null); setSaving(true);
    try {
      const access = localStorage.getItem('access') || '';
      const r = await fetch('/api/backend/api/profile/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` }, body: JSON.stringify(form) });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error || 'Save failed'); }
      if (avatarUrl && avatarUrl !== me?.avatarUrl) {
        await fetch('/api/backend/api/profile/me/avatar', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` }, body: JSON.stringify({ avatarUrl, avatarPublicId }) });
      }
      setMsg('Saved');
      const me2 = await fetch('/api/backend/api/auth/me', { headers: { Authorization: `Bearer ${access}` } }).then((r) => r.json());
      setMe(me2.user);
    } catch (e: any) { setMsg(e.message); } finally { setSaving(false); }
  };

  return (
    <DashboardShell>
      <Greeting name="your profile" subtitle="Keep your info fresh so customers and taskers can trust who they\u2019re working with." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
        <div className="lg:col-span-1 p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm text-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt="profile" className="w-24 h-24 mx-auto rounded-full object-cover" />
          ) : (
            <div className="w-24 h-24 mx-auto rounded-full bg-primary-container text-on-secondary-container flex items-center justify-center font-bold text-headline-md">{(me?.displayName || me?.email || '?')[0]?.toUpperCase()}</div>
          )}
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-space-md">{me?.displayName || 'You'}</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{me?.email}</p>
          <div className="mt-space-md flex justify-center">
            <ImageUploader
              kind="avatar"
              value={avatarUrl}
              onChange={(url, publicId) => {
                void (async () => {
                  try {
                    setAvatarUrl(url);
                    if (publicId) setAvatarPublicId(publicId);
                    const access = localStorage.getItem('access') || '';
                    const response = await fetch('/api/backend/api/profile/me/avatar', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + access },
                      body: JSON.stringify({ avatarUrl: url, avatarPublicId: publicId }),
                    });
                    if (!response.ok) throw new Error('Avatar could not be saved.');
                    const saved = await response.json();
                    setMe((current: any) => ({ ...current, avatarUrl: saved.user.avatarUrl }));
                    setMsg('Avatar saved.');
                  } catch (error) {
                    setMsg(error instanceof Error ? error.message : 'Avatar could not be saved.');
                  }
                })();
              }}
              onError={(e) => setMsg(e)}
              label="Profile photo"
              shape="square"
              size={120}
            />
          </div>
          <div className="grid grid-cols-2 gap-space-sm mt-space-md">
            <StatCard label="Rating" value={profile?.taskerProfile?.ratingAvg?.toFixed(1) || '—'} icon="star" tone="warning" />
            <StatCard label="Reviews" value={profile?.taskerProfile?.ratingCount || 0} icon="reviews" tone="neutral" />
          </div>
        </div>

        <form onSubmit={save} className="lg:col-span-2 p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm space-y-space-md">
          {msg ? <div className="bg-tertiary-fixed text-on-tertiary-fixed rounded-xl p-space-sm text-sm">{msg}</div> : null}
          <h2 className="font-headline-sm text-headline-sm font-bold">Account details</h2>
          <label className="block"><span className="font-label-md text-label-md font-semibold">Display name</span><input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg" /></label>
          <label className="block"><span className="font-label-md text-label-md font-semibold">Bio</span><textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg" /></label>
          <div className="grid grid-cols-3 gap-space-md">
            <label className="block"><span className="font-label-md text-label-md font-semibold">Country</span>
              <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg">
                {['GB', 'NG', 'US', 'DE', 'FR', 'IE', 'NL'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="block"><span className="font-label-md text-label-md font-semibold">Currency</span>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg">
                {['NGN', 'USD', 'EUR', 'GBP'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="block"><span className="font-label-md text-label-md font-semibold">Language</span>
              <select value={form.locale} onChange={(e) => setForm({ ...form, locale: e.target.value })} className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg">
                {['en', 'fr', 'es', 'ha', 'yo', 'ig'].map((l) => <option key={l}>{l}</option>)}
              </select>
            </label>
          </div>
          <button disabled={saving} className="px-space-lg py-space-md rounded-xl bg-primary-container text-on-secondary-container font-label-lg text-label-lg font-bold disabled:opacity-60">{saving ? 'Saving…' : 'Save changes'}</button>
        </form>
      </div>

      {me?.role === 'TASKER' ? <PortfolioSection access={typeof window !== 'undefined' ? localStorage.getItem('access') || '' : ''} /> : null}
    </DashboardShell>
  );
}

function PortfolioSection({ access }: { access: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    const r = await fetch('/api/backend/api/profile/me', { headers: { Authorization: `Bearer ${access}` } });
    if (r.ok) { const j = await r.json(); setItems(j.profile?.taskerProfile?.portfolioItems || []); }
  };
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault(); if (!title.trim()) return;
    const r = await fetch('/api/backend/api/profile/tasker/portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` }, body: JSON.stringify({ title }) });
    if (r.ok) { setTitle(''); load(); } else { setMsg('Failed to add item'); }
  };

  const setMedia = async (id: string, url: string) => {
    await fetch('/api/backend/api/profile/tasker/portfolio/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` }, body: JSON.stringify({ mediaUrl: url }) });
    load();
  };

  const remove = async (id: string) => {
    await fetch('/api/backend/api/profile/tasker/portfolio/' + id, { method: 'DELETE', headers: { Authorization: `Bearer ${access}` } });
    load();
  };

  return (
    <section className="mt-space-xl p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm space-y-space-md max-w-3xl">
      <h2 className="font-headline-sm text-headline-sm font-bold">Portfolio</h2>
      <p className="font-body-sm text-body-sm text-on-surface-variant">Add a few recent projects. Customers hire faster when they can see your work.</p>
      <form onSubmit={add} className="flex gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Kitchen remodel — Lagos" className="flex-1 bg-surface-container-low px-space-md py-space-sm rounded-lg" />
        <button className="px-space-md py-space-sm rounded-xl bg-primary-container text-on-secondary-container font-label-md text-label-md font-bold">+ Add</button>
      </form>
      {msg ? <div className="bg-error-container text-on-error-container rounded-xl p-space-sm text-sm">{msg}</div> : null}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {items.map((p) => (
          <div key={p.id} className="p-space-md rounded-2xl bg-surface-container-low space-y-2">
            <div className="font-label-md text-label-md font-semibold text-on-surface">{p.title}</div>
            {p.mediaUrl ? <img src={p.mediaUrl} alt={p.title} className="w-full h-40 object-cover rounded-xl" /> : null}
            <ImageUploader kind="portfolio" value={p.mediaUrl || null} onChange={(url) => setMedia(p.id, url)} shape="wide" />
            <button onClick={() => remove(p.id)} className="text-error text-sm font-semibold">Remove</button>
          </div>
        ))}
      </div>
    </section>
  );
}
