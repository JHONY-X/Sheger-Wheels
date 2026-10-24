import { SiteChrome } from "@/components/site/SiteChrome";

/**
 * Signed-in area: checkout, bookings, dashboards. The pages themselves gate on
 * the session because storage only exists in the browser.
 */
export default function AppLayout({ children }) {
  return (
    <div className="premium-site flex min-h-screen flex-col">
      <SiteChrome premium>{children}</SiteChrome>
    </div>
  );
}
