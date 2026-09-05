import MarketingHeader from '@/components/MarketingHeader';
import Footer from '@/components/Footer';
import { PageShell, PageHeader, Section, Card, Stat } from '@/components/Page';
import Link from 'next/link';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Find taskers — TaskSphere' };

const FILTERS = [
  { icon: 'search', title: 'By skill', body: 'Search by service, software, or trade.' },
  { icon: 'verified', title: 'Verified profiles only', body: 'Filter to KYC-verified, top-rated, background-checked taskers.' },
  { icon: 'schedule', title: 'By availability', body: 'Find taskers available right now, this week, or any time.' },
  { icon: 'attach_money', title: 'By price', body: 'Set your budget and we will show taskers that fit.' },
  { icon: 'location_on', title: 'Local or remote', body: 'Choose between in-person taskers near you or remote specialists anywhere.' },
  { icon: 'workspace_premium', title: 'Pro taskers', body: 'Pro taskers have passed interviews, skills tests and a quality review.' },
];

export default async function FindTaskersPage() {
  const stats = await api('/api/public/stats').catch(() => ({ taskersTotal: 0, ratingAvg: 0 }));
  return (
    <>
      <MarketingHeader />
      <PageShell>
        <PageHeader
          eyebrow="For customers"
          title="Find the right person for the job"
          subtitle="Browse profiles, compare reviews, and hire with confidence. Every tasker is email, phone and ID verified."
          ctas={[
            { label: 'Browse taskers', href: '/taskers' },
            { label: 'Post a task', href: '/get-started' },
          ]}
        />

        <Section title="Smart filters" eyebrow="Search the way you want">
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

        <Section title="What you get" eyebrow="Trust built-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
            <Stat value="100%" label="ID-verified" />
            <Stat value="Escrow" label="Funds held safely" />
            <Stat value="48h" label="Dispute resolution" />
            <Stat value={stats.taskersTotal.toLocaleString()} label="Active taskers" />
          </div>
        </Section>

        <Section>
          <div className="rounded-2xl bg-primary-container text-on-primary p-space-2xl text-center">
            <h2 className="font-headline-lg text-headline-lg font-bold tracking-tight">Get help in minutes</h2>
            <p className="font-body-lg text-body-lg text-on-primary-container mt-space-sm">Post a task and start receiving offers right away from {stats.taskersTotal.toLocaleString()} verified taskers.</p>
            <Link className="inline-block mt-space-md px-space-xl py-space-md rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg font-bold hover:bg-secondary-container transition-all" href="/get-started">Post your task</Link>
          </div>
        </Section>
      </PageShell>
      <Footer />
    </>
  );
}
