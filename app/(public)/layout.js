import { SiteChrome } from "@/components/site/SiteChrome";

export default function PublicLayout({ children }) {
  return (
    <div className="premium-site flex min-h-screen flex-col">
      <SiteChrome premium>{children}</SiteChrome>
    </div>
  );
}
