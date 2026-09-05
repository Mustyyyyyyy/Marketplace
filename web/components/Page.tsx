'use client';
import Link from 'next/link';

export function PageShell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return <main className={`w-full pt-28 bg-surface flex-grow ${wide ? '' : 'max-w-container-max mx-auto'} px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop pb-space-3xl`}>{children}</main>;
}

export function PageHeader({ eyebrow, title, subtitle, ctas }: { eyebrow?: string; title: string; subtitle?: string; ctas?: { label: string; href: string; variant?: 'primary' | 'secondary' | 'ghost' }[] }) {
  return (
    <header className="text-center max-w-3xl mx-auto mb-space-2xl">
      {eyebrow ? <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold text-secondary">{eyebrow}</span> : null}
      <h1 className="font-headline-xl text-headline-xl-mobile font-bold text-on-surface tracking-tight mt-2">{title}</h1>
      {subtitle ? <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-sm">{subtitle}</p> : null}
      {ctas?.length ? (
        <div className="flex flex-wrap items-center justify-center gap-space-md pt-space-md">
          {ctas.map((c) => (
            <Link key={c.href} href={c.href} className={`inline-flex items-center justify-center gap-space-xs px-space-xl py-space-md rounded-xl font-label-lg text-label-lg font-bold transition-all ${c.variant === 'secondary' ? 'bg-surface-container-lowest text-on-surface shadow-sm hover:bg-surface-container' : c.variant === 'ghost' ? 'bg-transparent text-secondary hover:underline' : 'bg-primary-container text-on-primary shadow-md hover:bg-inverse-surface'}`}>{c.label}</Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}

export function Section({ title, eyebrow, children, className = '', id }: { title?: string; eyebrow?: string; children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`py-space-2xl ${className}`}>
      {eyebrow || title ? (
        <div className="mb-space-xl text-center max-w-2xl mx-auto">
          {eyebrow ? <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold text-secondary">{eyebrow}</span> : null}
          {title ? <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mt-2">{title}</h2> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-surface-container-lowest rounded-2xl border border-outline-variant p-space-lg ${className}`}>{children}</div>;
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-space-lg">
      <div className="font-display-hero text-display-hero-mobile font-extrabold text-secondary">{value}</div>
      <div className="font-body-md text-body-md text-on-surface-variant mt-1">{label}</div>
    </div>
  );
}
