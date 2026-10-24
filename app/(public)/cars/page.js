import { Suspense } from "react";

import { CatalogueClient } from "@/components/cars/CatalogueClient";
import { CarCardSkeleton } from "@/components/ui";

export const metadata = {
  title: "Browse cars",
  description:
    "Filter peer-to-peer car rentals in Addis Ababa by neighbourhood, dates, price, transmission and seats.",
  alternates: { canonical: "/cars" },
};

function CatalogueFallback() {
  return (
    <div>
      <div className="h-9 w-64 max-w-full rounded bg-sand" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((key) => (
          <CarCardSkeleton key={key} />
        ))}
      </div>
    </div>
  );
}

export default function CarsPage() {
  return (
    <div className="premium-catalogue-page mx-auto w-full max-w-[1320px] px-6 py-10">
      <Suspense fallback={<CatalogueFallback />}>
        <CatalogueClient />
      </Suspense>
    </div>
  );
}
