import Link from 'next/link';

export default function CTA({ stats }: { stats: { openTasks: number; taskersTotal: number; tasksTotal: number; ratingAvg: number } }) {
  return (
    <section className="py-space-3xl" id="become-a-tasker">
      <div className="relative overflow-hidden rounded-2xl bg-primary-container text-on-primary p-space-2xl">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-space-xl items-center">
          <div className="flex flex-col gap-space-md">
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold text-secondary-fixed">Start earning today</span>
            <h2 className="font-headline-lg text-headline-lg font-bold tracking-tight">Ready to turn your skills into income?</h2>
            <p className="font-body-lg text-body-lg text-on-primary-container max-w-lg">Join thousands of taskers building their business on TaskSphere. Set your own prices, choose your hours, get paid securely.</p>
            <div className="flex flex-wrap gap-space-md pt-space-xs">
              <Link className="inline-flex items-center justify-center gap-space-xs px-space-xl py-space-md rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg font-bold hover:bg-secondary-container transition-all" href="/get-started">
                <span>Become a Tasker</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
              <Link className="inline-flex items-center justify-center gap-space-xs px-space-xl py-space-md rounded-xl bg-surface-container-lowest text-on-surface font-label-lg text-label-lg font-semibold hover:bg-surface-container transition-all" href="/sign-in">
                <span>Sign in</span>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-space-md">
            <div className="bg-surface-container-lowest/10 backdrop-blur rounded-xl p-space-lg border border-white/10">
              <div className="font-display-hero text-display-hero-mobile font-extrabold text-secondary-fixed">{stats.openTasks.toLocaleString()}</div>
              <div className="font-body-md text-body-md text-on-primary-container">Open tasks</div>
            </div>
            <div className="bg-surface-container-lowest/10 backdrop-blur rounded-xl p-space-lg border border-white/10">
              <div className="font-display-hero text-display-hero-mobile font-extrabold text-secondary-fixed">{stats.taskersTotal.toLocaleString()}</div>
              <div className="font-body-md text-body-md text-on-primary-container">Taskers on the platform</div>
            </div>
            <div className="bg-surface-container-lowest/10 backdrop-blur rounded-xl p-space-lg border border-white/10">
              <div className="flex items-center gap-2 font-display-hero text-display-hero-mobile font-extrabold text-secondary-fixed">{stats.ratingAvg ? <><span>{stats.ratingAvg.toFixed(1)}</span><span className="material-symbols-outlined text-3xl">star</span></> : '—'}</div>
              <div className="font-body-md text-body-md text-on-primary-container">Average rating</div>
            </div>
            <div className="bg-surface-container-lowest/10 backdrop-blur rounded-xl p-space-lg border border-white/10">
              <div className="font-display-hero text-display-hero-mobile font-extrabold text-secondary-fixed">{stats.tasksTotal.toLocaleString()}</div>
              <div className="font-body-md text-body-md text-on-primary-container">Total tasks posted</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
