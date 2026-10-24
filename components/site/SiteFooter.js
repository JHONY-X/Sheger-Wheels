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
    <footer className="premium-site-footer mt-auto border-t border-line bg-white/60">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Wordmark premium={premium} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Peer-to-peer car rental in Addis Ababa. Rent from a neighbour, or
              earn from the car in your parking spot.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.1em] text-ink">
                {column.title}
              </h2>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted hover:text-forest hover:underline hover:underline-offset-4"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
          <p className="text-sm text-muted">
            Sheggar Wheels · Frontend capstone · IBT–QIYAS
          </p>
          <p className="text-sm text-muted">
            Bookings, payments and reviews are simulated. No real transaction
            occurs.
          </p>
        </div>
      </div>
    </footer>
  );
}
