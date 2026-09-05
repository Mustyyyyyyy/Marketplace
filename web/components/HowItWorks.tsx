'use client';
import { useState } from 'react';

const STEPS = {
  customers: [
    { n: 1, title: 'Post a Task', body: 'Tell the community what you need done, whether remote or local. Add your exact requirements, budget and timing in minutes.' },
    { n: 2, title: 'Review Offers', body: 'Receive competitive offers from verified taskers. Compare profiles, ratings, portfolios and proposed timelines side-by-side.' },
    { n: 3, title: 'Hire & Relax', body: 'Hire the right match, chat securely, track progress, and release payment once the work is complete to your satisfaction.' },
  ],
  taskers: [
    { n: 1, title: 'Build Your Profile', body: 'Showcase your skills, certifications and portfolio. Get verified to stand out and unlock premium opportunities.' },
    { n: 2, title: 'Find Work', body: 'Browse local and remote tasks tailored to your skills. Submit proposals with your price and timeline in seconds.' },
    { n: 3, title: 'Get Paid', body: 'Complete jobs, submit evidence, and receive secure payments straight to your wallet. Build your reputation with every task.' },
  ],
} as const;

export default function HowItWorks() {
  const [tab, setTab] = useState<'customers' | 'taskers'>('customers');
  return (
    <section className="py-space-3xl" id="how-it-works">
      <div className="flex flex-col items-center text-center gap-space-xs mb-space-2xl">
        <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold text-secondary">Step-by-Step Flow</span>
        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">How TaskSphere Works</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Whether hiring expertise or completing assignments, our dual-sided platform provides transparent milestones from start to finish.
        </p>
        <div className="mt-space-md p-1 bg-surface-container rounded-xl flex items-center gap-1">
          <button onClick={() => setTab('customers')} className={`px-space-lg py-space-xs rounded-lg font-label-lg text-label-lg transition-all ${tab === 'customers' ? 'bg-surface-container-lowest text-on-surface font-bold shadow-sm' : 'font-semibold text-on-surface-variant hover:text-on-surface'}`}>For Customers (Post a Task)</button>
          <button onClick={() => setTab('taskers')} className={`px-space-lg py-space-xs rounded-lg font-label-lg text-label-lg transition-all ${tab === 'taskers' ? 'bg-surface-container-lowest text-on-surface font-bold shadow-sm' : 'font-semibold text-on-surface-variant hover:text-on-surface'}`}>For Taskers (Earn Money)</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
        {STEPS[tab].map((s) => (
          <div key={s.n} className="flex flex-col p-space-xl bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary font-headline-sm text-headline-sm font-bold mb-space-md">{s.n}</div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs">{s.title}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
