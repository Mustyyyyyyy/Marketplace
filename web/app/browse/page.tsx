import Link from 'next/link';
import { api } from '@/lib/api';
import MarketingHeader from '@/components/MarketingHeader';
import Footer from '@/components/Footer';

interface PageProps { searchParams: { q?: string; categoryId?: string; city?: string; mode?: string; page?: string } }

export default async function BrowsePage({ searchParams }: PageProps) {
  const params = new URLSearchParams();
  if (searchParams.q) params.set('q', searchParams.q);
  if (searchParams.categoryId) params.set('categoryId', searchParams.categoryId);
  if (searchParams.city) params.set('city', searchParams.city);
  if (searchParams.mode) params.set('mode', searchParams.mode);
  params.set('page', searchParams.page || '1');
  params.set('pageSize', '20');

  let data: any = { items: [], total: 0 };
  try { data = await api(`/api/tasks?${params.toString()}`); } catch {}

  let categories: any[] = [];
  try { const r = await api('/api/categories'); categories = r.categories || []; } catch {}

  return (
    <>
      <MarketingHeader />
      <main className="w-full pt-28 bg-surface flex-grow max-w-container-max mx-auto px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop pb-space-3xl">
        <div className="flex items-end justify-between flex-wrap gap-space-md mb-space-md">
          <div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Browse tasks</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">{data.total || 0} {data.total === 1 ? 'task' : 'tasks'} found{searchParams.q ? ` for "${searchParams.q}"` : ''}</p>
          </div>
          <Link href="/dashboard/tasks/new" className="px-space-lg py-space-md rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold">+ Post a task</Link>
        </div>

        <form action="/browse" method="get" className="grid grid-cols-1 md:grid-cols-4 gap-space-sm mb-space-lg bg-surface-container-lowest border border-outline-variant p-space-md rounded-2xl">
          <input name="q" defaultValue={searchParams.q || ''} placeholder="Search…" className="bg-surface-container-low px-space-md py-space-sm rounded-lg" />
          <select name="categoryId" defaultValue={searchParams.categoryId || ''} className="bg-surface-container-low px-space-md py-space-sm rounded-lg">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select name="mode" defaultValue={searchParams.mode || ''} className="bg-surface-container-low px-space-md py-space-sm rounded-lg">
            <option value="">Any mode</option>
            <option value="REMOTE">Remote</option>
            <option value="LOCAL">Local</option>
          </select>
          <input name="city" defaultValue={searchParams.city || ''} placeholder="City" className="bg-surface-container-low px-space-md py-space-sm rounded-lg" />
          <button type="submit" className="md:col-span-4 px-space-md py-space-sm rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg font-semibold">Search</button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
          {data.items?.map((t: any) => (
            <Link key={t.id} href={`/tasks/${t.id}`} className="block bg-surface-container-lowest rounded-2xl p-space-lg border border-outline-variant hover:shadow-md transition-all">
              <div className="flex items-center gap-space-xs mb-space-xs">
                <span className="px-space-sm py-1 rounded-full bg-secondary text-on-secondary text-[10px] font-bold uppercase">{t.status}</span>
                <span className="px-space-sm py-1 rounded-full bg-surface-container text-on-surface text-[10px] font-bold uppercase">{t.mode}</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface line-clamp-1">{t.title}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1 line-clamp-2">{t.description}</p>
              <div className="flex items-center justify-between mt-space-md">
                <span className="font-label-lg text-label-lg font-bold text-secondary">{t.currency} {Number(t.budgetAmount).toLocaleString()}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{t.city || t.country}</span>
              </div>
            </Link>
          ))}
        </div>
        {(!data.items || data.items.length === 0) ? (
          <div className="text-center py-space-3xl">
            <span className="material-symbols-outlined text-6xl text-outline-variant">search_off</span>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-md">No tasks match your filters yet.</p>
            <Link href="/dashboard/tasks/new" className="inline-block mt-space-md px-space-lg py-space-md rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg">Post the first task</Link>
          </div>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
