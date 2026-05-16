import * as rtl from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  SkinProvider,
  createSkinRegistry,
  useSkin,
} from '../src/index';

type HarnessSkinId = 'a' | 'b';

const defs = [
  { id: 'a' as const, label: 'A' },
  { id: 'b' as const, label: 'B' },
];

function Harness() {
  const { skin, setSkin, ready } = useSkin<HarnessSkinId>();

  void ready;

  return (
    <button type="button" onClick={() => setSkin('b', { withBoot: false })}>
      {skin}
    </button>
  );
}

afterEach(() => {
  window.localStorage.clear();
});

describe('SkinProvider', () => {
  it('hydrates DOM from stored defaultSkin and persists on theme change', async () => {
    const registry = createSkinRegistry(defs, {
      storageKey: 'skin-key',
      defaultSkin: 'a',
    });

    const view = rtl.render(
      <SkinProvider registry={registry}>
        <Harness />
      </SkinProvider>,
    );

    await vi.waitFor(() => {
      expect(document.documentElement.getAttribute('data-skin')).toBe('a');
    });

    rtl.fireEvent.click(view.getByRole('button'));

    await vi.waitFor(() => {
      expect(document.documentElement.getAttribute('data-skin')).toBe('b');
    });

    expect(window.localStorage.getItem('skin-key')).toBe('b');

    view.unmount();
  });
});
