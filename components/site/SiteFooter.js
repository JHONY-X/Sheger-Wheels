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
    <footer className="premium-site-footer mt-auto border-t border-line bg-[#090b0e]">
      <div className="mx-auto w-full max-w-[1280px] px-6 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
          <div>
            <Wordmark premium={premium} />
            <p className="mt-4 max-w-xs text-xs leading-relaxed text-muted">
              Addis Ababa&apos;s premier luxury car rental service. Experience refined automotive excellence and effortless reservations.
            </p>
            <div className="mt-6 flex items-center gap-3 text-muted">
              {["facebook", "instagram", "x", "youtube", "linkedin"].map((social) => (
                <a
                  key={social}
                  href="#"
                  aria-label={social}
                  className="flex size-8 items-center justify-center rounded-full border border-line bg-sand/60 text-muted transition-colors hover:border-blue-500 hover:text-white"
                >
                  <span className="text-[11px] font-bold uppercase">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-white">
              Quick Links
            </h2>
            <ul className="mt-4 space-y-2.5 text-xs text-muted">
              <li><Link href="/" className="hover:text-blue-400">Home</Link></li>
              <li><Link href="/cars" className="hover:text-blue-400">Fleet</Link></li>
              <li><Link href="/#chauffeur" className="hover:text-blue-400">Chauffeur</Link></li>
              <li><Link href="/#for-owners" className="hover:text-blue-400">For Owners</Link></li>
              <li><Link href="/#about" className="hover:text-blue-400">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-white">
              Legal
            </h2>
            <ul className="mt-4 space-y-2.5 text-xs text-muted">
              <li><a href="#" className="hover:text-blue-400">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-blue-400">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-400">FAQs</a></li>
              <li><a href="#" className="hover:text-blue-400">Cancellation Policy</a></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-white">
              Contact Us
            </h2>
            <ul className="mt-4 space-y-3 text-xs text-muted">
              <li className="flex items-center gap-2.5">
                <svg viewBox="0 0 24 24" fill="none" className="size-4 stroke-blue-400 stroke-2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg viewBox="0 0 24 24" fill="none" className="size-4 stroke-blue-400 stroke-2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>+251 911 123 456</span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg viewBox="0 0 24 24" fill="none" className="size-4 stroke-blue-400 stroke-2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>info@shegerdrive.et</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line/60 pt-6 text-xs text-muted">
          <p>© 2026 Sheger Drive. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="h-px w-8 bg-blue-500" />
            <p className="italic text-muted/80">Luxury is a journey, not a destination.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
