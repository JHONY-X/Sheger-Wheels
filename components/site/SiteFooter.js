import Link from "next/link";
import { Wordmark } from "./Wordmark";

const COLUMNS = [
  {
    title: "Rent",
    links: [
      { href: "/cars", label: "Browse cars" },
      { href: "/#how-it-works", label: "How it works" },
    ],
  },
  {
    title: "Own",
    links: [
      { href: "/signup", label: "List your car" },
      { href: "/#for-owners", label: "Owner guide" },
    ],
  },
  {
    title: "Build",
    links: [
      { href: "/styleguide", label: "Design system" },
      { href: "/dev", label: "Developer tools" },
    ],
  },
];

export function SiteFooter({ premium = false }) {
  return (
    <footer className="premium-site-footer mt-auto border-t border-line">
      <div className="mx-auto w-full max-w-[1280px] px-6 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
          <div>
            <Wordmark premium={premium} />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              Peer-to-peer car rental in Addis Ababa. Quality vehicles from local owners, transparent pricing, and personal support.
            </p>
            <div className="mt-5 flex items-center gap-2.5 text-muted">
              {["facebook", "instagram", "x", "youtube", "linkedin"].map((social) => (
                <a
                  key={social}
                  href="#"
                  aria-label={social}
                  className="flex size-8 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:border-forest hover:text-forest"
                >
                  <span className="text-[11px] font-bold uppercase">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink">
              Quick Links
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li><Link href="/" className="hover:text-ink transition-colors">Home</Link></li>
              <li><Link href="/cars" className="hover:text-ink transition-colors">Fleet</Link></li>
              <li><Link href="/#chauffeur" className="hover:text-ink transition-colors">Chauffeur</Link></li>
              <li><Link href="/#for-owners" className="hover:text-ink transition-colors">For Owners</Link></li>
              <li><Link href="/#about" className="hover:text-ink transition-colors">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink">
              Legal
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li><a href="#" className="hover:text-ink transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-ink transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-ink transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-ink transition-colors">Cancellation Policy</a></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink">
              Contact Us
            </h2>
            <ul className="mt-3 space-y-2.5 text-sm text-muted">
              <li className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" className="size-4 shrink-0 stroke-forest stroke-2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" className="size-4 shrink-0 stroke-forest stroke-2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>+251 911 123 456</span>
              </li>
              <li className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" className="size-4 shrink-0 stroke-forest stroke-2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>info@sheggarwheels.et</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line/60 pt-5 text-sm text-muted">
          <p>© 2026 Sheggar Wheels. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
