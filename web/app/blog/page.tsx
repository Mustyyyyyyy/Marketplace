import MarketingHeader from '@/components/MarketingHeader';
import Footer from '@/components/Footer';
import { PageShell, PageHeader, Card, Section } from '@/components/Page';
import Link from 'next/link';

export const metadata = { title: 'Blog — TaskSphere' };

const POSTS = [
  { tag: 'Product', title: 'Introducing in-app dispute resolution v2', excerpt: 'Faster, more transparent, and now with appeals — here is what is new.', date: 'Aug 12, 2026' },
  { tag: 'Trust &amp; safety', title: 'How we caught the largest account takeover attempt of the year', excerpt: 'A behind-the-scenes look at our detection systems in action.', date: 'Jul 28, 2026' },
  { tag: 'Engineering', title: 'Scaling TaskSphere to 10 million users', excerpt: 'Caching, queueing, and the database choices that got us there.', date: 'Jul 15, 2026' },
  { tag: 'Community', title: 'Meet our top 10 taskers of Q2', excerpt: 'Real stories from people who turned skills into full-time income.', date: 'Jun 30, 2026' },
];

export default function BlogPage() {
  return (
    <>
      <MarketingHeader />
      <PageShell>
        <PageHeader eyebrow="Blog" title="Notes from the team" subtitle="Product updates, engineering deep-dives, and stories from our community." />
        <Section title="Latest" eyebrow="Recent posts">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {POSTS.map((p) => (
              <Card key={p.title}>
                <span className="px-space-sm py-1 rounded-full bg-surface-container text-on-surface text-[10px] font-bold uppercase">{p.tag}</span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-space-sm">{p.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">{p.excerpt}</p>
                <div className="flex items-center justify-between mt-space-md">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">{p.date}</span>
                  <Link className="font-label-md text-label-md text-secondary font-semibold" href="/blog">Read →</Link>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      </PageShell>
      <Footer />
    </>
  );
}
