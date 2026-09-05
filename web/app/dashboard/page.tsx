'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { Greeting, StatCard, TrustCallout } from '@/components/DashboardBits';
import { getCachedUser, fetchMe, authHeader, getAccessToken } from '@/lib/auth';

export default function DashboardOverview() {
  // Read from cache first so we don't blink empty
  const [me, setMe] = useState<any>(() => getCachedUser());
  const [profile, setProfile] = useState<any>(null);
  const isTasker = (me?.role || profile?.role) === 'TASKER';

  useEffect(() => {
    const access = getAccessToken() || '';
    // /me in parallel with /profile/me
    Promise.all([
      fetchMe(true).then((u) => setMe(u)),
      fetch('/api/backend/api/profile/me', { headers: authHeader() }).then((r) => r.json()).then((j) => setProfile(j.profile)),
    ]).catch(() => null);
  }, []);

  if (isTasker) {
    return <TaskerOverview me={me} profile={profile} />;
  }
  return <CustomerOverview me={me} />;
}

function TaskerOverview({ me, profile }: { me: any; profile: any }) {
  const firstName = (me?.displayName || 'there').split(' ')[0];
  const rating = profile?.taskerProfile?.ratingAvg || 0;
  const reviews = profile?.taskerProfile?.ratingCount || 0;
  const kycVerified = profile?.taskerProfile?.kycStatus === 'VERIFIED';
  const stats = useTaskerStats();
  const recommended = useRecommendedTasks();
  const conversations = useConversations();
  const inFlight = useInFlight();

  const profileScore = Math.min(100, 60 + (kycVerified ? 20 : 0) + Math.min(15, reviews * 2) + (profile?.taskerProfile?.skills?.length ? 5 : 0));

  return (
    <DashboardShell>
      <div className="flex flex-col w-full">
        <Greeting
          name={me?.displayName || firstName}
          subtitle="Here’s what’s happening with your active projects, client reviews, and curated marketplace opportunities today."
          action={
            <Link href="/dashboard/find-tasks" className="inline-flex items-center gap-space-xs h-12 px-space-lg rounded-xl bg-primary-container text-on-secondary-container font-label-lg text-label-lg shadow-sm hover:bg-inverse-surface transition-all">
              <span className="material-symbols-outlined text-[20px]">explore</span>
              <span>Browse Recommended Tasks{stats.open ? ` (${stats.open} new)` : ''}</span>
            </Link>
          }
        />

        <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-space-md mb-space-xl">
          <StatCard label="Matching Tasks" value={stats.matching} hint={stats.matchingTrend} icon="auto_awesome" tone="info" trend={stats.matchingTrend?.startsWith('+') ? 'up' : undefined} />
          <StatCard label="Active Jobs" value={stats.activeJobs} hint={stats.activeJobsHint} icon="work" tone="neutral" />
          <StatCard label="Pending Offers" value={stats.pendingOffers} hint={stats.pendingOffersHint} icon="local_offer" tone="neutral" />
          <StatCard label="Completed" value={stats.completed} hint={stats.completedHint} icon="task_alt" tone="success" trend="up" />
          <StatCard label="Average Rating" value={rating ? rating.toFixed(2) : '—'} hint={reviews ? `${reviews} client reviews` : 'No reviews yet'} icon="star" tone="warning" />
          <StatCard label="Profile Views" value={stats.profileViews} hint={stats.profileViewsHint} icon="visibility" tone="neutral" trend={stats.profileViewsHint?.startsWith('+') ? 'up' : undefined} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl mb-space-xl">
          <div className="lg:col-span-8 flex flex-col gap-space-md">
            <div className="flex flex-wrap items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">In-Flight Client Work</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm">{inFlight.length} active</span>
              </div>
              <Link href="/dashboard/jobs" className="font-label-md text-label-md text-secondary hover:underline">View All Jobs →</Link>
            </div>

            {inFlight.length === 0 ? (
              <div className="p-space-xl rounded-2xl bg-surface-container-lowest shadow-sm text-center">
                <span className="material-symbols-outlined text-5xl text-outline">work_off</span>
                <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-md">No active jobs yet.</p>
                <Link href="/dashboard/find-tasks" className="inline-block mt-space-md px-space-lg py-space-md rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg font-bold">Find work</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-space-md">
                {inFlight.slice(0, 3).map((j) => <JobCard key={j.id} job={j} />)}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 flex flex-col gap-space-lg">
            <div className="p-space-lg rounded-2xl bg-gradient-to-br from-primary-container via-surface-tint to-primary-container text-on-secondary-container shadow-md relative overflow-hidden">
              <div className="relative z-10 flex flex-col">
                <div className="flex items-center justify-between mb-space-sm">
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-lowest/20 backdrop-blur-md text-on-secondary font-label-sm text-label-sm uppercase tracking-wider">Profile Score</span>
                  <span className="font-headline-sm text-headline-sm text-tertiary-fixed font-bold">{profileScore}%</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-secondary leading-snug">Strengthen your profile</h3>
                <p className="font-body-md text-body-md text-primary-fixed mt-1 mb-space-md">{profileScoreTip(profileScore, kycVerified, reviews, profile?.taskerProfile?.skills?.length || 0)}</p>
                <div className="w-full bg-surface-container-lowest/20 rounded-full h-1.5 mb-space-md overflow-hidden">
                  <div className="bg-tertiary-fixed-dim h-1.5 rounded-full" style={{ width: `${profileScore}%` }} />
                </div>
                <Link href="/dashboard/profile" className="inline-flex items-center justify-center gap-space-xs h-11 px-space-md rounded-xl bg-surface-container-lowest text-on-primary-fixed font-label-lg text-label-lg hover:bg-surface-bright transition-all shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
                  <span>Improve profile</span>
                </Link>
              </div>
            </div>

            <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col">
              <div className="flex items-center justify-between pb-space-sm mb-space-sm">
                <div className="flex flex-col">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Client Inquiries</h3>
                  <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 mt-0.5">Recent conversations</span>
                </div>
                {conversations.some((c) => c.unreadCount > 0) ? <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">Unread</span> : null}
              </div>
              <div className="flex flex-col gap-space-sm">
                {conversations.length === 0 ? (
                  <p className="font-body-sm text-body-sm text-on-surface-variant py-space-md text-center">No conversations yet.</p>
                ) : conversations.slice(0, 3).map((c) => {
                  const other = c.otherUser || {};
                  return (
                    <Link key={c.id} href={`/dashboard/messages/${c.id}`} className="flex items-start gap-space-xs p-space-xs rounded-xl hover:bg-surface-container-low transition-colors group">
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-label-md">{(other.displayName || other.email || '?')[0]?.toUpperCase()}</div>
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-label-md text-label-md text-on-surface font-semibold truncate group-hover:text-secondary transition-colors">{other.displayName || 'Conversation'}</span>
                          <span className="font-label-sm text-label-sm text-outline whitespace-nowrap">{c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleDateString() : ''}</span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{c.lastMessage || c.task?.title || ''}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <Link href="/dashboard/messages" className="w-full mt-space-sm py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors text-center">Open All Messages</Link>
            </div>
          </div>
        </div>

        <section className="flex flex-col gap-space-md mb-space-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Recommended for you</h2>
                <span className="p-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[14px] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px]">stars</span>
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Tasks matching your skills and location.</p>
            </div>
          </div>
          {recommended.length === 0 ? (
            <div className="p-space-xl rounded-2xl bg-surface-container-lowest shadow-sm text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">No matching tasks right now. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
              {recommended.map((t) => (
                <div key={t.id} className="flex flex-col justify-between p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
                  <div>
                    <div className="flex items-start justify-between gap-space-xs mb-space-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm">{t.mode || 'Remote'}</span>
                        <span className="text-outline font-label-sm text-label-sm">•</span>
                        <span className="text-on-surface-variant font-label-sm text-label-sm">{t.timeAgo || 'recent'}</span>
                      </div>
                      <button aria-label="Save Task" className="p-1.5 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition-colors"><span className="material-symbols-outlined text-[20px]">bookmark</span></button>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-2 mb-space-xs">{t.title}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-space-md">{t.description}</p>
                    {t.tags?.length ? (
                      <div className="flex flex-wrap gap-1.5 mb-space-md">
                        {t.tags.map((tag: string) => (
                          <span key={tag} className="px-2.5 py-1 rounded-lg bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">{tag}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="pt-space-md bg-surface-container-low -mx-space-lg -mb-space-lg p-space-md rounded-b-2xl flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">{t.budgetType}</span>
                      <span className="font-headline-sm text-headline-sm font-bold text-on-surface">{t.currency} {Number(t.budgetAmount).toLocaleString()}</span>
                    </div>
                    <Link href={`/tasks/${t.id}`} className="inline-flex items-center gap-1 h-10 px-space-md rounded-xl bg-secondary hover:bg-secondary-container text-on-secondary font-label-lg text-label-lg transition-colors shadow-sm">
                      <span>Make Offer</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-center p-space-md mt-space-sm bg-surface-container-low rounded-2xl">
            <Link href="/dashboard/find-tasks" className="font-label-lg text-label-lg text-secondary hover:text-secondary-container inline-flex items-center gap-2 font-semibold">
              <span>Explore all open tasks</span>
              <span className="material-symbols-outlined text-[18px]">east</span>
            </Link>
          </div>
        </section>

        <TrustCallout />
      </div>
    </DashboardShell>
  );
}

function JobCard({ job }: { job: any }) {
  const a = job.author || job.otherUser || {};
  const status = job.status || 'IN_PROGRESS';
  const isReview = ['SUBMITTED', 'CUSTOMER_REVIEW'].includes(status);
  const statusClass = isReview ? 'bg-amber-100 text-amber-900' : 'bg-secondary-fixed text-on-secondary-fixed';
  const progress = isReview ? 90 : 75;
  const progressColor = isReview ? 'bg-amber-500' : 'bg-secondary';
  return (
    <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-sm mb-space-md">
        <div className="flex items-start gap-space-sm min-w-0">
          {a.avatarUrl ? <img className="w-12 h-12 rounded-full object-cover shrink-0 shadow-sm" alt={a.displayName || 'Client'} src={a.avatarUrl} /> : (
            <div className="w-12 h-12 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold shrink-0">{(a.displayName || '?')[0]?.toUpperCase()}</div>
          )}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-xs flex-wrap">
              <span className="font-label-lg text-label-lg text-on-surface font-semibold truncate">{a.displayName || 'Client'}</span>
              <span className={`px-2.5 py-0.5 rounded-full font-label-sm text-label-sm ${statusClass}`}>{status}</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1 truncate">{job.title}</h3>
          </div>
        </div>
        <div className="flex flex-col md:items-end shrink-0">
          <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">{job.budgetType || 'Fixed'}</span>
          <span className="font-headline-sm text-headline-sm text-on-surface font-bold mt-0.5">{job.currency} {Number(job.budgetAmount || 0).toLocaleString()}</span>
        </div>
      </div>
      <div className="bg-surface-container-low rounded-xl p-space-md mb-space-md">
        <div className="flex items-center justify-between text-body-sm font-body-sm mb-2">
          <div className="flex items-center gap-2 text-on-surface">
            <span className={`material-symbols-outlined text-[18px] ${isReview ? 'text-amber-600' : 'text-secondary'}`}>{isReview ? 'hourglass_top' : 'flag'}</span>
            <span className="font-label-md text-label-md">{isReview ? 'Awaiting client review' : 'Work in progress'}</span>
          </div>
        </div>
        <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
          <div className={`${progressColor} h-2 rounded-full transition-all duration-500`} style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between items-center text-label-sm font-label-sm text-on-surface-variant mt-1.5">
          <span>Escrow held safely</span>
          <span className={`font-semibold ${isReview ? 'text-amber-600' : 'text-secondary'}`}>{progress}%</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-space-xs pt-space-xs">
        <Link href={`/dashboard/messages`} className="inline-flex items-center gap-1.5 h-10 px-space-md rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors">
          <span className="material-symbols-outlined text-[18px]">chat</span>
          <span>Message client</span>
        </Link>
        <Link href={`/tasks/${job.id}`} className="inline-flex items-center gap-1.5 h-10 px-space-md rounded-xl bg-primary-container hover:bg-inverse-surface text-on-secondary-container font-label-md text-label-md transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">launch</span>
          <span>Open workspace</span>
        </Link>
      </div>
    </div>
  );
}

function CustomerOverview({ me }: { me: any }) {
  const stats = useCustomerStats();
  return (
    <DashboardShell>
      <Greeting
        name={me?.displayName || 'there'}
        subtitle="Track your active tasks, incoming offers, and conversations with taskers."
        action={
          <Link href="/dashboard/tasks/new" className="inline-flex items-center gap-space-xs h-12 px-space-lg rounded-xl bg-primary-container text-on-secondary-container font-label-lg text-label-lg shadow-sm hover:bg-inverse-surface transition-all">
            <span className="material-symbols-outlined text-[20px]">post_add</span>
            <span>Post a New Task</span>
          </Link>
        }
      />
      <section className="grid grid-cols-2 md:grid-cols-4 gap-space-md mb-space-xl">
        <StatCard label="Active Tasks" value={stats.active} hint={stats.activeHint} icon="task_alt" tone="info" />
        <StatCard label="Offers Received" value={stats.offers} hint={stats.offersHint} icon="local_offer" tone="success" trend={stats.offersHint?.startsWith('+') ? 'up' : undefined} />
        <StatCard label="In Progress" value={stats.inProgress} hint={stats.inProgressHint} icon="work" tone="warning" />
        <StatCard label="Spent this Month" value={stats.spent} hint={stats.spentHint} icon="payments" tone="neutral" />
      </section>
      <CustomerTasksPanel />
      <CustomerOffersPanel />
      <TrustCallout />
    </DashboardShell>
  );
}

function CustomerTasksPanel() {
  const [tasks, setTasks] = useState<any[]>([]);
  useEffect(() => {
    const access = localStorage.getItem('access') || '';
    fetch('/api/backend/api/tasks/mine', { headers: { Authorization: `Bearer ${access}` } }).then((r) => r.json()).then((j) => setTasks(j.tasks || [])).catch(() => setTasks([]));
  }, []);

  return (
    <section className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm mb-space-xl">
      <div className="flex items-center justify-between mb-space-md">
        <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">My active tasks</h2>
        <Link href="/dashboard/tasks" className="font-label-md text-label-md text-secondary font-semibold hover:underline">See all →</Link>
      </div>
      {tasks.length === 0 ? (
        <div className="text-center py-space-xl">
          <span className="material-symbols-outlined text-5xl text-outline">inbox</span>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">No tasks yet.</p>
          <Link href="/dashboard/tasks/new" className="inline-block mt-space-sm px-space-md py-space-xs rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-semibold">Post your first task</Link>
        </div>
      ) : (
        <ul className="space-y-1">
          {tasks.slice(0, 5).map((t) => (
            <li key={t.id}>
              <Link href={`/tasks/${t.id}`} className="flex items-center justify-between p-space-sm rounded-xl hover:bg-surface-container-low">
                <div className="min-w-0 flex-1">
                  <div className="font-label-lg text-label-lg text-on-surface truncate">{t.title}</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">{t.city || t.country} · {t.mode}</div>
                </div>
                <div className="flex items-center gap-space-sm">
                  <span className="font-label-lg text-label-lg font-bold text-secondary">{t.currency} {Number(t.budgetAmount).toLocaleString()}</span>
                  <span className="px-space-sm py-1 rounded-full bg-surface-container text-on-surface text-[10px] font-bold uppercase">{t.status}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CustomerOffersPanel() {
  const [tasks, setTasks] = useState<any[]>([]);
  useEffect(() => {
    const access = localStorage.getItem('access') || '';
    fetch('/api/backend/api/tasks/mine', { headers: { Authorization: `Bearer ${access}` } }).then((r) => r.json()).then((j) => setTasks(j.tasks || [])).catch(() => setTasks([]));
  }, []);

  return (
    <section className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm mb-space-xl">
      <div className="flex items-center justify-between mb-space-md">
        <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Tasks receiving offers</h2>
        <Link href="/dashboard/tasks" className="font-label-md text-label-md text-secondary font-semibold hover:underline">Manage tasks →</Link>
      </div>
      {tasks.length === 0 ? <p className="font-body-md text-body-md text-on-surface-variant">Post a task to start receiving offers.</p> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          {tasks.slice(0, 3).map((t) => (
            <Link key={t.id} href={`/tasks/${t.id}`} className="p-space-md rounded-2xl bg-surface-container-low hover:bg-surface-container">
              <div className="font-label-lg text-label-lg text-on-surface truncate">{t.title}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="font-label-md text-label-md text-on-surface-variant">{t.currency} {Number(t.budgetAmount).toLocaleString()}</span>
                <span className="px-space-sm py-1 rounded-full bg-surface-container text-on-surface text-[10px] font-bold uppercase">{t.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function profileScoreTip(score: number, kyc: boolean, reviews: number, skills: number) {
  if (score >= 90) return 'You\u2019re in top-rated territory. Keep your availability fresh to stay matched.';
  if (!kyc) return 'Verify your identity to unlock higher-value contracts and priority matching.';
  if (reviews < 5) return 'Completing a few more jobs will boost your match relevance algorithm.';
  if (skills < 5) return 'Add a few more skills to surface in more category searches.';
  return 'Polish your profile to climb higher in search rankings.';
}

function useTaskerStats() {
  const [s, setS] = useState({ matching: 0, matchingTrend: '', activeJobs: 0, activeJobsHint: '', pendingOffers: 0, pendingOffersHint: '', completed: 0, completedHint: '', profileViews: 0, profileViewsHint: '', open: 0 });
  useEffect(() => {
    const access = localStorage.getItem('access') || '';
    Promise.all([
      fetch('/api/backend/api/tasks?pageSize=1', { cache: 'no-store' }).then((r) => r.ok ? r.json() : { total: 0 }),
      fetch('/api/backend/api/offers/mine', { headers: { Authorization: `Bearer ${access}` } }).then((r) => r.ok ? r.json() : { offers: [] }),
      fetch('/api/backend/api/tasks?pageSize=20', { headers: { Authorization: `Bearer ${access}` } }).then((r) => r.ok ? r.json() : { items: [] }),
    ]).then(([all, mine, list]) => {
      const offers = mine.offers || [];
      const items = list.items || [];
      setS({
        matching: all.total || 0,
        matchingTrend: '',
        activeJobs: items.filter((t: any) => ['OFFER_SELECTED', 'IN_PROGRESS'].includes(t.status)).length,
        activeJobsHint: items.some((t: any) => t.status === 'IN_PROGRESS') ? 'In progress' : 'None right now',
        pendingOffers: offers.filter((o: any) => ['PENDING', 'SUBMITTED'].includes(o.status)).length,
        pendingOffersHint: offers.length > 0 ? `${offers.length} total sent` : 'No offers sent yet',
        completed: items.filter((t: any) => t.status === 'COMPLETED').length,
        completedHint: 'All time',
        profileViews: 0,
        profileViewsHint: '',
        open: all.total || 0,
      });
    }).catch(() => {});
  }, []);
  return s;
}

function useCustomerStats() {
  const [s, setS] = useState({ active: 0, activeHint: '', offers: 0, offersHint: '', inProgress: 0, inProgressHint: '', spent: '$0', spentHint: '' });
  useEffect(() => {
    const access = localStorage.getItem('access') || '';
    fetch('/api/backend/api/tasks/mine', { headers: { Authorization: `Bearer ${access}` } }).then((r) => r.json()).then((j) => {
      const tasks = j.tasks || [];
      const active = tasks.filter((t: any) => ['PUBLISHED', 'RECEIVING_OFFERS', 'OFFER_SELECTED', 'IN_PROGRESS'].includes(t.status)).length;
      const inProgress = tasks.filter((t: any) => t.status === 'IN_PROGRESS').length;
      const spent = tasks.filter((t: any) => t.status === 'COMPLETED').reduce((a: number, t: any) => a + Number(t.budgetAmount || 0), 0);
      setS({
        active,
        activeHint: `${active} active`,
        offers: 0,
        offersHint: 'From your tasks',
        inProgress,
        inProgressHint: inProgress ? 'In progress' : 'None',
        spent: `$${spent.toLocaleString()}`,
        spentHint: `${tasks.filter((t: any) => t.status === 'COMPLETED').length} completed jobs`,
      });
    }).catch(() => {});
  }, []);
  return s;
}

function useRecommendedTasks() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/backend/api/tasks?pageSize=6', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((j) => {
        setItems((j.items || []).map((t: any) => ({
          id: t.id, mode: t.mode, timeAgo: 'recent', title: t.title, description: t.description,
          tags: [], budgetType: t.budgetType, currency: t.currency, budgetAmount: t.budgetAmount,
        })));
      })
      .catch(() => setItems([]));
  }, []);
  return items;
}

function useConversations() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    const access = localStorage.getItem('access') || '';
    fetch('/api/backend/api/conversations', { headers: { Authorization: `Bearer ${access}` } })
      .then((r) => r.ok ? r.json() : { conversations: [] })
      .then((j) => setItems((j.conversations || []).map((c: any) => ({
        id: c.id,
        otherUser: c.otherUser,
        task: c.task,
        lastMessage: (c.messages || [])[0]?.body,
        lastMessageAt: (c.messages || [])[0]?.createdAt,
        unreadCount: c.unreadCount || 0,
      }))))
      .catch(() => setItems([]));
  }, []);
  return items;
}

function useInFlight() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    const access = localStorage.getItem('access') || '';
    fetch('/api/backend/api/tasks?pageSize=20', { headers: { Authorization: `Bearer ${access}` } })
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((j) => setItems((j.items || []).filter((t: any) => ['OFFER_SELECTED', 'IN_PROGRESS', 'SUBMITTED', 'CUSTOMER_REVIEW'].includes(t.status))))
      .catch(() => setItems([]));
  }, []);
  return items;
}
