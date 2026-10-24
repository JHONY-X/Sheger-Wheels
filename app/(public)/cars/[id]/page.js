import { Suspense } from "react";

import { CarDetailClient } from "@/components/cars/CarDetailClient";
import { Skeleton } from "@/components/ui";
import { formatETB } from "@/lib/format";
import { seedCars } from "@/lib/seed/cars";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

const isPublic = (car) => car.status === "approved" && car.active;

function DetailFallback() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-8">
      <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          <Skeleton className="aspect-[16/10] w-full rounded-card" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-96 w-full rounded-card" />
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return seedCars.filter(isPublic).map((car) => ({ id: car.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const car = seedCars.find((item) => item.id === id && isPublic(item));

  if (!car) {
    return {
      title: "Car not available",
      robots: { index: false, follow: true },
    };
  }

  const title = `${car.make} ${car.model} ${car.year}`;
  const description = `Rent a ${title} in ${car.neighbourhood}, Addis Ababa. ${car.seats} seats, ${car.transmission}, from ${formatETB(car.pricePerDay)} per day. Demo listing with simulated bookings.`;

  return {
    title,
    description,
    alternates: { canonical: `/cars/${car.id}` },
    openGraph: {
      title: `${title} · ${SITE_NAME}`,
      description,
      url: absoluteUrl(`/cars/${car.id}`),
      type: "website",
    },
  };
}

async function CarDetail({ params }) {
  const { id } = await params;
  const car = seedCars.find((item) => item.id === id && isPublic(item));

  const jsonLd = car
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: `${car.make} ${car.model} ${car.year}`,
        description: car.description,
        category: "Car rental",
        brand: { "@type": "Brand", name: car.make },
        offers: {
          "@type": "Offer",
          price: car.pricePerDay,
          priceCurrency: "ETB",
          availability: "https://schema.org/InStock",
          url: absoluteUrl(`/cars/${car.id}`),
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          /* Escaping `<` prevents a closing script tag inside the data. */
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <CarDetailClient id={id} />
    </>
  );
}

export default function CarPage({ params }) {
  return (
    <Suspense fallback={<DetailFallback />}>
      <CarDetail params={params} />
    </Suspense>
  );
}