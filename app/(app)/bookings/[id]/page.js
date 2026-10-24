import { DashboardNav } from "@/components/app/DashboardNav";
import { RequireRole } from "@/components/app/RequireRole";
import { BookingDetailClient } from "@/components/bookings/BookingDetailClient";

/* Private, runtime-gated screens: render on request, not in the static shell. */
export const instant = false;

export const metadata = {
  title: "Booking",
  robots: { index: false, follow: false },
};

export default async function BookingPage({ params }) {
  const { id } = await params;

  return (
    <>
      <DashboardNav />
      <div className="mx-auto w-full max-w-[1100px] px-6 py-10">
        <RequireRole>
          <BookingDetailClient id={id} />
        </RequireRole>
      </div>
    </>
  );
}
