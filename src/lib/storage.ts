/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Memory fallback store in case localStorage is disabled or restricted
const memoryStore = new Map<string, string>();

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // In private mode or when storage access is blocked by browser shields
    }
    return memoryStore.get(key) || null;
  },

  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // In private mode or when storage quota is exceeded
    }
    memoryStore.set(key, value);
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Silently ignore
    }
    memoryStore.delete(key);
  }
};
