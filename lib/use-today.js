"use client";

import { useSyncExternalStore } from "react";
import { todayISO } from "./dates.js";

const subscribe = () => () => {};

/**
 * Today's date in the visitor's timezone, or "" during the prerender.
 *
 * Reading the clock during a prerender would bake the build date into the
 * static HTML. Returning "" on the server and the real date on the client
 * keeps date inputs honest without setting state in an effect.
 */
export function useTodayISO() {
  return useSyncExternalStore(
    subscribe,
    () => todayISO(),
    () => "",
  );
}
