"use client";

import { Button, CarCardSkeleton, EmptyState } from "@/components/ui";
import { CarCard } from "@/components/car/CarCard";
import { ratingForCar, sortCars } from "@/lib/cars-query";
import { useDemoData } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

/** Three recommended cars, straight from the seeded catalogue. */
export function FeaturedCars() {
  const data = useDemoData();
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <CarCardSkeleton key={key} />
        ))}
      </div>
    );
  }

  const publicCars = data.cars.filter(
    (car) => car.status === "approved" && car.active,
  );
  const featured = sortCars(publicCars, "recommended", {
    bookings: data.bookings,
  }).slice(0, 3);

  if (featured.length === 0) {
    return (
      <EmptyState
        title="No cars published yet"
        description="The demo catalogue is empty. Reset the demo data from the developer tools to bring the seed listings back."
        action={
          <Button href="/dev" variant="secondary">
            Open developer tools
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {featured.map((car) => {
        const rating = ratingForCar(data.reviews, car.id);
        return (
          <CarCard
            key={car.id}
            car={{ ...car, rating: rating?.average }}
          />
        );
      })}
    </div>
  );
}
