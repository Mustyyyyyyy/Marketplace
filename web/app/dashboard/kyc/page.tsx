'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { Greeting, StatCard } from '@/components/DashboardBits';
import ImageUploader from '@/components/ImageUploader';

export default function KycPage() {
  const [profile, setProfile] = useState<any>(null);
  const [score, setScore] = useState<number | null>(null);
  const [docUrl, setDocUrl] = useState('');
  const [skills, setSkills] = useState<string>('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const access = localStorage.getItem('access') || '';
    const r = await fetch('/api/backend/api/profile/me', { headers: { Authorization: `Bearer ${access}` } });
    if (r.ok) { const j = await r.json(); setProfile(j.profile); setHeadline(j.profile?.taskerProfile?.headline || ''); setBio(j.profile?.taskerProfile?.bio || ''); setSkills((j.profile?.taskerProfile?.skills || []).map((s: any) => s.skill.name).join(', '));
      const kyc = j.profile?.taskerProfile?.kycStatus === 'VERIFIED' ? 20 : 0;
      const reviews = Math.min(15, (j.profile?.taskerProfile?.ratingCount || 0) * 2);
      const skillsN = (j.profile?.taskerProfile?.skills || []).length > 0 ? 5 : 0;
      setScore(60 + kyc + reviews + skillsN);
    }
  };

  useEffect(() => { load(); }, []);

  const saveTasker = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(null); setBusy(true);
    try {
      const access = localStorage.getItem('access') || '';
      await fetch('/api/backend/api/profile/tasker', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` }, body: JSON.stringify({ headline, bio }) });
      const list = skills.split(',').map((s) => s.trim()).filter(Boolean);
      if (list.length) await fetch('/api/backend/api/profile/tasker/skills', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` }, body: JSON.stringify({ skills: list }) });
      setMsg('Profile updated.'); load();
    } catch (e: any) { setMsg(e.message); } finally { setBusy(false); }
  };

  const submitKyc = async () => {
    if (!docUrl) return setMsg('Please upload your document first.');
    setBusy(true); setMsg(null);
    try {
      const access = localStorage.getItem('access') || '';
      const r = await fetch('/api/backend/api/kyc/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` }, body: JSON.stringify({ documentUrl: docUrl }) });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error || 'KYC failed'); }
      setMsg('KYC submitted for review.'); load();
    } catch (e: any) { setMsg(e.message); } finally { setBusy(false); }
  };

  return (
    <DashboardShell>
      <Greeting name="verification" subtitle="Unlock higher-value work and priority matching by verifying your identity and showing your craft." />
      <section className="grid grid-cols-2 md:grid-cols-4 gap-space-md mb-space-xl">
        <StatCard label="KYC Status" value={profile?.taskerProfile?.kycStatus || 'NOT_STARTED'} icon="verified" tone={profile?.taskerProfile?.kycStatus === 'VERIFIED' ? 'success' : 'warning'} />
        <StatCard label="Skills" value={(profile?.taskerProfile?.skills || []).length} icon="stars" tone="info" />
        <StatCard label="Profile Score" value={score != null ? `${score}%` : '—'} icon="auto_awesome" tone={score && score >= 80 ? 'success' : 'warning'} />
        <StatCard label="Account age" value={profile?.createdAt ? `${Math.max(0, Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / 86400_000))}d` : '—'} icon="schedule" tone="neutral" />
      </section>
      {msg ? <div className="bg-tertiary-fixed text-on-tertiary-fixed rounded-xl p-space-sm text-sm mb-space-md max-w-2xl">{msg}</div> : null}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
        <form onSubmit={saveTasker} className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm space-y-space-md">
          <h2 className="font-headline-sm text-headline-sm font-bold">Tasker profile</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Stand out with a great headline, bio, and skills list.</p>
          <label className="block"><span className="font-label-md text-label-md font-semibold">Headline</span><input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Master Carpenter &amp; Builder" className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg" /></label>
          <label className="block"><span className="font-label-md text-label-md font-semibold">Bio</span><textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg" /></label>
          <label className="block"><span className="font-label-md text-label-md font-semibold">Skills (comma-separated)</span><input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="plumbing, tiling, electrical" className="mt-1 w-full bg-surface-container-low px-space-md py-space-sm rounded-lg" /></label>
          <button disabled={busy} className="px-space-lg py-space-md rounded-xl bg-primary-container text-on-secondary-container font-label-lg text-label-lg font-bold disabled:opacity-60">Save profile</button>
        </form>

        <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm space-y-space-md">
          <h2 className="font-headline-sm text-headline-sm font-bold">Identity verification (KYC)</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Upload a clear photo of your government-issued ID (passport, driver’s licence or national ID). Most people finish in under a minute.</p>
          <ImageUploader
            kind="kyc"
            value={docUrl}
            onChange={(url) => { setDocUrl(url); setMsg('Document ready. Click "Submit for review" to send it to our team.'); }}
            onError={(e) => setMsg(e)}
            shape="wide"
            label="ID document"
          />
          <button onClick={submitKyc} disabled={busy || !docUrl} className="px-space-lg py-space-md rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg font-bold disabled:opacity-60">Submit for review</button>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Need help? Read the <a className="text-secondary font-semibold" href="/kyc">KYC overview</a>.</p>
        </div>
      </div>
    </DashboardShell>
  );
}
