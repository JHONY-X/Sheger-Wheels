import { beforeEach } from "vitest";

/**
 * The domain layer talks to window.localStorage / window.sessionStorage.
 * These in-memory doubles keep the tests in a Node environment and make
 * "storage is full / malformed" cases easy to simulate.
 */
class MemoryStorage {
  #map = new Map();

  get length() {
    return this.#map.size;
  }

  key(index) {
    return [...this.#map.keys()][index] ?? null;
  }

  getItem(key) {
    return this.#map.has(key) ? this.#map.get(key) : null;
  }

  setItem(key, value) {
    this.#map.set(key, String(value));
  }

  removeItem(key) {
    this.#map.delete(key);
  }

  clear() {
    this.#map.clear();
  }
}

const localStorage = new MemoryStorage();
const sessionStorage = new MemoryStorage();

globalThis.window = {
  localStorage,
  sessionStorage,
  addEventListener() {},
  removeEventListener() {},
};

// Some helpers read the globals directly rather than through window.
globalThis.localStorage = localStorage;
globalThis.sessionStorage = sessionStorage;

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
