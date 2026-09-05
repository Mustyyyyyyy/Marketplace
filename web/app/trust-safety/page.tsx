import MarketingHeader from '@/components/MarketingHeader';
import Footer from '@/components/Footer';
import { PageShell, PageHeader, Section, Card } from '@/components/Page';
import Link from 'next/link';

export const metadata = { title: 'Trust & safety — TaskSphere' };

const PILLARS = [
  { icon: 'verified_user', title: 'Verified profiles', body: 'Every user verifies their email, phone, and government ID. Pro taskers pass additional checks.' },
  { icon: 'account_balance', title: 'Secure escrow', body: 'Customer funds are held safely until the work is approved. If something goes wrong, our support team mediates.' },
  { icon: 'forum', title: 'In-app messaging', body: 'Keep all communication on the platform for your safety and dispute protection.' },
  { icon: 'gavel', title: 'Dispute resolution', body: '48-hour SLA on disputes, with trained specialists and a clear appeals process.' },
  { icon: 'shield', title: 'Account protection', body: '2FA, login alerts, device management, and automatic blocking of suspicious activity.' },
  { icon: 'report', title: 'Report & block', body: 'One-tap reporting for users, tasks, messages and reviews. Zero tolerance for abuse.' },
];

export default function TrustSafetyPage() {
  return (
    <>
      <MarketingHeader />
      <PageShell>
        <PageHeader
          eyebrow="Trust & safety"
          title="Your safety is the foundation"
          subtitle="TaskSphere is built to keep both customers and taskers safe — from identity checks to dispute resolution."
          ctas={[
            { label: 'Read our safety guide', href: '/safety-guide' },
            { label: 'Report a problem', href: '/report' },
          ]}
        />

        <Section title="What we do" eyebrow="Six pillars">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
            {PILLARS.map((p) => (
              <Card key={p.title}>
                <span className="material-symbols-outlined text-3xl text-secondary">{p.icon}</span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-space-sm">{p.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">{p.body}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="More resources" eyebrow="Dig deeper">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            <Card><h3 className="font-headline-sm text-headline-sm font-bold">Anti-fraud</h3><p className="font-body-md text-body-md text-on-surface-variant mt-1">How we detect and prevent fraud.</p><Link className="inline-block mt-space-sm font-label-lg text-label-lg text-secondary font-semibold" href="/anti-fraud">Read more →</Link></Card>
            <Card><h3 className="font-headline-sm text-headline-sm font-bold">Identity verification</h3><p className="font-body-md text-body-md text-on-surface-variant mt-1">How KYC works on TaskSphere.</p><Link className="inline-block mt-space-sm font-label-lg text-label-lg text-secondary font-semibold" href="/kyc">Read more →</Link></Card>
            <Card><h3 className="font-headline-sm text-headline-sm font-bold">Disputes &amp; refunds</h3><p className="font-body-md text-body-md text-on-surface-variant mt-1">What happens when something goes wrong.</p><Link className="inline-block mt-space-sm font-label-lg text-label-lg text-secondary font-semibold" href="/disputes">Read more →</Link></Card>
          </div>
        </Section>
      </PageShell>
      <Footer />
    </>
  );
}
