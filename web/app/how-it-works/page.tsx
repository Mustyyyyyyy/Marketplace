import MarketingHeader from '@/components/MarketingHeader';
import Footer from '@/components/Footer';
import { PageShell, PageHeader, Section, Card } from '@/components/Page';
import { api } from '@/lib/api';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'How it works — TaskSphere' };

export default async function HowItWorksPage() {
  const stats = await api('/api/public/stats').catch(() => ({ taskersTotal: 0, tasksTotal: 0 }));

  const CUSTOMER = [
    { n: 1, title: 'Post your task', body: 'Tell us what you need. Local or remote, big or small — free to post.' },
    { n: 2, title: 'Compare offers', body: 'Get offers from verified taskers within minutes. Compare profiles, ratings, prices and reviews side-by-side.' },
    { n: 3, title: 'Hire & chat', body: 'Pick the right person, chat in-app, agree on details. We hold payment securely until the work is done.' },
    { n: 4, title: 'Approve & release', body: 'When the work is complete, review it, release payment, and leave a review.' },
  ];
  const TASKER = [
    { n: 1, title: 'Build your profile', body: 'Add your skills, portfolio, certifications and a friendly bio. Get verified to stand out.' },
    { n: 2, title: 'Find work you love', body: 'Browse local and remote tasks, or get matched with work that fits your skills.' },
    { n: 3, title: 'Send great proposals', body: 'Stand out with a thoughtful proposal and a clear price and timeline.' },
    { n: 4, title: 'Get paid securely', body: 'Complete the job, submit evidence, and get paid straight to your wallet.' },
  ];

  const FAQ = [
    { q: 'How much does it cost to post a task?', a: 'Posting a task is free. You only pay when you accept an offer — payment is held in escrow and released once the work is complete.' },
    { q: 'How are taskers vetted?', a: 'We verify email, phone, and government ID. You can see each tasker\u2019s verification status on their profile.' },
    { q: 'What if something goes wrong?', a: 'Open a dispute from the task page. Our support team reviews evidence from both sides and resolves within 48 hours, with refunds when appropriate.' },
    { q: 'Which countries do you support?', a: 'We are live in Nigeria, the UK, the US, Germany, France, Ireland and the Netherlands, with more countries rolling out every quarter.' },
    { q: 'How do payments work?', a: 'Customers can pay by card, bank transfer, or mobile money. Taskers receive funds in their local currency after a job is marked complete.' },
    { q: 'Is there a mobile app?', a: 'Yes — search for TaskSphere on the App Store and Google Play.' },
  ];

  return (
    <>
      <MarketingHeader />
      <PageShell>
        <PageHeader
          eyebrow="Step by step"
          title="How TaskSphere works"
          subtitle="Whether you need help or want to earn, here's how the platform moves you from hello to done."
          ctas={[
            { label: 'Get started', href: '/get-started' },
            { label: 'Become a tasker', href: '/become-a-tasker' },
          ]}
        />

        <Section title="For customers" eyebrow="Post a task" >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
            {CUSTOMER.map((s) => (
              <Card key={s.n}>
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary font-headline-sm text-headline-sm font-bold">{s.n}</div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-space-md">{s.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">{s.body}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="For taskers" eyebrow="Earn money">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
            {TASKER.map((s) => (
              <Card key={s.n}>
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary font-headline-sm text-headline-sm font-bold">{s.n}</div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-space-md">{s.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">{s.body}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="Common questions" eyebrow="FAQ">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md max-w-4xl mx-auto">
            {FAQ.map((f) => (
              <Card key={f.q}>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{f.q}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">{f.a}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section>
          <div className="rounded-2xl bg-primary-container text-on-primary p-space-2xl text-center">
            <h2 className="font-headline-lg text-headline-lg font-bold tracking-tight">Ready to dive in?</h2>
            <p className="font-body-lg text-body-lg text-on-primary-container mt-space-sm">Join {stats.taskersTotal.toLocaleString()} taskers and {stats.tasksTotal.toLocaleString()} tasks posted on TaskSphere.</p>
            <div className="flex flex-wrap items-center justify-center gap-space-md pt-space-md">
              <Link className="px-space-xl py-space-md rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg font-bold hover:bg-secondary-container transition-all" href="/get-started">Post your first task</Link>
              <Link className="px-space-xl py-space-md rounded-xl bg-surface-container-lowest text-on-surface font-label-lg text-label-lg font-semibold hover:bg-surface-container transition-all" href="/become-a-tasker">Become a tasker</Link>
            </div>
          </div>
        </Section>
      </PageShell>
      <Footer />
    </>
  );
}
