import { resetDemoData } from "../lib/storage.js";
import { refresh } from "../lib/store.js";
import { signInAsDemo, signOut } from "../lib/session.js";
import { SEED_USER_IDS } from "../lib/seed/users.js";

/** Clean slate with the seeded records loaded. */
export function resetApp() {
  globalThis.window.localStorage.clear();
  globalThis.window.sessionStorage.clear();
  resetDemoData();
  refresh();
}

/** Sign in without the UI. Throws if the demo account is missing. */
export function signIn(userId) {
  signOut();
  const result = signInAsDemo(userId);
  if (!result.ok) throw new Error(`signIn failed: ${result.code}`);
  return result.user;
}

export const A = SEED_USER_IDS;
