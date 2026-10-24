import { AnnouncementBanner } from "./AnnouncementBanner";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/**
 * Shared chrome for the public site and the signed-in app. Keeping one copy
 * means a change to the header never drifts between the two route groups.
 */
export function SiteChrome({ children, premium = false }) {
  return (
    <>
      <noscript>
        <p className="border-b border-line bg-sand px-6 py-3 text-center text-sm text-ink">
          This demo keeps its data in your browser, so the catalogue, maps and
          sign-in need JavaScript. The page shell and links still work.
        </p>
      </noscript>
      <AnnouncementBanner />
      <SiteHeader premium={premium} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter premium={premium} />
    </>
  );
}
