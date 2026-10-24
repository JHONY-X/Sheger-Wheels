import { DashboardNav } from "@/components/app/DashboardNav";
import { RequireRole } from "@/components/app/RequireRole";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

/* Private, runtime-gated screens: render on request, not in the static shell. */
export const instant = false;

export const metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <>
      <DashboardNav />
      <div className="mx-auto w-full max-w-[1200px] px-6 py-10">
        <RequireRole>
          <DashboardClient />
        </RequireRole>
      </div>
    </>
  );
}
