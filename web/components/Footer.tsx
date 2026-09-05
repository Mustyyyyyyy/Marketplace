import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant mt-space-3xl">
      <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop py-space-2xl">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-space-xl mb-space-xl">
          <div className="col-span-2">
            <div className="flex items-center gap-space-xs mb-space-md">
              <span className="material-symbols-outlined text-secondary text-2xl">task_alt</span>
              <span className="font-headline-sm text-headline-sm font-bold text-on-surface">TaskSphere</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">A trusted global marketplace connecting customers with skilled taskers. Local and remote, simple and secure.</p>
            <div className="flex gap-space-md mt-space-md">
              <Link href="/contact" className="font-label-md text-label-md text-secondary font-semibold hover:underline">Contact</Link>
              <Link href="/help" className="font-label-md text-label-md text-secondary font-semibold hover:underline">Help</Link>
              <Link href="/blog" className="font-label-md text-label-md text-secondary font-semibold hover:underline">Blog</Link>
            </div>
          </div>

          <div>
            <h4 className="font-label-lg text-label-lg font-bold text-on-surface mb-space-sm">Customers</h4>
            <ul className="flex flex-col gap-space-xs text-on-surface-variant font-body-md text-body-md">
              <li><Link href="/find-tasks">Find tasks</Link></li>
              <li><Link href="/how-it-works">How it works</Link></li>
              <li><Link href="/categories">Browse categories</Link></li>
              <li><Link href="/trust-safety">Trust &amp; safety</Link></li>
              <li><Link href="/get-started">Post a task</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-label-lg text-label-lg font-bold text-on-surface mb-space-sm">Taskers</h4>
            <ul className="flex flex-col gap-space-xs text-on-surface-variant font-body-md text-body-md">
              <li><Link href="/find-taskers">Find taskers</Link></li>
              <li><Link href="/become-a-tasker">Become a tasker</Link></li>
              <li><Link href="/pro">Pro program</Link></li>
              <li><Link href="/kyc">Identity verification</Link></li>
              <li><Link href="/dashboard/offers">My offers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-label-lg text-label-lg font-bold text-on-surface mb-space-sm">Company</h4>
            <ul className="flex flex-col gap-space-xs text-on-surface-variant font-body-md text-body-md">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/careers">Careers</Link></li>
              <li><Link href="/press">Press</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-label-lg text-label-lg font-bold text-on-surface mb-space-sm">Legal</h4>
            <ul className="flex flex-col gap-space-xs text-on-surface-variant font-body-md text-body-md">
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/terms">Terms</Link></li>
              <li><Link href="/cookies">Cookies</Link></li>
              <li><Link href="/anti-fraud">Anti-fraud</Link></li>
              <li><Link href="/report">Report abuse</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-space-md pt-space-md border-t border-outline-variant">
          <div className="flex items-center gap-space-md">
            <select className="bg-surface-container-lowest text-on-surface text-body-sm font-body-sm border border-outline-variant rounded-lg px-space-sm py-1">
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>Français</option>
              <option>Español</option>
              <option>Yorùbá</option>
              <option>Hausa</option>
              <option>Igbo</option>
            </select>
            <select className="bg-surface-container-lowest text-on-surface text-body-sm font-body-sm border border-outline-variant rounded-lg px-space-sm py-1">
              <option>NGN ₦</option>
              <option>USD $</option>
              <option>EUR €</option>
              <option>GBP £</option>
            </select>
          </div>
          <div className="font-body-sm text-body-sm text-on-surface-variant text-center md:text-right">
            <span>© {new Date().getFullYear()} TaskSphere, Inc. · </span>
            <Link href="/privacy" className="hover:underline">Privacy</Link> · <Link href="/terms" className="hover:underline">Terms</Link> · <Link href="/cookies" className="hover:underline">Cookies</Link> · <a href="https://marketplace-khaki-ten.vercel.app" className="hover:underline">marketplace-khaki-ten.vercel.app</a> · Built for Nigeria · UK · US · EU
          </div>
        </div>
      </div>
    </footer>
  );
}
