'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/admin';

const CHANNELS = ['in_app', 'email', 'sms'];
const AUDIENCES = ['all', 'customers', 'taskers', 'admins', 'country:NG', 'country:US', 'country:GB'];

export default function AdminBroadcastsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: '', body: '', audience: 'all', channel: 'in_app' });
  const load = () => adminApi.broadcasts().then((j) => setItems(j.broadcasts || j.items || [])).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const create = () => {
    if (!draft.title || !draft.body) return;
    adminApi.createBroadcast(draft).then(() => { setDraft({ title: '', body: '', audience: 'all', channel: 'in_app' }); load(); }).catch((e) => setErr(e.message));
  };
  const send = (id: string) => { if (confirm('Send this broadcast now?')) adminApi.sendBroadcast(id).then(() => load()).catch((e) => setErr(e.message)); };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Broadcasts</h1>
      <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant mb-4">
        <div className="text-xs font-semibold uppercase text-on-surface-variant mb-2">New broadcast</div>
        <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Title" className="w-full mb-2 px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low" />
        <textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} placeholder="Message" className="w-full mb-2 px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low min-h-[80px]" />
        <div className="flex gap-2 flex-wrap">
          <select value={draft.audience} onChange={(e) => setDraft({ ...draft, audience: e.target.value })} className="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low">
            {AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={draft.channel} onChange={(e) => setDraft({ ...draft, channel: e.target.value })} className="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low">
            {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={create} className="px-4 py-2 rounded-lg bg-secondary text-on-secondary font-semibold">Save draft</button>
        </div>
      </div>
      {err ? <div className="bg-error-container text-on-error-container rounded-xl p-3 mb-4 text-sm">{err}</div> : null}
      <div className="space-y-3">
        {items.map((b) => (
          <div key={b.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
            <div className="flex justify-between items-start mb-1">
              <div>
                <div className="font-semibold">{b.title}</div>
                <div className="text-xs text-on-surface-variant">{b.audience} · {b.channel} · {b.status}{b.sentAt ? ` at ${new Date(b.sentAt).toLocaleString()}` : ''}</div>
              </div>
              <div>
                {b.status === 'DRAFT' ? <button onClick={() => send(b.id)} className="px-3 py-1 rounded bg-tertiary text-on-tertiary text-xs font-semibold">Send now</button> : null}
              </div>
            </div>
            <div className="text-sm whitespace-pre-wrap">{b.body}</div>
          </div>
        ))}
        {items.length === 0 ? <div className="text-on-surface-variant">No broadcasts yet</div> : null}
      </div>
    </div>
  );
}
