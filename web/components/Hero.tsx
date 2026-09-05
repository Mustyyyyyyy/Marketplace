'use client';
import Link from 'next/link';

export default function Hero({ stats }: { stats: { taskersTotal: number; openTasks: number; tasksTotal: number; completedTasks: number } }) {
  return (
    <section className="relative overflow-hidden pt-space-xl pb-space-3xl lg:pb-space-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl items-center">
        <div className="lg:col-span-6 flex flex-col items-start gap-space-lg">
          <div className="flex flex-col gap-space-sm">
            <h1 className="font-display-hero text-headline-xl-mobile lg:text-display-hero font-extrabold text-on-surface tracking-tight leading-[1.08]">
              Get Things Done. <br className="hidden sm:inline" /><span className="text-secondary">Find the Right Person.</span>
            </h1>
            <p className="font-body-xl text-body-xl text-on-surface-variant max-w-xl">
              Post a task, find trusted people to help, or turn your skills into income. Connect with reliable taskers for local and remote work worldwide.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-md pt-space-xs w-full sm:w-auto">
            <Link className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs px-space-xl py-space-md rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-md hover:bg-inverse-surface transition-all" href="/get-started">
              <span>Post a Task</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
            <Link className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs px-space-xl py-space-md rounded-xl bg-surface-container-lowest text-on-surface font-label-lg text-label-lg font-semibold shadow-sm hover:bg-surface-container transition-all" href="/become-a-tasker">
              <span className="material-symbols-outlined text-lg text-secondary">handyman</span>
              <span>Become a Tasker</span>
            </Link>
          </div>
          <div className="pt-space-xs flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-base text-on-tertiary-container">verified_user</span>
            <span>Built for trusted connections, secure escrow interactions and reliable results.</span>
          </div>
        </div>
        <div className="lg:col-span-6 relative">
          <div className="relative rounded-2xl overflow-hidden shadow-xl bg-surface-container-high aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] flex items-center justify-center p-space-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(49,107,243,0.18),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(12,148,136,0.16),transparent_38%)]" />
            <div className="relative w-full max-w-md rounded-2xl bg-surface-container-lowest p-space-md shadow-lg border border-outline-variant">
              <div className="flex items-center justify-between border-b border-outline-variant pb-space-sm">
                <span className="font-label-lg text-label-lg font-bold text-on-surface">Your next task</span>
                <span className="material-symbols-outlined text-secondary">task_alt</span>
              </div>
              <div className="mt-space-md space-y-space-sm">
                {['Home repairs', 'Moving help', 'Design support'].map((task, index) => (
                  <div key={task} className="flex items-center gap-space-sm rounded-xl bg-surface-container-low p-space-sm">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary-fixed text-secondary font-bold">{index + 1}</span>
                    <div className="min-w-0">
                      <p className="font-label-lg text-label-lg font-semibold text-on-surface">{task}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{index === 0 ? 'Nearby professionals' : 'Trusted community members'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 max-w-[260px] sm:max-w-xs p-space-sm rounded-xl bg-surface-container-lowest/95 backdrop-blur-md shadow-lg flex items-center gap-space-xs">
              <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-xl text-on-tertiary-container">task_alt</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-space-2xs">
                  <span className="font-label-sm text-label-sm uppercase font-bold text-on-tertiary-container">Tasks completed</span>
                </div>
                <span className="font-label-md text-label-md font-semibold text-on-surface truncate">{stats.completedTasks.toLocaleString()} and counting</span>
              </div>
            </div>
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 max-w-[270px] sm:max-w-xs p-space-sm rounded-xl bg-surface-container-lowest/95 backdrop-blur-md shadow-lg flex items-center gap-space-xs">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-xl text-secondary">verified</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-space-2xs">
                  <span className="font-label-md text-label-md font-bold text-on-surface truncate">Verified taskers</span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{stats.taskersTotal.toLocaleString()} active profiles</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
