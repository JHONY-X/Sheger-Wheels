import { DashboardNav } from "@/components/app/DashboardNav";
import { RequireRole } from "@/components/app/RequireRole";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

/* Private, runtime-gated screens: render on request, not in the static shell. */
export const instant = false;

export const metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <DashboardNav />
      <div className="mx-auto w-full max-w-[1000px] px-6 py-10">
        <RequireRole>
          <CheckoutClient />
        </RequireRole>
      </div>
    </>
  );
}
