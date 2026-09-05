import MarketingHeader from '@/components/MarketingHeader';
import Footer from '@/components/Footer';
import { PageShell, PageHeader, Section, Card, Stat } from '@/components/Page';
import Link from 'next/link';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Find tasks — TaskSphere' };

const FILTERS = [
  { icon: 'search', title: 'Search by keyword', body: 'Type any service — “logo design”, “deep clean”, “iPhone repair” — and we will find matching tasks.' },
  { icon: 'category', title: 'Filter by category', body: 'Drill down to a specific service category or subcategory.' },
  { icon: 'location_on', title: 'Local or remote', body: 'Browse tasks in your city or apply to remote work from anywhere.' },
  { icon: 'payments', title: 'Set your budget', body: 'See only tasks that match your price range and currency.' },
  { icon: 'verified', title: 'Verified customers', body: 'Apply with confidence — every customer is email, phone and ID verified.' },
  { icon: 'flash_on', title: 'Fast offers', body: 'Reply quickly to stand out — first offers tend to win the work.' },
];

export default async function FindTasksPage() {
  const stats = await api('/api/public/stats').catch(() => ({ openTasks: 0, taskersTotal: 0, ratingAvg: 0, reviewCount: 0, tasksTotal: 0 }));
  return (
    <>
      <MarketingHeader />
      <PageShell>
        <PageHeader
          eyebrow="For taskers"
          title="Find tasks you can complete"
          subtitle="Browse tasks in your city, or apply to remote work from anywhere. Choose the ones that match your skills, location and schedule."
          ctas={[
            { label: 'Browse all tasks', href: '/browse' },
            { label: 'Become a tasker', href: '/become-a-tasker' },
          ]}
        />

        <Section title="Smart filters" eyebrow="Find the right work">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
            {FILTERS.map((f) => (
              <Card key={f.title}>
                <span className="material-symbols-outlined text-3xl text-secondary">{f.icon}</span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-space-sm">{f.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">{f.body}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="By the numbers" eyebrow="The opportunity">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
            <Stat value={stats.openTasks.toLocaleString()} label="Open tasks right now" />
            <Stat value={stats.taskersTotal.toLocaleString()} label="Active taskers" />
            <Stat value={stats.ratingAvg ? stats.ratingAvg.toFixed(1) + '★' : '—'} label="Average platform rating" />
            <Stat value={stats.reviewCount.toLocaleString()} label="Reviews written" />
          </div>
        </Section>

        <Section>
          <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-space-2xl text-center">
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Start browsing now</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-sm">No commitment, no subscription — just real tasks waiting for someone like you.</p>
            <Link className="inline-block mt-space-md px-space-xl py-space-md rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold hover:bg-inverse-surface transition-all" href="/browse">Open the marketplace</Link>
          </div>
        </Section>
      </PageShell>
      <Footer />
    </>
  );
}
