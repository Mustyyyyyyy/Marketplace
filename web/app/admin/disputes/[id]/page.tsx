'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminApi } from '@/lib/admin';

export default function AdminDisputeDetail() {
  const { id } = useParams<{ id: string }>();
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => { if (id) adminApi.dispute(id).then((j) => setD(j.dispute)).catch((e) => setErr(e.message)); }, [id]);

  if (err) return <div className="p-6 bg-error-container text-on-error-container rounded-xl m-6">{err}</div>;
  if (!d) return <div className="p-6 text-on-surface-variant">Loading…</div>;

  const resolve = (r: 'customer' | 'tasker' | 'split' | 'closed') => {
    if (!notes.trim()) { alert('Add resolution notes first.'); return; }
    adminApi.resolveDispute(d.id, r, notes).then(() => location.reload()).catch((e) => setErr(e.message));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Dispute on &ldquo;{d.task?.title}&rdquo;</h1>
      <div className="text-sm text-on-surface-variant mb-4">Opened by {d.opener?.displayName || d.opener?.email} against {d.against?.displayName || d.against?.email} — {new Date(d.createdAt).toLocaleString()}</div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 mb-4">
        <div className="font-semibold mb-1">Reason: {d.reason}</div>
        <div className="text-sm whitespace-pre-wrap">{d.details}</div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
        <div className="font-semibold mb-2">Resolve</div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Resolution notes (visible to both parties)" className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low min-h-[100px] mb-2" />
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => resolve('customer')} className="px-3 py-1.5 rounded-lg bg-secondary text-on-secondary font-semibold">Resolve for customer</button>
          <button onClick={() => resolve('tasker')} className="px-3 py-1.5 rounded-lg bg-secondary text-on-secondary font-semibold">Resolve for tasker</button>
          <button onClick={() => resolve('split')} className="px-3 py-1.5 rounded-lg bg-tertiary text-on-tertiary font-semibold">Split 50/50</button>
          <button onClick={() => resolve('closed')} className="px-3 py-1.5 rounded-lg border border-outline-variant">Close without action</button>
        </div>
        {d.resolution ? <div className="mt-3 text-sm bg-surface-container p-2 rounded">{d.resolution}</div> : null}
      </div>
    </div>
  );
}
