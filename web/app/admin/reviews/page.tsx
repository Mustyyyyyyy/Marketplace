'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/admin';

export default function AdminReviewsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const load = () => adminApi.flaggedReviews(1).then((j) => setItems(j.items)).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);
  const mod = (id: string, action: 'approve' | 'remove') => {
    adminApi.moderateReview(id, action).then(() => load()).catch((e) => setErr(e.message));
  };
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Flagged reviews</h1>
      {err ? <div className="bg-error-container text-on-error-container rounded-xl p-3 mb-4 text-sm">{err}</div> : null}
      <div className="space-y-3">
        {items.map((r) => (
          <div key={r.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
            <div className="text-xs text-on-surface-variant mb-1">{r.author?.displayName || r.author?.email} → {r.target?.displayName || r.target?.email} · {r.rating}★ · {new Date(r.createdAt).toLocaleString()}</div>
            <div className="text-sm whitespace-pre-wrap my-2">{r.body}</div>
            <div className="flex gap-2">
              <button onClick={() => mod(r.id, 'approve')} className="px-2 py-1 rounded bg-tertiary text-on-tertiary text-xs font-semibold">Approve (unflag)</button>
              <button onClick={() => mod(r.id, 'remove')} className="px-2 py-1 rounded bg-error text-on-error text-xs font-semibold">Remove</button>
            </div>
          </div>
        ))}
        {items.length === 0 ? <div className="text-on-surface-variant">No flagged reviews</div> : null}
      </div>
    </div>
  );
}
