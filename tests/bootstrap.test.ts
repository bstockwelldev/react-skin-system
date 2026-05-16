import { describe, expect, it } from 'vitest';

import { createSkinRegistry } from '../src/registry';
import { buildSkinBootstrapScript } from '../src/next/bootstrap';

describe('buildSkinBootstrapScript', () => {
  it('embeds ids, storage key, and defaultSkin literal', () => {
    const r = createSkinRegistry(
      [
        { id: 'alpha', label: 'Alpha' },
        { id: 'beta', label: 'Beta' },
      ],
      { storageKey: 'my-app/skin', defaultSkin: 'beta' },
    );

    const src = buildSkinBootstrapScript(r);
    expect(src).toContain('alpha');
    expect(src).toContain('beta');
    expect(src).toContain('my-app/skin');
    expect(src).toContain('"beta"'); // serialized defaultSkin
  });

  it('runs in jsdom: prefers stored valid id', () => {
    const r = createSkinRegistry(
      [
        { id: 'sun', label: 'Sun' },
        { id: 'moon', label: 'Moon' },
      ],
      { storageKey: 'sk', defaultSkin: 'sun' },
    );
    window.localStorage.setItem('sk', 'moon');

    const fn = new Function(buildSkinBootstrapScript(r));
    fn();

    expect(document.documentElement.getAttribute('data-skin')).toBe('moon');
  });

  it('falls back when stored invalid', () => {
    const r = createSkinRegistry(
      [
        { id: 'sun', label: 'Sun' },
        { id: 'moon', label: 'Moon' },
      ],
      { storageKey: 'sk', defaultSkin: 'sun' },
    );
    window.localStorage.setItem('sk', 'alien');

    const fn = new Function(buildSkinBootstrapScript(r));
    fn();

    expect(document.documentElement.getAttribute('data-skin')).toBe('sun');
  });
});
