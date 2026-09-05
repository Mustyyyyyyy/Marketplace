import { api } from '@/lib/api';
import MarketingHeader from '@/components/MarketingHeader';
import Hero from '@/components/Hero';
import SearchBar from '@/components/SearchBar';
import HowItWorks from '@/components/HowItWorks';
import Categories from '@/components/Categories';
import TaskerShowcase from '@/components/TaskerShowcase';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let categories: { id: string; name: string; slug: string; icon?: string; children?: any[] }[] = [];
  let stats: { tasksTotal: number; completedTasks: number; taskersTotal: number; categoriesTotal: number; openTasks: number; ratingAvg: number; reviewCount: number } = { tasksTotal: 0, completedTasks: 0, taskersTotal: 0, categoriesTotal: 0, openTasks: 0, ratingAvg: 0, reviewCount: 0 };
  try { const res = await api('/api/categories'); categories = res.categories || []; } catch {}
  try { stats = await api('/api/public/stats'); } catch {}

  return (
    <>
      <MarketingHeader />
      <main className="w-full pt-20 bg-surface flex-grow max-w-container-max mx-auto px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop">
        <Hero stats={stats} />
        <SearchBar categories={categories} />
        <HowItWorks />
        <Categories categories={categories} />
        <TaskerShowcase />
        <CTA stats={stats} />
      </main>
      <Footer />
    </>
  );
}
