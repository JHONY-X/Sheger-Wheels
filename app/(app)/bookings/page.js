import { DashboardNav } from "@/components/app/DashboardNav";
import { RequireRole } from "@/components/app/RequireRole";
import { BookingsClient } from "@/components/bookings/BookingsClient";

/* Private, runtime-gated screens: render on request, not in the static shell. */
export const instant = false;

export const metadata = {
  title: "My bookings",
  robots: { index: false, follow: false },
};

export default function BookingsPage() {
  return (
    <>
      <DashboardNav />
      <div className="mx-auto w-full max-w-[1200px] px-6 py-10">
        <RequireRole>
          <BookingsClient />
        </RequireRole>
      </div>
    </>
  );
}
