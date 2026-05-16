import { describe, expect, it } from 'vitest';

import { createSkinRegistry } from '../src/registry';
import {
  applySkinDom,
  createMemoryStorage,
  readStoredSkinRaw,
} from '../src/storage';

describe('storage helpers', () => {
  it('writes data-skin and mirrors to storage backend', () => {
    const registry = createSkinRegistry(
      [
        { id: 'light', label: 'Light' },
        { id: 'dark', label: 'Dark' },
      ],
      { storageKey: 'demo-skin' },
    );

    const mem = createMemoryStorage();
    const target = document.createElement('html');

    applySkinDom('dark', registry, { storage: mem, target });

    expect(target.getAttribute('data-skin')).toBe('dark');
    expect(mem.getItem('demo-skin')).toBe('dark');

    applySkinDom('light', registry, { storage: mem, target });

    expect(target.getAttribute('data-skin')).toBe('light');
    expect(mem.getItem('demo-skin')).toBe('light');

    expect(readStoredSkinRaw(registry, mem)).toBe('light');
  });
});
