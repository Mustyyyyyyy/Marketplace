import MarketingHeader from '@/components/MarketingHeader';
import Footer from '@/components/Footer';
import { PageShell, PageHeader, Section, Card } from '@/components/Page';

export const metadata = { title: 'Identity verification (KYC) — TaskSphere' };

export default function KycPage() {
  return (
    <>
      <MarketingHeader />
      <PageShell>
        <PageHeader
          eyebrow="Identity verification"
          title="KYC: who we verify, and how"
          subtitle="Identity verification protects everyone. Here is what we check, how we check it, and what we never do with your data."
        />
        <Section title="What we verify" eyebrow="The basics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            <Card><h3 className="font-headline-sm text-headline-sm font-bold">Email &amp; phone</h3><p className="font-body-md text-body-md text-on-surface-variant mt-1">Every account is tied to a unique, verified email and phone number.</p></Card>
            <Card><h3 className="font-headline-sm text-headline-sm font-bold">Government ID</h3><p className="font-body-md text-body-md text-on-surface-variant mt-1">We verify government-issued ID for taskers and customers handling high-value work.</p></Card>
            <Card><h3 className="font-headline-sm text-headline-sm font-bold">Selfie match</h3><p className="font-body-md text-body-md text-on-surface-variant mt-1">A live selfie is matched to the ID photo using our partner vendor\u2019s liveness check.</p></Card>
          </div>
        </Section>
        <Section title="Pro taskers" eyebrow="Extra checks">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            <Card><h3 className="font-headline-sm text-headline-sm font-bold">Skills assessment</h3><p className="font-body-md text-body-md text-on-surface-variant mt-1">Short, role-specific quizzes to validate claimed skills.</p></Card>
            <Card><h3 className="font-headline-sm text-headline-sm font-bold">Background checks (where available)</h3><p className="font-body-md text-body-md text-on-surface-variant mt-1">Optional background screening is available in the US, UK and EU for an additional fee paid by the tasker.</p></Card>
          </div>
        </Section>
        <Section title="Your privacy" eyebrow="Data handling">
          <Card>
            <p className="font-body-md text-body-md text-on-surface-variant">Your ID is encrypted at rest and in transit, accessible only to a small number of trained verification specialists. We never sell your data, and we automatically delete ID images after 30 days unless an active dispute requires them. You can request export or deletion at any time from <a className="text-secondary font-semibold" href="/dashboard/settings">Settings → Privacy</a>.</p>
          </Card>
        </Section>
      </PageShell>
      <Footer />
    </>
  );
}
