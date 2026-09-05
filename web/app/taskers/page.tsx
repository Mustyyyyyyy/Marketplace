import Link from 'next/link';
import { api } from '@/lib/api';
import MarketingHeader from '@/components/MarketingHeader';
import Footer from '@/components/Footer';

interface PageProps { searchParams: { q?: string; categoryId?: string; page?: string } }

export default async function TaskersPage({ searchParams }: PageProps) {
  const params = new URLSearchParams();
  if (searchParams.q) params.set('q', searchParams.q);
  if (searchParams.categoryId) params.set('categoryId', searchParams.categoryId);
  params.set('page', searchParams.page || '1');
  params.set('pageSize', '20');

  let data: any = { items: [], total: 0 };
  try { data = await api(`/api/users/taskers?${params.toString()}`); } catch {}
  let categories: any[] = [];
  try { const r = await api('/api/categories'); categories = r.categories || []; } catch {}

  return (
    <>
      <MarketingHeader />
      <main className="w-full pt-28 bg-surface flex-grow max-w-container-max mx-auto px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop pb-space-3xl">
        <div className="flex items-end justify-between flex-wrap gap-space-md mb-space-md">
          <div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Find taskers</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">{data.total || 0} verified taskers available</p>
          </div>
          <Link href="/dashboard/tasks/new" className="px-space-lg py-space-md rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold">+ Post a task</Link>
        </div>

        <form action="/taskers" method="get" className="grid grid-cols-1 md:grid-cols-3 gap-space-sm mb-space-lg bg-surface-container-lowest border border-outline-variant p-space-md rounded-2xl">
          <input name="q" defaultValue={searchParams.q || ''} placeholder="Search skills or names" className="bg-surface-container-low px-space-md py-space-sm rounded-lg" />
          <select name="categoryId" defaultValue={searchParams.categoryId || ''} className="bg-surface-container-low px-space-md py-space-sm rounded-lg">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button type="submit" className="px-space-md py-space-sm rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg font-semibold">Search</button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
          {data.items?.map((t: any) => (
            <Link key={t.id} href={`/taskers/${t.id}`} className="block bg-surface-container-lowest rounded-2xl border border-outline-variant p-space-lg hover:shadow-md transition-all">
              <div className="flex items-center gap-space-sm">
                <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-headline-sm">{(t.displayName || t.email || '?')[0]?.toUpperCase()}</div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{t.displayName || 'Tasker'}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{t.taskerProfile?.headline || t.taskerProfile?.bio?.slice(0, 60) || '—'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-space-sm">
                <span className="px-space-sm py-1 rounded-full bg-secondary text-on-secondary text-[10px] font-bold uppercase">{t.taskerProfile?.kycStatus === 'VERIFIED' ? 'ID verified' : 'Unverified'}</span>
                {t.taskerProfile?.skills?.slice(0, 3).map((s: any) => (
                  <span key={s.skill.id} className="px-space-sm py-1 rounded-full bg-surface-container text-on-surface text-[10px] font-bold uppercase">{s.skill.name}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
        {(!data.items || data.items.length === 0) ? (
          <div className="text-center py-space-3xl">
            <span className="material-symbols-outlined text-6xl text-outline-variant">person_search</span>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-md">No taskers match your filters yet.</p>
            <Link href="/become-a-tasker" className="inline-block mt-space-md px-space-lg py-space-md rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg">Become a tasker</Link>
          </div>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
