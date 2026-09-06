'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { Greeting } from '@/components/DashboardBits';

export default function ChatThreadPage() {
  const params = useParams();
  const id = params?.id as string;
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const load = async () => {
    const access = localStorage.getItem('access') || '';
    const r = await fetch(`/api/backend/api/conversations/${id}/messages`, { headers: { Authorization: `Bearer ${access}` } });
    if (r.ok) { const j = await r.json(); setMessages(j.messages || []); }
  };

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(timer);
  }, [id]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true); setErr(null);
    try {
      const access = localStorage.getItem('access') || '';
      const r = await fetch(`/api/backend/api/conversations/${id}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` }, body: JSON.stringify({ body: text }) });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error || 'Send failed'); }
      setText(''); await load();
    } catch (e: any) { setErr(e.message); } finally { setSending(false); }
  };

  return (
    <DashboardShell>
      <Link href="/dashboard/messages" className="font-label-md text-label-md text-secondary font-semibold">← All messages</Link>
      <Greeting name="conversation" subtitle="Real-time messaging with end-to-end safety on TaskSphere." />
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant flex flex-col h-[65vh]">
        <div className="flex-1 overflow-y-auto p-space-md space-y-space-sm">
          {messages.length === 0 ? <p className="text-center text-on-surface-variant">No messages yet — say hi.</p> : null}
          {messages.map((m) => (
            <div key={m.id} className="max-w-[75%] bg-surface-container rounded-2xl px-space-md py-space-sm">
              <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap">{m.body}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{new Date(m.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
        {err ? <div className="px-space-md pb-space-sm text-error text-sm">{err}</div> : null}
        <form onSubmit={send} className="p-space-md border-t border-outline-variant flex gap-space-sm">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message (contact details are not allowed)" className="flex-1 bg-surface-container-low px-space-md py-space-sm rounded-lg" />
          <button disabled={sending} className="px-space-lg py-space-sm rounded-xl bg-primary-container text-on-secondary-container font-label-lg text-label-lg font-bold disabled:opacity-60">{sending ? '…' : 'Send'}</button>
        </form>
      </div>
    </DashboardShell>
  );
}
