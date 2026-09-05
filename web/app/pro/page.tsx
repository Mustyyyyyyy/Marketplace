import MarketingHeader from '@/components/MarketingHeader';
import Footer from '@/components/Footer';
import { PageShell, PageHeader, Section, Card, Stat } from '@/components/Page';
import Link from 'next/link';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pro program — TaskSphere' };

const PERKS = [
  { icon: 'workspace_premium', title: 'Pro membership', body: 'Stand out with a verified Pro mark on your profile and offers.' },
  { icon: 'trending_up', title: 'Priority placement', body: 'Pro taskers rank higher in search and recommendations.' },
  { icon: 'workspace_premium', title: 'Business tools', body: 'Invoicing, expense tracking, multi-seat accounts, and tax-ready reports.' },
  { icon: 'support_agent', title: 'Priority support', body: 'Skip the queue with a dedicated Pro support channel.' },
  { icon: 'school', title: 'Free skills training', body: 'Monthly live workshops and on-demand courses.' },
  { icon: 'card_membership', title: 'Member pricing', body: 'Reduced fees on background checks, KYC, and currency conversion.' },
];

export default async function ProPage() {
  const stats = await api('/api/public/stats').catch(() => ({ taskersTotal: 0, ratingAvg: 0, reviewCount: 0, completedTasks: 0 }));
  return (
    <>
      <MarketingHeader />
      <PageShell>
        <PageHeader eyebrow="Pro program" title="For taskers who mean business" subtitle="Pro is our membership for full-time taskers. More visibility, better tools, lower fees, faster support." ctas={[{ label: 'Join Pro', href: '/get-started' }]} />
        <Section title="Pro by the numbers" eyebrow="Impact">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
            <Stat value={stats.taskersTotal.toLocaleString()} label="Taskers on the platform" />
            <Stat value={stats.completedTasks.toLocaleString()} label="Jobs completed" />
            <Stat value={stats.ratingAvg ? stats.ratingAvg.toFixed(1) + '★' : '—'} label="Average platform rating" />
            <Stat value={stats.reviewCount.toLocaleString()} label="Reviews written" />
          </div>
        </Section>
        <Section title="What's included" eyebrow="Pro perks">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
            {PERKS.map((p) => (
              <Card key={p.title}>
                <span className="material-symbols-outlined text-3xl text-secondary">{p.icon}</span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-space-sm">{p.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">{p.body}</p>
              </Card>
            ))}
          </div>
        </Section>
        <Section>
          <div className="rounded-2xl bg-primary-container text-on-primary p-space-2xl text-center">
            <h2 className="font-headline-lg text-headline-lg font-bold">Ready to go Pro?</h2>
            <p className="font-body-lg text-body-lg text-on-primary-container mt-space-sm">Apply in 2 minutes. We&apos;ll review your profile and get back to you.</p>
            <Link className="inline-block mt-space-md px-space-xl py-space-md rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg font-bold hover:bg-secondary-container transition-all" href="/get-started">Apply now</Link>
          </div>
        </Section>
      </PageShell>
      <Footer />
    </>
  );
}
