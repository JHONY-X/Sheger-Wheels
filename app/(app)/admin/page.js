import { DashboardNav } from "@/components/app/DashboardNav";
import { RequireRole } from "@/components/app/RequireRole";
import { AdminClient } from "@/components/admin/AdminClient";

/* Private, runtime-gated screens: render on request, not in the static shell. */
export const instant = false;

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <>
      <DashboardNav />
      <div className="mx-auto w-full max-w-[1200px] px-6 py-10">
        <RequireRole role="admin">
          <AdminClient />
        </RequireRole>
      </div>
    </>
  );
}
