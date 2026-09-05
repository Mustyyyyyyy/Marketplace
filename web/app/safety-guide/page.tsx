import MarketingHeader from '@/components/MarketingHeader';
import Footer from '@/components/Footer';
import { PageShell, PageHeader, Section, Card } from '@/components/Page';

export const metadata = { title: 'Safety guide — TaskSphere' };

export default function SafetyGuidePage() {
  return (
    <>
      <MarketingHeader />
      <PageShell>
        <PageHeader eyebrow="Safety guide" title="Stay safe on TaskSphere" subtitle="Practical advice for both customers and taskers, written by our Trust &amp; Safety team." />
        <Section title="For customers" eyebrow="Before, during, after">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {[
              { title: 'Check the tasker profile', body: 'KYC status, ratings and reviews. New taskers aren\u2019t bad — just take a bit more care.' },
              { title: 'Keep chat in-app', body: 'Off-platform contact is the #1 enabler of fraud. We can\u2019t protect you outside our messaging.' },
              { title: 'Be specific in your post', body: 'Clear scope = clear offers. Photos, measurements, and examples help.' },
              { title: 'Don\u2019t pay outside the app', body: 'Anyone asking for a deposit, gift card, or wire transfer is a scammer. Report and block.' },
              { title: 'Meet in public first', body: 'For in-home work, meet in a neutral public place the first time if you can.' },
              { title: 'Inspect the work', body: 'Use the in-app “Submit for review” flow and only release payment when you\u2019re happy.' },
            ].map((c) => (
              <Card key={c.title}><h3 className="font-headline-sm text-headline-sm font-bold">{c.title}</h3><p className="font-body-md text-body-md text-on-surface-variant mt-1">{c.body}</p></Card>
            ))}
          </div>
        </Section>
        <Section title="For taskers" eyebrow="Protect yourself">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {[
              { title: 'Read the full task', body: 'If it\u2019s vague, ask questions in chat before sending an offer. Document the scope.' },
              { title: 'Get changes in writing', body: 'If the customer asks for extra work after you start, agree on a price update in chat first.' },
              { title: 'Use the Submit flow', body: 'Always submit evidence in-app. Screenshot, photo or document the work before requesting release.' },
              { title: 'Decline unsafe work', body: 'You can refuse any job that puts you at risk, without penalty.' },
              { title: 'Set your rates', body: 'You decide your price. Don\u2019t undercut to win work you can\u2019t deliver well.' },
              { title: 'Cash flow tip', body: 'Funds release when the customer marks complete. Communicate if a release is delayed.' },
            ].map((c) => (
              <Card key={c.title}><h3 className="font-headline-sm text-headline-sm font-bold">{c.title}</h3><p className="font-body-md text-body-md text-on-surface-variant mt-1">{c.body}</p></Card>
            ))}
          </div>
        </Section>
      </PageShell>
      <Footer />
    </>
  );
}
