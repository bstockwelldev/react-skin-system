import type { SkinRegistry } from './types.js';

export interface SkinDomTarget {
  setAttribute(name: string, value: string): void;
}

export interface SkinStorageBackend {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** In-memory storage for SSR/tests (isolated Map per factory call). */
export function createMemoryStorage(initial?: Record<string, string>): SkinStorageBackend {
  const memoryStore = new Map<string, string>(
    initial ? Object.entries(initial) : [],
  );
  return {
    getItem: (key) => memoryStore.get(key) ?? null,
    setItem: (key, value) => {
      memoryStore.set(key, value);
    },
  };
}

/** Safe localStorage accessor (SSR-safe). */
export function getBrowserLocalStorage(): SkinStorageBackend | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function resolveDocumentElement(): SkinDomTarget | null {
  if (typeof document === 'undefined') return null;
  return document.documentElement;
}

/**
 * Persist + apply `data-skin` attribute. Prefer `SkinProvider`; this helper is for bootstrap scripts and tests.
 */
export function applySkinDom<Id extends string>(
  id: Id,
  registry: SkinRegistry<Id>,
  opts?: {
    target?: SkinDomTarget | null;
    storage?: SkinStorageBackend | null;
  },
): void {
  const target = opts?.target ?? resolveDocumentElement();
  target?.setAttribute('data-skin', String(id));

  const storage = opts?.storage ?? getBrowserLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(registry.storageKey, String(id));
  } catch {
    /* ignore quota / private mode */
  }
}

export function readStoredSkinRaw<Id extends string>(
  registry: SkinRegistry<Id>,
  storage?: SkinStorageBackend | null,
): string | null {
  const s = storage ?? getBrowserLocalStorage();
  if (!s) return null;
  try {
    return s.getItem(registry.storageKey);
  } catch {
    return null;
  }
}
