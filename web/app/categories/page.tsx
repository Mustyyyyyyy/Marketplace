import MarketingHeader from '@/components/MarketingHeader';
import Footer from '@/components/Footer';
import { PageShell, PageHeader } from '@/components/Page';
import Link from 'next/link';
import { api } from '@/lib/api';

export const metadata = { title: 'Browse categories — TaskSphere' };

const ICON_MAP: Record<string, string> = {
  home: 'home', cleaning: 'cleaning_services', plumbing: 'plumbing', electrical: 'bolt',
  'moving-delivery': 'local_shipping', handyman: 'handyman', tutoring: 'school',
  'tech-it': 'memory', 'web-development': 'code', 'mobile-development': 'phone_iphone',
  design: 'palette', 'graphic-design': 'brush', photography: 'photo_camera', events: 'celebration',
  beauty: 'spa', auto: 'directions_car', business: 'business_center', writing: 'edit_note',
};

export default async function CategoriesPage() {
  const res = await api('/api/categories').catch(() => ({ categories: [] }));
  const all = res.categories || [];
  const top = all.filter((c: any) => !all.find((p: any) => p.id === c.parentId));
  const byParent = all.reduce((acc: any, c: any) => { (acc[c.parentId] ||= []).push(c); return acc; }, {});

  return (
    <>
      <MarketingHeader />
      <PageShell>
        <PageHeader
          eyebrow="Browse categories"
          title="Find help across every service"
          subtitle="From cleaning to coding, moving to makeup — explore verified taskers in any category."
          ctas={[{ label: 'Post a task', href: '/get-started' }, { label: 'Become a tasker', href: '/become-a-tasker' }]}
        />
        <div className="space-y-space-2xl">
          {top.map((c: any) => (
            <section key={c.id}>
              <div className="flex items-center gap-space-sm mb-space-md">
                <span className="material-symbols-outlined text-3xl text-secondary">{ICON_MAP[c.icon || c.slug] || 'category'}</span>
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">{c.name}</h2>
                <Link href={`/browse?categoryId=${c.id}`} className="ml-auto font-label-lg text-label-lg text-secondary font-semibold hover:underline">View all →</Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-space-md">
                {byParent[c.id]?.length ? byParent[c.id].map((sub: any) => (
                  <Link key={sub.id} href={`/browse?categoryId=${sub.id}`} className="flex flex-col gap-space-xs p-space-md bg-surface-container-lowest rounded-2xl border border-outline-variant hover:border-secondary hover:shadow-md transition-all">
                    <span className="material-symbols-outlined text-2xl text-secondary">{ICON_MAP[sub.icon || sub.slug] || 'arrow_forward'}</span>
                    <span className="font-label-lg text-label-lg font-semibold text-on-surface">{sub.name}</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Browse →</span>
                  </Link>
                )) : (
                  <Link href={`/browse?categoryId=${c.id}`} className="col-span-full p-space-md bg-surface-container-lowest rounded-2xl border border-outline-variant hover:border-secondary hover:shadow-md transition-all text-on-surface font-label-lg text-label-lg font-semibold">Browse all {c.name} tasks →</Link>
                )}
              </div>
            </section>
          ))}
        </div>
      </PageShell>
      <Footer />
    </>
  );
}
