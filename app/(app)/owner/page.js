import { DashboardNav } from "@/components/app/DashboardNav";
import { RequireRole } from "@/components/app/RequireRole";
import { OwnerClient } from "@/components/owner/OwnerClient";

/* Private, runtime-gated screens: render on request, not in the static shell. */
export const instant = false;

export const metadata = {
  title: "Owner dashboard",
  robots: { index: false, follow: false },
};

export default function OwnerPage() {
  return (
    <>
      <DashboardNav />
      <div className="mx-auto w-full max-w-[1200px] px-6 py-10">
        <RequireRole role="owner">
          <OwnerClient />
        </RequireRole>
      </div>
    </>
  );
}
