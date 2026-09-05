import MarketingHeader from '@/components/MarketingHeader';
import Footer from '@/components/Footer';
import { PageShell, PageHeader, Section, Card } from '@/components/Page';
import Link from 'next/link';

export const metadata = { title: 'Help center — TaskSphere' };

const TOPICS = [
  { icon: 'post_add', title: 'Posting a task', body: 'How to write a great task, choose between local and remote, and set the right budget.' },
  { icon: 'handshake', title: 'Hiring &amp; offers', body: 'Comparing offers, what to look for in a tasker, and how to accept the right one.' },
  { icon: 'forum', title: 'Messaging', body: 'In-app chat, sharing files, reporting abusive messages.' },
  { icon: 'payments', title: 'Payments &amp; fees', body: 'How escrow works, supported methods, and what the service fee covers.' },
  { icon: 'verified', title: 'Trust &amp; verification', body: 'KYC, background checks and what they mean.' },
  { icon: 'gavel', title: 'Disputes', body: 'When and how to open a dispute, evidence to include, and what to expect.' },
];

export default function HelpPage() {
  return (
    <>
      <MarketingHeader />
      <PageShell>
        <PageHeader eyebrow="Help center" title="How can we help?" subtitle="Search the help center, browse popular topics, or contact our support team." ctas={[{ label: 'Contact support', href: '/contact' }]} />
        <Section title="Popular topics" eyebrow="Browse by topic">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
            {TOPICS.map((t) => (
              <Card key={t.title}>
                <span className="material-symbols-outlined text-3xl text-secondary">{t.icon}</span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-space-sm" dangerouslySetInnerHTML={{ __html: t.title }} />
                <p className="font-body-md text-body-md text-on-surface-variant mt-1" dangerouslySetInnerHTML={{ __html: t.body }} />
              </Card>
            ))}
          </div>
        </Section>
        <Section title="Still stuck?" eyebrow="Talk to us">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            <Card><h3 className="font-headline-sm text-headline-sm font-bold">Safety guide</h3><p className="font-body-md text-body-md text-on-surface-variant mt-1">Best practices for staying safe.</p><Link className="inline-block mt-space-sm font-label-lg text-label-lg text-secondary font-semibold" href="/safety-guide">Read more →</Link></Card>
            <Card><h3 className="font-headline-sm text-headline-sm font-bold">Report abuse</h3><p className="font-body-md text-body-md text-on-surface-variant mt-1">Tell us about a violation.</p><Link className="inline-block mt-space-sm font-label-lg text-label-lg text-secondary font-semibold" href="/report">File a report →</Link></Card>
            <Card><h3 className="font-headline-sm text-headline-sm font-bold">Contact</h3><p className="font-body-md text-body-md text-on-surface-variant mt-1">Reach a human, weekdays.</p><Link className="inline-block mt-space-sm font-label-lg text-label-lg text-secondary font-semibold" href="/contact">Open contact form →</Link></Card>
          </div>
        </Section>
      </PageShell>
      <Footer />
    </>
  );
}
