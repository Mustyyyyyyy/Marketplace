import MarketingHeader from '@/components/MarketingHeader';
import Footer from '@/components/Footer';
import { PageShell, PageHeader, Card, Section } from '@/components/Page';

export const metadata = { title: 'Cookie policy — TaskSphere' };

export default function CookiesPage() {
  return (
    <>
      <MarketingHeader />
      <PageShell>
        <PageHeader eyebrow="Cookies" title="Cookies, pixels and similar technologies" subtitle="We use a small number of cookies to keep you signed in, remember your preferences and understand how the service is used." />
        <Section title="What we use" eyebrow="Categories">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            <Card><h3 className="font-headline-sm text-headline-sm font-bold">Strictly necessary</h3><p className="font-body-md text-body-md text-on-surface-variant mt-1">Authentication, security, fraud prevention. Always on.</p></Card>
            <Card><h3 className="font-headline-sm text-headline-sm font-bold">Preferences</h3><p className="font-body-md text-body-md text-on-surface-variant mt-1">Remember your language, currency and theme.</p></Card>
            <Card><h3 className="font-headline-sm text-headline-sm font-bold">Analytics</h3><p className="font-body-md text-body-md text-on-surface-variant mt-1">Anonymous usage stats so we can improve the product.</p></Card>
            <Card><h3 className="font-headline-sm text-headline-sm font-bold">Marketing</h3><p className="font-body-md text-body-md text-on-surface-variant mt-1">Only with your consent. Used to measure ad performance.</p></Card>
          </div>
        </Section>
        <Section title="Manage your preferences" eyebrow="Your choice">
          <Card>
            <p className="font-body-md text-body-md text-on-surface-variant">You can change your choices any time from the cookie banner or your browser settings. We honour Global Privacy Control and similar signals.</p>
          </Card>
        </Section>
      </PageShell>
      <Footer />
    </>
  );
}
