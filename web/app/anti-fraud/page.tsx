import MarketingHeader from '@/components/MarketingHeader';
import Footer from '@/components/Footer';
import { PageShell, PageHeader, Section, Card } from '@/components/Page';

export const metadata = { title: 'Anti-fraud — TaskSphere' };

export default function AntiFraudPage() {
  return (
    <>
      <MarketingHeader />
      <PageShell>
        <PageHeader eyebrow="Anti-fraud" title="How we fight fraud, scams and abuse" subtitle="Fraud prevention is built into every layer of TaskSphere — from sign-up to payout." />
        <Section title="The threats we defend against" eyebrow="Threat model">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {[
              { icon: 'person_off', title: 'Fake accounts', body: 'Phone and email verification, device fingerprinting, and velocity checks stop multi-account abuse.' },
              { icon: 'sync_alt', title: 'Account takeover', body: '2FA, login alerts, and impossible-travel detection on every login.' },
              { icon: 'gpp_maybe', title: 'Payment fraud', body: 'Card verification, 3-D Secure, daily payout limits, and manual review for first withdrawals.' },
              { icon: 'report', title: 'Review manipulation', body: 'Only verified completed-task reviews count. Patterns of suspicious reviews are flagged and removed.' },
              { icon: 'phishing', title: 'Off-platform scams', body: 'We never let users share phone numbers or external links in chat. Anyone asking you to pay outside the app is a red flag.' },
              { icon: 'group_off', title: 'Collusion', body: 'We analyse offer patterns to detect taskers and customers working together to manipulate pricing or reviews.' },
            ].map((t) => (
              <Card key={t.title}>
                <span className="material-symbols-outlined text-3xl text-secondary">{t.icon}</span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-space-sm">{t.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">{t.body}</p>
              </Card>
            ))}
          </div>
        </Section>
        <Section title="What to do if you spot something" eyebrow="Report abuse">
          <Card>
            <p className="font-body-md text-body-md text-on-surface-variant">If a user asks you to pay outside the platform, share personal contact info, or behaves suspiciously, <a className="text-secondary font-semibold" href="/report">report them immediately</a>. We review every report within 24 hours.</p>
          </Card>
        </Section>
      </PageShell>
      <Footer />
    </>
  );
}
