'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { Greeting } from '@/components/DashboardBits';

export default function DashboardMessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    const access = localStorage.getItem('access') || '';
    fetch('/api/backend/api/conversations', { headers: { Authorization: `Bearer ${access}` } })
      .then((r) => r.json()).then((j) => setConversations(j.conversations || []));
  }, []);

  const filtered = filter === 'unread' ? conversations.filter((c) => c.unreadCount > 0) : conversations;

  return (
    <DashboardShell>
      <Greeting
        name="your messages"
        subtitle="Every conversation in one place. Customers, taskers, and support — all in your inbox."
        action={
          <Link href="/dashboard/messages" className="inline-flex items-center gap-space-xs h-12 px-space-lg rounded-xl bg-primary-container text-on-secondary-container font-label-lg text-label-lg shadow-sm hover:bg-inverse-surface transition-all">
            <span className="material-symbols-outlined text-[20px]">forum</span>
            <span>Open Inbox</span>
          </Link>
        }
      />

      <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm">
        <div className="flex flex-wrap items-center gap-1 mb-space-md">
          <button onClick={() => setFilter('all')} className={`px-space-sm py-1 rounded-full font-label-md text-label-md ${filter === 'all' ? 'bg-primary-container text-on-secondary-container' : 'bg-surface-container text-on-surface'}`}>All</button>
          <button onClick={() => setFilter('unread')} className={`px-space-sm py-1 rounded-full font-label-md text-label-md ${filter === 'unread' ? 'bg-primary-container text-on-secondary-container' : 'bg-surface-container text-on-surface'}`}>Unread</button>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-space-3xl">
            <span className="material-symbols-outlined text-6xl text-outline">forum</span>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-md">No conversations yet.</p>
            <Link href="/browse" className="inline-block mt-space-md px-space-lg py-space-md rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg font-bold">Browse to start one</Link>
          </div>
        ) : (
          <div className="space-y-space-sm">
            {filtered.map((c) => {
              const last = (c.messages || [])[0];
              return (
                <Link key={c.id} href={`/dashboard/messages/${c.id}`} className="block p-space-md rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all">
                  <div className="flex items-start justify-between gap-space-sm">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-space-sm">
                        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface truncate">{c.task?.title || c.otherUser?.displayName || 'Conversation'}</h3>
                        {c.unreadCount > 0 ? <span className="px-space-sm py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm">{c.unreadCount} new</span> : null}
                      </div>
                      {last ? <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-1">{last.body}</p> : null}
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">{last ? new Date(last.createdAt).toLocaleDateString() : ''}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
