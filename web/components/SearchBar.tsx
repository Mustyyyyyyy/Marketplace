'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const POPULAR = ['Cleaning', 'Moving', 'Graphic Design', 'Web Development', 'Photography', 'Home Repairs', 'Delivery', 'Tutoring'];

export default function SearchBar({ categories }: { categories: { id: string; name: string; slug: string; icon?: string }[] }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [location, setLocation] = useState('');

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (categoryId) params.set('categoryId', categoryId);
    if (location) params.set('city', location);
    router.push(`/browse?${params.toString()}`);
  };

  return (
    <section className="py-space-xl" id="find-tasks">
      <div className="bg-surface-container-lowest rounded-2xl shadow-md p-space-lg lg:p-space-xl flex flex-col gap-space-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-xs">
          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface tracking-tight">What do you need help with?</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Find skilled professionals or post specific jobs in minutes</p>
          </div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
            <span className="material-symbols-outlined text-secondary text-sm">flash_on</span>
            <span>Average response time: <strong>8 minutes</strong></span>
          </div>
        </div>
        <form className="grid grid-cols-1 md:grid-cols-12 gap-space-xs bg-surface-container-low p-space-xs rounded-xl" onSubmit={submit}>
          <div className="md:col-span-5 flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-space-xs rounded-lg shadow-sm">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">search</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} className="w-full bg-transparent text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none" placeholder="Task or service (e.g. Logo Design, Moving, Cleaning)..." type="text" />
          </div>
          <div className="md:col-span-3 flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-space-xs rounded-lg shadow-sm">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">category</span>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-transparent text-body-md font-body-md text-on-surface focus:outline-none cursor-pointer">
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2 flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-space-xs rounded-lg shadow-sm">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">location_on</span>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-transparent text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none" placeholder="Remote, or City..." type="text" />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="w-full h-full min-h-[44px] flex items-center justify-center gap-space-2xs px-space-md py-space-xs rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg font-bold hover:bg-secondary-container transition-colors shadow-sm">
              <span>Search</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </form>
        <div className="flex flex-wrap items-center gap-space-xs">
          <span className="font-label-md text-label-md text-on-surface-variant font-semibold">Popular Searches:</span>
          {POPULAR.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => { setQ(p); submit(); }}
              className="px-space-sm py-1 rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm hover:bg-surface-container-high transition-colors"
            >{p}</button>
          ))}
        </div>
      </div>
    </section>
  );
}
