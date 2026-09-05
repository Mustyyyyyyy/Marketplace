import MarketingHeader from '@/components/MarketingHeader';
import Footer from '@/components/Footer';
import { PageShell } from '@/components/Page';
import Link from 'next/link';

export const metadata = { title: 'Terms of service — TaskSphere' };

export default function TermsPage() {
  return (
    <>
      <MarketingHeader />
      <PageShell>
        <article className="prose max-w-3xl mx-auto">
          <h1 className="font-headline-xl text-headline-xl-mobile font-bold text-on-surface">Terms of service</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <S title="1. Agreement">
            <p>By using TaskSphere you agree to these Terms. If you don't agree, please don't use the service. We may update these Terms from time to time; we'll give you at least 30 days' notice of material changes.</p>
          </S>
          <S title="2. Your account">
            <p>You're responsible for your account, your password, and all activity under it. You must be at least 18 years old. Be honest in your profile and on tasks — misrepresentation may get you suspended.</p>
          </S>
          <S title="3. Posting tasks">
            <p>Customers may post tasks for free. Posts must be for genuine work that complies with local law. TaskSphere may remove posts that are illegal, fraudulent, or violate our policies.</p>
          </S>
          <S title="4. Offers and hiring">
            <p>Offers are not binding until the customer accepts one in-app. When accepted, a binding contract is formed between the customer and the chosen tasker. TaskSphere is not a party to that contract but provides escrow and dispute services.</p>
          </S>
          <S title="5. Payments and fees">
            <p>Customers authorise payment when they accept an offer. Funds are held in escrow and released to the tasker when the customer marks the task complete (or 72 hours after tasker submission, if the customer is silent). TaskSphere charges a service fee, displayed before you confirm.</p>
          </S>
          <S title="6. Cancellations and refunds">
            <p>Either side may cancel before work begins for a full refund. After work begins, refunds follow our <Link className="text-secondary font-semibold" href="/disputes">dispute policy</Link>.</p>
          </S>
          <S title="7. Conduct">
            <p>No harassment, hate speech, off-platform payments, or illegal activity. We may suspend or ban accounts that violate these rules.</p>
          </S>
          <S title="8. Reviews">
            <p>Reviews must be honest and from verified completed tasks. We may remove reviews that violate our policies or look like manipulation.</p>
          </S>
          <S title="9. Intellectual property">
            <p>You own your content. You grant us a worldwide, non-exclusive licence to host and display it as needed to operate the service. We own the TaskSphere brand, code and designs.</p>
          </S>
          <S title="10. Disclaimers and liability">
            <p>The service is provided "as is." To the maximum extent permitted by law, we disclaim all warranties and limit our total liability to the fees we received from you in the past 12 months. Some jurisdictions don't allow these limits — they apply only where allowed.</p>
          </S>
          <S title="11. Indemnification">
            <p>You agree to indemnify TaskSphere for any losses arising from your breach of these Terms or misuse of the service.</p>
          </S>
          <S title="12. Termination">
            <p>We may suspend or terminate your account for violations of these Terms. You may close your account at any time from <Link className="text-secondary font-semibold" href="/dashboard/settings">Settings</Link>.</p>
          </S>
          <S title="13. Governing law">
            <p>These Terms are governed by the laws of the Federal Republic of Nigeria, without regard to conflict of laws. Disputes are resolved by binding arbitration in Lagos, except where prohibited by local law.</p>
          </S>
          <S title="14. Contact">
            <p>Questions about these Terms? Visit our <Link className="text-secondary font-semibold" href="/contact">contact page</Link> or email <a className="text-secondary font-semibold" href="mailto:legal@tasksphere.example">legal@tasksphere.example</a>.</p>
          </S>

          <hr className="my-space-xl border-outline-variant" />
          <p className="font-body-sm text-body-sm text-on-surface-variant">This summary is provided for convenience. The complete terms govern use of the service.</p>
        </article>
      </PageShell>
      <Footer />
    </>
  );
}

function S({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-space-lg">
      <h2 className="font-headline-md text-headline-md font-bold text-on-surface">{title}</h2>
      <div className="mt-space-sm text-on-surface-variant font-body-lg text-body-lg space-y-space-sm [&_a]:text-secondary [&_a]:font-semibold">{children}</div>
    </section>
  );
}
