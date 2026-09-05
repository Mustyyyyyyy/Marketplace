import MarketingHeader from '@/components/MarketingHeader';
import Footer from '@/components/Footer';
import { PageShell, PageHeader, Section, Card } from '@/components/Page';

export const metadata = { title: 'Disputes & refunds — TaskSphere' };

export default function DisputesPage() {
  return (
    <>
      <MarketingHeader />
      <PageShell>
        <PageHeader eyebrow="Disputes" title="When something goes wrong, we make it right" subtitle="Our trained dispute specialists review every case within 48 hours, with clear evidence rules for both sides." />
        <Section title="How it works" eyebrow="The process">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            {[
              { n: 1, title: 'Open a dispute', body: 'From the task page, tap "Open dispute" and pick a reason. Add a short description and any evidence (photos, files, chat screenshots).' },
              { n: 2, title: 'Specialist review', body: 'A trained specialist reviews evidence from both sides. Most decisions come within 48 hours.' },
              { n: 3, title: 'Resolution', body: 'We may issue a full refund, partial refund, release funds to the tasker, or require more work. Either side can appeal once.' },
            ].map((s) => (
              <Card key={s.n}>
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary font-headline-sm text-headline-sm font-bold">{s.n}</div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-space-md">{s.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">{s.body}</p>
              </Card>
            ))}
          </div>
        </Section>
        <Section title="What helps your case" eyebrow="Evidence that matters">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-space-md text-on-surface-variant font-body-md text-body-md list-disc pl-space-lg">
            <li>Original task description and any agreed scope changes in chat</li>
            <li>Photos of work delivered (or the issue, if complaining)</li>
            <li>Screenshots of relevant messages</li>
            <li>Receipts for any materials or expenses</li>
          </ul>
        </Section>
      </PageShell>
      <Footer />
    </>
  );
}
