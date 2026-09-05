'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Tasker { id: string; displayName?: string; avatarUrl?: string; taskerProfile?: { headline?: string; bio?: string; ratingAvg?: number; ratingCount?: number; kycStatus?: string; } }

const STARS = (n: number) => '★'.repeat(Math.round(n || 0)) + '☆'.repeat(5 - Math.round(n || 0));

export default function TaskerShowcase() {
  const [taskers, setTaskers] = useState<Tasker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/backend/api/tasks?pageSize=1', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then(async (data) => {
        if (!data?.items?.[0]) return;
        const taskId = data.items[0].id;
        const r = await fetch(`/api/backend/api/recommendations/tasks/${taskId}/recommendations`, { cache: 'no-store' });
        if (r.ok) {
          const list = await r.json();
          if (Array.isArray(list?.taskers) && list.taskers.length) {
            setTaskers(list.taskers.slice(0, 4));
          }
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-space-3xl" id="taskers">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold text-secondary">Top Rated</span>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mt-2">Meet trusted taskers</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Verified profiles, real reviews, ready to work.</p>
        </div>
        <Link href="/taskers" className="font-label-lg text-label-lg text-secondary font-semibold hover:underline">Browse all taskers →</Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-container-lowest rounded-2xl p-space-lg border border-outline-variant animate-pulse h-48" />
          ))}
        </div>
      ) : taskers.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-space-xl text-center">
          <p className="font-body-md text-body-md text-on-surface-variant">No taskers available yet. <Link href="/become-a-tasker" className="text-secondary font-semibold">Be the first →</Link></p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
          {taskers.map((t) => (
            <Link key={t.id} href={`/taskers/${t.id}`} className="block bg-surface-container-lowest rounded-2xl p-space-lg border border-outline-variant hover:shadow-lg transition-all">
              <div className="flex items-center gap-space-md mb-space-md">
                {t.avatarUrl ? (
                  <img className="w-14 h-14 rounded-full object-cover" alt={t.displayName || 'Tasker'} src={t.avatarUrl} />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-secondary font-bold text-headline-sm">
                    {t.displayName?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-space-2xs">
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface truncate">{t.displayName || 'Tasker'}</span>
                    {t.taskerProfile?.kycStatus === 'VERIFIED' || t.taskerProfile?.kycStatus === 'APPROVED' ? (
                      <span className="px-1.5 py-0.5 rounded bg-surface-container-low text-[10px] font-bold text-secondary">PRO</span>
                    ) : null}
                  </div>
                  {t.taskerProfile?.ratingAvg ? (
                    <div className="text-xs text-warning">{STARS(t.taskerProfile.ratingAvg)} <span className="text-on-surface-variant">({t.taskerProfile.ratingCount || 0})</span></div>
                  ) : null}
                </div>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">{t.taskerProfile?.headline || t.taskerProfile?.bio || 'New on TaskSphere.'}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
