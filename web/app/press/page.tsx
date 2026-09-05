import MarketingHeader from '@/components/MarketingHeader';
import Footer from '@/components/Footer';
import { PageShell, PageHeader, Card, Section } from '@/components/Page';
import Link from 'next/link';

export const metadata = { title: 'Press — TaskSphere' };

export default function PressPage() {
  return (
    <>
      <MarketingHeader />
      <PageShell>
        <PageHeader eyebrow="Press" title="TaskSphere in the news" subtitle="Logos, screenshots, founder bios and our latest press releases. For interview requests, contact press@tasksphere.example." ctas={[{ label: 'Download press kit', href: '/contact' }, { label: 'Contact press', href: '/contact' }]} />
        <Section title="In the press" eyebrow="Recent coverage">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            {['TechCrunch', 'Wired', 'Bloomberg', 'The Guardian', 'Rest of World', 'Semafor'].map((p) => (
              <Card key={p}><h3 className="font-headline-sm text-headline-sm font-bold">{p}</h3><p className="font-body-md text-body-md text-on-surface-variant mt-1">Coverage and quotes from {p}.</p><Link className="inline-block mt-space-sm font-label-lg text-label-lg text-secondary font-semibold" href="/contact">Request link →</Link></Card>
            ))}
          </div>
        </Section>
        <Section title="Brand assets" eyebrow="Logos &amp; colors">
          <Card>
            <p className="font-body-md text-body-md text-on-surface-variant">Our logo, wordmark and color palette are available for editorial use. Please don't modify the logo or use it in a way that implies endorsement.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md mt-space-md">
              <div className="bg-primary-container text-on-primary rounded-xl p-space-lg text-center font-headline-sm">Primary</div>
              <div className="bg-secondary text-on-secondary rounded-xl p-space-lg text-center font-headline-sm">Secondary</div>
              <div className="bg-tertiary-container text-on-tertiary-container rounded-xl p-space-lg text-center font-headline-sm">Tertiary</div>
              <div className="bg-surface-container text-on-surface rounded-xl p-space-lg text-center font-headline-sm">Surface</div>
            </div>
          </Card>
        </Section>
      </PageShell>
      <Footer />
    </>
  );
}
