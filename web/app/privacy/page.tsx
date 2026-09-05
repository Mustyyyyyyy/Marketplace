import MarketingHeader from '@/components/MarketingHeader';
import Footer from '@/components/Footer';
import { PageShell } from '@/components/Page';
import Link from 'next/link';

export const metadata = { title: 'Privacy policy — TaskSphere' };

export default function PrivacyPage() {
  return (
    <>
      <MarketingHeader />
      <PageShell>
        <article className="prose max-w-3xl mx-auto">
          <h1 className="font-headline-xl text-headline-xl-mobile font-bold text-on-surface">Privacy policy</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <Section title="1. Who we are" n="h2">
            <p>TaskSphere, Inc. ("we", "us", "TaskSphere") operates a global online marketplace that connects customers who need tasks done with independent service providers ("taskers") who offer to complete those tasks. Our registered office is at 1 Market Square, Lagos, Nigeria (with regional offices in London, New York and Berlin).</p>
          </Section>

          <Section title="2. Information we collect" n="h2">
            <p>We collect three types of information:</p>
            <ul>
              <li><strong>Information you give us</strong>: name, email, phone, date of birth (where required for KYC), government ID images, profile photo, skills, bio, portfolio media, payment details.</li>
              <li><strong>Information we collect automatically</strong>: device, browser, IP address, pages viewed, and how you interact with our services.</li>
              <li><strong>Information from third parties</strong>: identity verification vendors (Persona, Onfido), payment processors (Stripe, Paystack), and background-check providers where you have given consent.</li>
            </ul>
          </Section>

          <Section title="3. How we use your information" n="h2">
            <p>We use your information to: provide and improve the marketplace; verify your identity; process payments; prevent fraud and abuse; send you service notifications; provide customer support; comply with law; and — only with your consent — send marketing.</p>
          </Section>

          <Section title="4. Legal bases (EEA / UK)" n="h2">
            <p>For users in the EEA or UK, we process your personal data on the lawful bases of contract performance, our legitimate interests in operating a safe marketplace, your consent (for marketing and optional background checks), and legal obligation.</p>
          </Section>

          <Section title="5. Sharing your information" n="h2">
            <p>We never sell your data. We share it only with: (a) other users as needed to provide the service (e.g. your display name on a task page); (b) service providers under contract (payments, KYC, hosting, email); (c) regulators and law enforcement when legally required; (d) a buyer in the event of a corporate transaction, with notice to you.</p>
          </Section>

          <Section title="6. International transfers" n="h2">
            <p>We are a global platform. Your data may be processed in the US, EEA, UK and Nigeria. We use Standard Contractual Clauses or equivalent safeguards when transferring data across borders.</p>
          </Section>

          <Section title="7. Your rights" n="h2">
            <p>Depending on where you live, you have the right to: access, correct, delete, port, or restrict the processing of your personal data, and to object to processing. Email <a className="text-secondary font-semibold" href="mailto:privacy@tasksphere.example">privacy@tasksphere.example</a> or use the in-app privacy controls to exercise these rights.</p>
          </Section>

          <Section title="8. Data retention" n="h2">
            <p>We keep account data for as long as your account is active. We delete or anonymize closed accounts within 90 days, except where we must retain records for legal, tax, or anti-fraud purposes (typically up to 7 years).</p>
          </Section>

          <Section title="9. Security" n="h2">
            <p>We use industry-standard encryption in transit and at rest, role-based access controls, regular security testing, and a bug-bounty programme. No system is 100% secure, but we work hard to protect your data.</p>
          </Section>

          <Section title="10. Children" n="h2">
            <p>TaskSphere is not for children under 18. We do not knowingly collect data from anyone under 18.</p>
          </Section>

          <Section title="11. Changes" n="h2">
            <p>We will notify you of material changes by email and in-app notice at least 30 days before they take effect.</p>
          </Section>

          <Section title="12. Contact" n="h2">
            <p>For privacy questions, contact our Data Protection Officer at <a className="text-secondary font-semibold" href="mailto:dpo@tasksphere.example">dpo@tasksphere.example</a>, or visit our <Link className="text-secondary font-semibold" href="/contact">contact page</Link>.</p>
          </Section>

          <hr className="my-space-xl border-outline-variant" />
          <p className="font-body-sm text-body-sm text-on-surface-variant">This is a placeholder policy. It is provided for development purposes and is not legal advice. Please have a qualified attorney review and finalize before launch.</p>
        </article>
      </PageShell>
      <Footer />
    </>
  );
}

function Section({ title, children, n = 'h2' }: { title: string; children: React.ReactNode; n?: string }) {
  const Tag = n as any;
  return (
    <section className="mt-space-lg">
      <Tag className="font-headline-md text-headline-md font-bold text-on-surface">{title}</Tag>
      <div className="mt-space-sm text-on-surface-variant font-body-lg text-body-lg space-y-space-sm [&_ul]:list-disc [&_ul]:pl-space-lg [&_ul]:space-y-1 [&_li]:text-on-surface-variant [&_a]:text-secondary [&_a]:font-semibold">{children}</div>
    </section>
  );
}
