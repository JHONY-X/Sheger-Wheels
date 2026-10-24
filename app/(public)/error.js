"use client";

import { Button, EmptyState } from "@/components/ui";

/**
 * Public error boundary. A failed render inside the site chrome should not
 * replace the whole page with the framework overlay — the visitor gets a way
 * back instead.
 */
export default function PublicError({ reset }) {
  return (
    <div className="mx-auto w-full max-w-[720px] px-6 py-20">
      <EmptyState
        tone="error"
        title="Something went wrong on this page"
        description="The demo hit an unexpected error. Your saved data is untouched — try again, or go back to the catalogue."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => reset()}>Try again</Button>
            <Button href="/cars" variant="secondary">
              Browse cars
            </Button>
          </div>
        }
      />
    </div>
  );
}
