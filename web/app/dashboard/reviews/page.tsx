'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { Greeting, StatCard } from '@/components/DashboardBits';

export default function ReviewsPage() {
  const [me, setMe] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const access = localStorage.getItem('access') || '';
    fetch('/api/backend/api/auth/me', { headers: { Authorization: `Bearer ${access}` } }).then((r) => r.json()).then((j) => setMe(j.user));
    fetch('/api/backend/api/profile/me', { headers: { Authorization: `Bearer ${access}` } }).then((r) => r.json()).then((j) => setProfile(j.profile));
    fetch('/api/backend/api/reviews/mine', { headers: { Authorization: `Bearer ${access}` } }).then((r) => r.json()).then((j) => setReviews(j.reviews || [])).catch(() => setReviews([]));
  }, []);

  const reviews5 = reviews.filter((r) => r.rating === 5).length;
  const responseRate = reviews.length > 0 ? Math.round((reviews5 / reviews.length) * 100) + '%' : '—';
  const rating = profile?.taskerProfile?.ratingAvg || 0;
  const count = profile?.taskerProfile?.ratingCount || 0;
  const STARS = (n: number) => '★'.repeat(Math.round(n || 0)) + '☆'.repeat(5 - Math.round(n || 0));

  return (
    <DashboardShell>
      <Greeting name="reviews & reputation" subtitle="Your rating, your reviews, and the public profile customers see before they hire you." />
      <section className="grid grid-cols-2 md:grid-cols-4 gap-space-md mb-space-xl">
        <StatCard label="Average rating" value={rating ? rating.toFixed(2) : '—'} icon="star" tone="warning" />
        <StatCard label="Total reviews" value={count} icon="reviews" tone="info" />
        <StatCard label="5-star" value={reviews5} icon="auto_awesome" tone="success" />
        <StatCard label="Response rate" value={profile?.taskerProfile?.responseRate || '—'} icon="forum" tone="neutral" />
      </section>

      <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm">
        <div className="flex items-center justify-between mb-space-md">
          <h2 className="font-headline-sm text-headline-sm font-bold">What clients are saying</h2>
          <span className="text-amber-500 font-label-lg text-label-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{STARS(rating)}</span>
        </div>
        {reviews.length === 0 ? (
          <div className="text-center py-space-3xl">
            <span className="material-symbols-outlined text-6xl text-outline">reviews</span>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-md">No reviews yet. Once you complete jobs, your first reviews will land here.</p>
          </div>
        ) : (
          <div className="space-y-space-md">
            {reviews.map((r) => (
              <div key={r.id} className="p-space-md rounded-2xl bg-surface-container-low">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold">{(r.author?.displayName || r.authorName || 'A')[0]?.toUpperCase()}</div>
                    <div>
                      <div className="font-label-md text-label-md font-semibold text-on-surface">{r.author?.displayName || r.authorName || 'Anonymous'}</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">{new Date(r.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <span className="text-amber-500 font-label-lg text-label-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{STARS(r.rating)}</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface mt-space-sm whitespace-pre-line">{r.body || r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
