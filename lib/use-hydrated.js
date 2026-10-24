"use client";

import { useSyncExternalStore } from "react";

/** Nothing to subscribe to — the value never changes after hydration. */
function subscribe() {
  return () => {};
}

/**
 * True only after the first client render.
 *
 * `useSyncExternalStore` is the sanctioned way to read a client-only value:
 * the server snapshot is false, the client snapshot is true, and React
 * re-renders once after hydrating. No state is set inside an effect.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
