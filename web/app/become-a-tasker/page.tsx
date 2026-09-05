import MarketingHeader from '@/components/MarketingHeader';
import Footer from '@/components/Footer';
import { PageShell, PageHeader, Section, Card, Stat } from '@/components/Page';
import Link from 'next/link';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Become a tasker — TaskSphere' };

const STEPS = [
  { n: 1, title: 'Sign up free', body: 'Create an account in 30 seconds. Tell us your skills, experience and where you want to work.' },
  { n: 2, title: 'Verify your identity', body: 'Verify your email, phone and government ID. Pro taskers also pass a short video interview.' },
  { n: 3, title: 'Build your profile', body: 'Add a bio, your skills, certifications, a portfolio of past work, and your availability.' },
  { n: 4, title: 'Win work', body: 'Browse tasks or get matched automatically. Send great proposals and grow your reputation.' },
];

const PERKS = [
  { icon: 'payments', title: 'Get paid fast', body: 'Funds released the moment a customer marks your work complete — directly to your bank or wallet.' },
  { icon: 'schedule', title: 'Work on your terms', body: 'Set your own hours, choose the work you want, and work from anywhere in the world.' },
  { icon: 'shield', title: 'We have your back', body: 'A dedicated support team, dispute resolution, and escrow protection for qualifying jobs.' },
  { icon: 'trending_up', title: 'Grow your business', body: 'Pro taskers get priority placement, business tools, and tax-ready income reports.' },
];

export default async function BecomeATaskerPage() {
  const stats = await api('/api/public/stats').catch(() => ({ taskersTotal: 0, tasksTotal: 0, completedTasks: 0 }));
  return (
    <>
      <MarketingHeader />
      <PageShell>
        <PageHeader
          eyebrow="Earn money"
          title="Turn your skills into income"
          subtitle="Join thousands of taskers building their business on TaskSphere. Set your own prices, choose your hours, get paid securely."
          ctas={[
            { label: 'Get started — it\u2019s free', href: '/get-started' },
            { label: 'Browse open tasks', href: '/browse' },
          ]}
        />

        <Section title="How to start" eyebrow="Get going in minutes">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
            {STEPS.map((s) => (
              <Card key={s.n}>
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary font-headline-sm text-headline-sm font-bold">{s.n}</div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-space-md">{s.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">{s.body}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="Why taskers love us" eyebrow="Perks">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
            {PERKS.map((p) => (
              <Card key={p.title}>
                <span className="material-symbols-outlined text-3xl text-secondary">{p.icon}</span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-space-sm">{p.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">{p.body}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="By the numbers" eyebrow="Top earners on TaskSphere">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
            <Stat value={stats.taskersTotal.toLocaleString()} label="Active taskers" />
            <Stat value={stats.completedTasks.toLocaleString()} label="Jobs completed" />
            <Stat value={stats.tasksTotal.toLocaleString()} label="Total tasks posted" />
            <Stat value="$0" label="Up-front cost to sign up" />
          </div>
        </Section>

        <Section>
          <div className="rounded-2xl bg-primary-container text-on-primary p-space-2xl text-center">
            <h2 className="font-headline-lg text-headline-lg font-bold tracking-tight">Your next opportunity is one click away</h2>
            <p className="font-body-lg text-body-lg text-on-primary-container mt-space-sm">Create your free profile today. No subscription, no exclusivity.</p>
            <Link className="inline-block mt-space-md px-space-xl py-space-md rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg font-bold hover:bg-secondary-container transition-all" href="/get-started">Create my tasker profile</Link>
          </div>
        </Section>
      </PageShell>
      <Footer />
    </>
  );
}
