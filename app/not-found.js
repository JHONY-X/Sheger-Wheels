import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <main
      id="main"
      className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 py-24 text-center"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ochre-ink">
        404
      </p>
      <h1 className="mt-3 text-4xl font-semibold text-ink">
        This page took a wrong turn
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        The route you followed doesn&apos;t exist yet. It may be scheduled for a
        later phase of the build.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button href="/">Back to home</Button>
        <Button variant="secondary" href="/styleguide">
          Design system
        </Button>
      </div>
    </main>
  );
}
