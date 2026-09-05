'use client';
import { useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { Greeting, StatCard } from '@/components/DashboardBits';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AvailabilityPage() {
  const [hours, setHours] = useState({ Mon: '09:00-17:00', Tue: '09:00-17:00', Wed: '09:00-17:00', Thu: '09:00-17:00', Fri: '09:00-17:00', Sat: 'Closed', Sun: 'Closed' });
  const [autoAccept, setAutoAccept] = useState(false);
  const [instantBooking, setInstantBooking] = useState(true);
  const [radiusKm, setRadiusKm] = useState(20);
  const [saved, setSaved] = useState<string | null>(null);

  return (
    <DashboardShell>
      <Greeting
        name="availability"
        subtitle="Set the hours and conditions when you\u2019re open for new work. Customers only see you when you\u2019re available."
        action={
          <button onClick={() => setSaved('Saved')} className="px-space-lg py-space-md rounded-xl bg-primary-container text-on-secondary-container font-label-lg text-label-lg font-bold">Save</button>
        }
      />
      {saved ? <div className="bg-tertiary-fixed text-on-tertiary-fixed rounded-xl p-space-sm text-sm mb-space-md max-w-2xl">{saved}</div> : null}

      <section className="grid grid-cols-2 md:grid-cols-4 gap-space-md mb-space-xl">
        <StatCard label="Status" value="Available" icon="event_available" tone="success" />
        <StatCard label="Hours/week" value="40" icon="schedule" tone="info" />
        <StatCard label="Response time" value="14 min" icon="bolt" tone="warning" />
        <StatCard label="Travel radius" value={`${radiusKm} km`} icon="near_me" tone="neutral" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
        <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm">
          <h2 className="font-headline-sm text-headline-sm font-bold mb-space-md">Weekly hours</h2>
          <div className="space-y-space-sm">
            {DAYS.map((d) => (
              <div key={d} className="flex items-center gap-space-md p-space-sm rounded-xl bg-surface-container-low">
                <span className="font-label-lg text-label-lg font-semibold text-on-surface w-12">{d}</span>
                <input value={hours[d as keyof typeof hours]} onChange={(e) => setHours({ ...hours, [d]: e.target.value })} className="flex-1 bg-surface-container-lowest px-space-md py-space-sm rounded-lg" />
                <span className="font-label-sm text-label-sm text-on-surface-variant">{(hours[d as keyof typeof hours] || '').includes('Closed') ? 'Off' : 'On'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm space-y-space-md">
          <h2 className="font-headline-sm text-headline-sm font-bold">Booking preferences</h2>
          <label className="flex items-center justify-between gap-space-md p-space-sm rounded-xl bg-surface-container-low">
            <div>
              <div className="font-label-lg text-label-lg font-semibold text-on-surface">Auto-accept offers</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant">Skip the review step for high-priority clients.</div>
            </div>
            <input type="checkbox" checked={autoAccept} onChange={(e) => setAutoAccept(e.target.checked)} />
          </label>
          <label className="flex items-center justify-between gap-space-md p-space-sm rounded-xl bg-surface-container-low">
            <div>
              <div className="font-label-lg text-label-lg font-semibold text-on-surface">Instant booking</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant">Let customers book you without sending an offer first.</div>
            </div>
            <input type="checkbox" checked={instantBooking} onChange={(e) => setInstantBooking(e.target.checked)} />
          </label>
          <div className="p-space-sm rounded-xl bg-surface-container-low">
            <div className="flex items-center justify-between mb-space-xs">
              <span className="font-label-lg text-label-lg font-semibold text-on-surface">Travel radius</span>
              <span className="font-label-lg text-label-lg font-bold text-secondary">{radiusKm} km</span>
            </div>
            <input type="range" min={5} max={100} value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))} className="w-full" />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
