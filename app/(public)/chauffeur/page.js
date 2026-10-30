import { ChauffeurListClient } from "@/components/site/ChauffeurListClient";

export const metadata = {
  title: "Chauffeur Service – Sheger Wheels",
  description:
    "Book a professional chauffeur for your trip. All our drivers are vetted, experienced, and ready to serve in Addis Ababa.",
  alternates: { canonical: "/chauffeur" },
};

export default function ChauffeurPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 py-14">
      {/* Hero heading */}
      <div className="mb-12 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-forest">
          Professional Chauffeurs
        </p>
        <h1 className="text-4xl font-bold text-ink md:text-5xl">
          Ride with the&nbsp;
          <span
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            best drivers
          </span>
          &nbsp;in Addis
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted">
          Every chauffeur is background-checked, professionally trained, and
          rated by real Sheger Wheels customers. Add one to any booking or hire
          directly.
        </p>
      </div>

      <ChauffeurListClient />
    </div>
  );
}
