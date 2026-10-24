import { seedCars } from "@/lib/seed/cars";
import { SITE_URL } from "@/lib/site";

const publicCars = seedCars.filter((car) => car.status === "approved" && car.active);

/* Stable across builds, and honest: it is the newest seeded listing. */
const lastModified = new Date(
  publicCars
    .map((car) => car.createdAt)
    .sort()
    .at(-1) ?? "2025-01-01T00:00:00.000Z",
);

/** Only public routes and approved cars belong in the sitemap. */
export default function sitemap() {
  const pages = [
    { url: `${SITE_URL}/`, priority: 1, changeFrequency: "weekly" },
    { url: `${SITE_URL}/cars`, priority: 0.9, changeFrequency: "daily" },
  ].map((page) => ({ ...page, lastModified }));

  const cars = publicCars.map((car) => ({
    url: `${SITE_URL}/cars/${car.id}`,
    lastModified,
    priority: 0.7,
    changeFrequency: "weekly",
  }));

  return [...pages, ...cars];
}
