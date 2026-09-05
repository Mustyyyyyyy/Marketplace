import MarketingHeader from '@/components/MarketingHeader';
import Footer from '@/components/Footer';
import { PageShell, PageHeader, Section, Card } from '@/components/Page';
import Link from 'next/link';

export const metadata = { title: 'Careers — TaskSphere' };

const ROLES = [
  { team: 'Engineering', title: 'Senior Backend Engineer (Trust &amp; Safety)', loc: 'Remote · Global' },
  { team: 'Engineering', title: 'Staff iOS Engineer', loc: 'Remote · Global' },
  { team: 'Product', title: 'Product Manager — Marketplace', loc: 'Lagos · Hybrid' },
  { team: 'Design', title: 'Senior Product Designer', loc: 'London · Hybrid' },
  { team: 'Operations', title: 'Trust &amp; Safety Specialist', loc: 'Berlin · On-site' },
  { team: 'Marketing', title: 'Content &amp; SEO Lead', loc: 'Remote · Global' },
];

export default function CareersPage() {
  return (
    <>
      <MarketingHeader />
      <PageShell>
        <PageHeader eyebrow="Careers" title="Build the future of work with us" subtitle="We are a remote-first team across four continents, building a global marketplace that puts trust and craft first." ctas={[{ label: 'See open roles', href: '#roles' }, { label: 'About us', href: '/about' }]} />
        <Section title="Our values" eyebrow="Why join us">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            <Card><h3 className="font-headline-sm text-headline-sm font-bold">Build for the long term</h3><p className="font-body-md text-body-md text-on-surface-variant mt-1">We optimise for 10-year impact, not 10-day PR cycles.</p></Card>
            <Card><h3 className="font-headline-sm text-headline-sm font-bold">Distributed by default</h3><p className="font-body-md text-body-md text-on-surface-variant mt-1">Async-first, deep-work-friendly, with optional hubs in Lagos, London, NYC and Berlin.</p></Card>
            <Card><h3 className="font-headline-sm text-headline-sm font-bold">Generous ownership</h3><p className="font-body-md text-body-md text-on-surface-variant mt-1">Every employee gets equity. We win together.</p></Card>
          </div>
        </Section>
        <Section title="Open roles" eyebrow="We're hiring" id="roles">
          <div className="space-y-space-sm">
            {ROLES.map((r) => (
              <Card key={r.title} className="flex items-center justify-between flex-wrap gap-space-sm">
                <div>
                  <span className="px-space-sm py-1 rounded-full bg-surface-container text-on-surface text-[10px] font-bold uppercase">{r.team}</span>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-space-sm" dangerouslySetInnerHTML={{ __html: r.title }} />
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{r.loc}</p>
                </div>
                <Link className="font-label-lg text-label-lg text-secondary font-semibold" href="/contact">Apply →</Link>
              </Card>
            ))}
          </div>
        </Section>
      </PageShell>
      <Footer />
    </>
  );
}
