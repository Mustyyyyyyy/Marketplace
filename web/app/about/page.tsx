import MarketingHeader from '@/components/MarketingHeader';
import Footer from '@/components/Footer';
import { PageShell, PageHeader, Section, Card, Stat } from '@/components/Page';
import Link from 'next/link';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'About — TaskSphere' };

export default async function AboutPage() {
  const stats = await api('/api/public/stats').catch(() => ({ tasksTotal: 0, taskersTotal: 0, ratingAvg: 0, reviewCount: 0 }));

  const VALUES = [
    { icon: 'verified_user', title: 'Trust first', body: 'Verified profiles, secure messaging and a fair dispute process keep both sides safe.' },
    { icon: 'diversity_3', title: 'Built for everyone', body: 'From Lagos to London, Madrid to Manila — anyone can find help or earn.' },
    { icon: 'bolt', title: 'Move fast', body: 'Open tasks get offers quickly. Same-day help is the norm, not the exception.' },
    { icon: 'school', title: 'Skill-first economy', body: 'We help people turn what they know into income — and help others get more done.' },
  ];

  return (
    <>
      <MarketingHeader />
      <PageShell>
        <PageHeader
          eyebrow="Our story"
          title="A marketplace built on real human help"
          subtitle="TaskSphere connects people who need a job done with the people who can do it — locally and remotely, anywhere in the world."
        />

        <Section title="What we believe" eyebrow="Our values">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
            {VALUES.map((v) => (
              <Card key={v.title}>
                <span className="material-symbols-outlined text-3xl text-secondary">{v.icon}</span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-space-sm">{v.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">{v.body}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="The numbers" eyebrow="By the numbers">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
            <Stat value={stats.tasksTotal.toLocaleString()} label="Tasks posted" />
            <Stat value={stats.ratingAvg ? stats.ratingAvg.toFixed(1) + '★' : '—'} label={stats.reviewCount ? `Average rating (${stats.reviewCount} reviews)` : 'Average rating'} />
            <Stat value={stats.taskersTotal.toLocaleString()} label="Taskers on the platform" />
            <Stat value="7" label="Countries served" />
          </div>
        </Section>

        <Section eyebrow="Want to work with us?" title="Join us">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            <Card><h3 className="font-headline-sm text-headline-sm font-bold">We're hiring</h3><p className="font-body-md text-body-md text-on-surface-variant mt-1">Remote-first team across continents.</p><Link className="inline-block mt-space-sm font-label-lg text-label-lg text-secondary font-semibold" href="/careers">View open roles →</Link></Card>
            <Card><h3 className="font-headline-sm text-headline-sm font-bold">Press &amp; media</h3><p className="font-body-md text-body-md text-on-surface-variant mt-1">Logos, screenshots and founder bios.</p><Link className="inline-block mt-space-sm font-label-lg text-label-lg text-secondary font-semibold" href="/press">Press kit →</Link></Card>
            <Card><h3 className="font-headline-sm text-headline-sm font-bold">Get in touch</h3><p className="font-body-md text-body-md text-on-surface-variant mt-1">Partnerships, press, or just saying hi.</p><Link className="inline-block mt-space-sm font-label-lg text-label-lg text-secondary font-semibold" href="/contact">Contact us →</Link></Card>
          </div>
        </Section>
      </PageShell>
      <Footer />
    </>
  );
}
