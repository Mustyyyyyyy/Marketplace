import { api } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MarketingHeader from '@/components/MarketingHeader';
import Footer from '@/components/Footer';

export default async function TaskPage({ params }: { params: { id: string } }) {
  let t: any = null;
  try { t = await api(`/api/tasks/${params.id}`); } catch { notFound(); }
  if (!t) notFound();
  return (
    <>
      <MarketingHeader />
      <main className="w-full pt-28 bg-surface max-w-container-max mx-auto px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop pb-space-3xl">
        <Link href="/browse" className="text-secondary font-label-lg text-label-lg">← Back to browse</Link>
        <article className="bg-surface-container-lowest rounded-2xl p-space-xl mt-space-md border border-outline-variant">
          <div className="flex flex-wrap gap-space-xs mb-space-md">
            <span className="px-space-sm py-1 rounded-full bg-secondary text-on-secondary text-[10px] font-bold uppercase">{t.status}</span>
            <span className="px-space-sm py-1 rounded-full bg-surface-container text-on-surface text-[10px] font-bold uppercase">{t.mode}</span>
            <span className="px-space-sm py-1 rounded-full bg-surface-container text-on-surface text-[10px] font-bold uppercase">{t.budgetType}</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl-mobile font-bold text-on-surface">{t.title}</h1>
          <div className="font-display-hero text-display-hero-mobile font-extrabold text-secondary mt-space-sm">{t.currency} {Number(t.budgetAmount).toLocaleString()}</div>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-md whitespace-pre-line">{t.description}</p>
          {t.city ? <p className="font-body-md text-body-md text-on-surface-variant mt-space-md">📍 {t.city}, {t.country}</p> : null}
          <div className="mt-space-xl flex flex-wrap gap-space-md">
            <Link href="/dashboard/tasks/new" className="px-space-xl py-space-md rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold">Post a similar task</Link>
            <Link href="/find-taskers" className="px-space-xl py-space-md rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg font-semibold">Find taskers</Link>
            <Link href="/trust-safety" className="px-space-xl py-space-md rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg font-semibold">Trust &amp; safety</Link>
            <Link href="/browse" className="px-space-xl py-space-md rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg font-semibold">Browse more</Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
