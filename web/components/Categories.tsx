import Link from 'next/link';

const ICON_MAP: Record<string, string> = {
  home: 'home', cleaning: 'cleaning_services', plumbing: 'plumbing', electrical: 'bolt',
  'moving-delivery': 'local_shipping', handyman: 'handyman', tutoring: 'school',
  'tech-it': 'memory', 'web-development': 'code', 'mobile-development': 'phone_iphone',
  design: 'palette', 'graphic-design': 'brush', photography: 'photo_camera', events: 'celebration',
  beauty: 'spa', auto: 'directions_car', business: 'business_center', writing: 'edit_note',
};

export default function Categories({ categories }: { categories: { id: string; name: string; slug: string; icon?: string }[] }) {
  const top = categories.filter((c) => !categories.find((p) => p.id === (c as any).parentId));
  return (
    <section className="py-space-3xl" id="categories">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold text-secondary">Browse Categories</span>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mt-2">Find help across every service</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">From cleaning to coding — explore trusted taskers in any category.</p>
        </div>
        <Link href="/browse" className="font-label-lg text-label-lg text-secondary font-semibold hover:underline">View all →</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-md">
        {top.map((c) => (
          <Link
            key={c.id}
            href={`/browse?categoryId=${c.id}`}
            className="group flex flex-col items-center gap-space-xs p-space-lg bg-surface-container-lowest rounded-2xl border border-outline-variant hover:border-secondary hover:shadow-md transition-all"
          >
            <span className="material-symbols-outlined text-3xl text-secondary group-hover:scale-110 transition-transform">{ICON_MAP[c.icon || c.slug] || 'category'}</span>
            <span className="font-label-lg text-label-lg font-semibold text-on-surface text-center">{c.name}</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Browse</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
