import { api } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MarketingHeader from '@/components/MarketingHeader';
import Footer from '@/components/Footer';

export default async function PublicTaskerPage({ params }: { params: { id: string } }) {
  let t: any = null;
  try { t = await api(`/api/users/${params.id}/public`); } catch { notFound(); }
  if (!t) notFound();
  return (
    <>
      <MarketingHeader />
      <main className="w-full pt-28 bg-surface max-w-container-max mx-auto px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop pb-space-3xl">
        <Link href="/taskers" className="text-secondary font-label-lg text-label-lg">← Back to taskers</Link>
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-space-lg mt-space-md">
          <aside className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-space-lg text-center">
            <div className="w-20 h-20 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-display mx-auto">{(t.displayName || t.email || '?')[0]?.toUpperCase()}</div>
            <h1 className="font-headline-md text-headline-md font-bold text-on-surface mt-space-md">{t.displayName || 'Tasker'}</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t.taskerProfile?.headline || '—'}</p>
            <div className="flex justify-center gap-space-xs mt-space-sm">
              <span className="px-space-sm py-1 rounded-full bg-secondary text-on-secondary text-[10px] font-bold uppercase">{t.taskerProfile?.kycStatus === 'VERIFIED' ? 'ID verified' : 'Unverified'}</span>
            </div>
            <Link href="/dashboard/tasks/new" className="block mt-space-md px-space-md py-space-sm rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold">Invite to a task</Link>
          </aside>
          <section className="space-y-space-lg">
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-space-lg">
              <h2 className="font-headline-sm text-headline-sm font-bold">About</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1 whitespace-pre-line">{t.taskerProfile?.bio || 'No bio yet.'}</p>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-space-lg">
              <h2 className="font-headline-sm text-headline-sm font-bold">Skills</h2>
              <div className="flex flex-wrap gap-1 mt-space-sm">
                {t.taskerProfile?.skills?.length ? t.taskerProfile.skills.map((s: any) => (
                  <span key={s.skill.id} className="px-space-sm py-1 rounded-full bg-surface-container text-on-surface text-[10px] font-bold uppercase">{s.skill.name}</span>
                )) : <span className="font-body-md text-body-md text-on-surface-variant">No skills listed yet.</span>}
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
