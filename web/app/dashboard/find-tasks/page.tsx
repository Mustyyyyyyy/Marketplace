'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { Greeting, StatCard } from '@/components/DashboardBits';

export default function FindTasksPage() {
  const [q, setQ] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [mode, setMode] = useState('');
  const [city, setCity] = useState('');
  const [data, setData] = useState<any>({ items: [], total: 0 });
  const [categories, setCategories] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('All Matches');

  useEffect(() => { fetch('/api/backend/api/categories').then((r) => r.json()).then((j) => setCategories(j.categories || [])); }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (categoryId) params.set('categoryId', categoryId);
    if (mode) params.set('mode', mode);
    if (city) params.set('city', city);
    params.set('page', String(page));
    params.set('pageSize', '12');
    fetch('/api/backend/api/tasks?' + params.toString()).then((r) => r.json()).then(setData).catch(() => setData({ items: [], total: 0 }));
  }, [q, categoryId, mode, city, page]);

  return (
    <DashboardShell>
      <Greeting
        name="find tasks"
        subtitle="Find open work that matches your skills, location and rates, then send an offer."
        action={
          <Link href="/dashboard/offers" className="inline-flex items-center gap-space-xs h-12 px-space-lg rounded-xl bg-primary-container text-on-secondary-container font-label-lg text-label-lg shadow-sm hover:bg-inverse-surface transition-all">
            <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
            <span>My Offers</span>
          </Link>
        }
      />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-space-md mb-space-xl">
      <StatCard label="Available now" value={data.total || 0} icon="bolt" tone="info" />
      <StatCard label="Remote" value={data.items?.filter((t: any) => t.mode === 'REMOTE').length || 0} icon="public" tone="success" />
      <StatCard label="Local" value={data.items?.filter((t: any) => t.mode === 'LOCAL').length || 0} icon="location_on" tone="neutral" />
      <StatCard label="Avg. budget" value={data.items?.length ? `${data.items[0].currency || ''} ${Math.round(data.items.reduce((sum: number, t: any) => sum + Number(t.budgetAmount || 0), 0) / data.items.length).toLocaleString()}` : '—'} icon="attach_money" tone="warning" />
      </section>

      <form onSubmit={(e) => { e.preventDefault(); setPage(1); }} className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm mb-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-space-sm">
          <div className="md:col-span-5 flex items-center gap-space-xs bg-surface-container-low px-space-md py-space-xs rounded-xl">
            <span className="material-symbols-outlined text-outline text-[18px]">search</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} className="w-full bg-transparent text-body-md focus:outline-none" placeholder="Search by keyword" />
          </div>
          <div className="md:col-span-3 flex items-center gap-space-xs bg-surface-container-low px-space-md py-space-xs rounded-xl">
            <span className="material-symbols-outlined text-outline text-[18px]">category</span>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-transparent text-body-md focus:outline-none">
              <option value="">All categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2 flex items-center gap-space-xs bg-surface-container-low px-space-md py-space-xs rounded-xl">
            <span className="material-symbols-outlined text-outline text-[18px]">public</span>
            <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full bg-transparent text-body-md focus:outline-none">
              <option value="">Any</option>
              <option value="REMOTE">Remote</option>
              <option value="LOCAL">Local</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="w-full h-full min-h-[44px] rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg font-bold">Search</button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-space-md">
          {['All Matches'].map((c) => (
            <button key={c} type="button" onClick={() => setActiveTab(c)} className={`px-3 py-1.5 rounded-xl font-label-sm text-label-sm whitespace-nowrap ${activeTab === c ? 'bg-primary-container text-on-secondary-container shadow-sm' : 'bg-surface-container text-on-surface-variant'}`}>{c}</button>
          ))}
        </div>
      </form>

      {data.items?.length === 0 ? (
        <div className="p-space-3xl rounded-2xl bg-surface-container-lowest shadow-sm text-center">
          <span className="material-symbols-outlined text-6xl text-outline">search_off</span>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-md">No matching tasks right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
          {data.items?.map((t: any) => (
            <Link key={t.id} href={`/tasks/${t.id}`} className="flex flex-col justify-between p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
              <div>
                <div className="flex items-start justify-between gap-space-xs mb-space-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm">{t.mode}</span>
                    <span className="text-outline font-label-sm text-label-sm">•</span>
                    <span className="text-on-surface-variant font-label-sm text-label-sm">{t.city || t.country}</span>
                  </div>
                  <button aria-label="Save" className="p-1.5 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container"><span className="material-symbols-outlined text-[20px]">bookmark</span></button>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-2 mb-space-xs">{t.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-space-md">{t.description}</p>
              </div>
              <div className="pt-space-md bg-surface-container-low -mx-space-lg -mb-space-lg p-space-md rounded-b-2xl flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">{t.budgetType}</span>
                  <span className="font-headline-sm text-headline-sm font-bold text-on-surface">{t.currency} {Number(t.budgetAmount).toLocaleString()}</span>
                </div>
                <span className="inline-flex items-center gap-1 h-10 px-space-md rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg">
                  <span>Make Offer</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
