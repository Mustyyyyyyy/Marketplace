'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminApi } from '@/lib/admin';

export default function AdminTaskDetail() {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    adminApi.task(id).then((j) => setTask(j.task)).catch((e) => setErr(e.message));
  }, [id]);

  if (err) return <div className="p-6 bg-error-container text-on-error-container rounded-xl m-6">{err}</div>;
  if (!task) return <div className="p-6 text-on-surface-variant">Loading…</div>;

  const cancel = () => {
    const reason = prompt('Reason?'); if (!reason) return;
    adminApi.cancelTask(task.id, reason).then(() => location.reload()).catch((e) => setErr(e.message));
  };
  const complete = () => {
    if (!confirm('Force-complete this task?')) return;
    adminApi.completeTask(task.id).then(() => location.reload()).catch((e) => setErr(e.message));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{task.title}</h1>
        <div className="flex gap-2">
          <button onClick={cancel} className="px-3 py-1.5 rounded-lg bg-error text-on-error font-semibold">Force cancel</button>
          <button onClick={complete} className="px-3 py-1.5 rounded-lg bg-tertiary text-on-tertiary font-semibold">Force complete</button>
        </div>
      </div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 mb-4">
        <div className="text-sm whitespace-pre-wrap">{task.description}</div>
        <div className="mt-3 text-xs text-on-surface-variant grid grid-cols-2 gap-2">
          <div>Status: <strong>{task.status}</strong></div>
          <div>Budget: <strong>{task.budgetAmount} {task.currency}</strong></div>
          <div>Customer: <strong>{task.customer?.displayName || task.customer?.email}</strong></div>
          <div>Country: <strong>{task.country} {task.city}</strong></div>
        </div>
      </div>
      {task.offers?.length ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 mb-4">
          <div className="font-semibold mb-2">Offers ({task.offers.length})</div>
          {task.offers.map((o: any) => (
            <div key={o.id} className="border-t border-outline-variant py-2 text-sm flex justify-between">
              <div>{o.tasker?.displayName || o.tasker?.email} — {o.status}</div>
              <div className="font-mono">{o.price} {o.currency}</div>
            </div>
          ))}
        </div>
      ) : null}
      {task.dispute ? (
        <div className="bg-error-container text-on-error-container rounded-xl p-4">
          <div className="font-semibold">Dispute: {task.dispute.status}</div>
          <div className="text-sm mt-1">{task.dispute.reason}: {task.dispute.details}</div>
        </div>
      ) : null}
    </div>
  );
}
