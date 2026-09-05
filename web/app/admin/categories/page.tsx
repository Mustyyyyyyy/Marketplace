'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/admin';

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [draft, setDraft] = useState({ slug: '', name: '', icon: '' });

  const load = () => adminApi.categories().then((j) => setItems(j.categories)).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const create = () => {
    if (!draft.slug || !draft.name) return;
    adminApi.createCategory(draft).then(() => { setDraft({ slug: '', name: '', icon: '' }); load(); }).catch((e) => setErr(e.message));
  };
  const update = (id: string, patch: any) => adminApi.updateCategory(id, patch).then(() => load()).catch((e) => setErr(e.message));
  const remove = (id: string) => { if (confirm('Archive this category?')) adminApi.deleteCategory(id).then(() => load()).catch((e) => setErr(e.message)); };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Categories</h1>
      <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant mb-4">
        <div className="text-xs font-semibold uppercase text-on-surface-variant mb-2">Add new</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} placeholder="slug (e.g. plumbing)" className="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low" />
          <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Name" className="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low" />
          <input value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} placeholder="Icon (material symbol)" className="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low" />
          <button onClick={create} className="px-4 py-2 rounded-lg bg-secondary text-on-secondary font-semibold">Add</button>
        </div>
      </div>
      {err ? <div className="bg-error-container text-on-error-container rounded-xl p-3 mb-4 text-sm">{err}</div> : null}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-container"><tr>
            <th className="text-left p-3">Slug</th><th className="text-left p-3">Name</th><th className="text-left p-3">Icon</th>
            <th className="text-left p-3">Tasks</th><th className="text-left p-3">Active</th><th className="p-3"></th>
          </tr></thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-t border-outline-variant">
                <td className="p-3 font-mono text-xs">{c.slug}</td>
                <td className="p-3"><input defaultValue={c.name} onBlur={(e) => e.target.value !== c.name && update(c.id, { name: e.target.value })} className="bg-transparent border-b border-outline-variant w-full" /></td>
                <td className="p-3"><input defaultValue={c.icon || ''} onBlur={(e) => e.target.value !== c.icon && update(c.id, { icon: e.target.value })} className="bg-transparent border-b border-outline-variant w-full" /></td>
                <td className="p-3">{c._count?.tasks || 0}</td>
                <td className="p-3">
                  <button onClick={() => update(c.id, { active: !c.active })} className={`px-2 py-0.5 rounded text-xs font-semibold ${c.active ? 'bg-tertiary text-on-tertiary' : 'bg-surface-container'}`}>{c.active ? 'Yes' : 'No'}</button>
                </td>
                <td className="p-3"><button onClick={() => remove(c.id)} className="text-error text-xs">Archive</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
