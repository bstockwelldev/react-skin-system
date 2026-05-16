import { describe, expect, it } from 'vitest';

import {
  createSkinRegistry,
  nextSkinInCycle,
  parseStoredSkin,
  skinNeedsBootIntro,
} from '../src/registry';

describe('createSkinRegistry', () => {
  const defs = [
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Bravo', cycle: false },
    { id: 'c', label: 'Charlie' },
  ] as const;

  it('derives defaults and cycle exclusions', () => {
    const r = createSkinRegistry(defs, { storageKey: 't' });

    expect(r.ids).toEqual(['a', 'b', 'c']);
    expect(r.defaultSkin).toBe('a');
    expect(r.cycle).toEqual(['a', 'c']);
    expect(Array.from(r.valid)).toEqual(expect.arrayContaining(['a', 'b', 'c']));
  });

  it('honors explicit cycle order', () => {
    const r = createSkinRegistry(defs, {
      storageKey: 't',
      cycle: ['c', 'a'],
    });

    expect(r.cycle).toEqual(['c', 'a']);
  });

  it('throws on duplicate ids', () => {
    expect(() =>
      createSkinRegistry(
        [
          { id: 'x', label: 'X' },
          { id: 'x', label: 'X2' },
        ],
        { storageKey: 't' },
      ),
    ).toThrow(/duplicate/i);
  });

  it('throws when defaultSkin is unknown', () => {
    expect(() =>
      createSkinRegistry(defs, { storageKey: 't', defaultSkin: 'nope' as 'a' }),
    ).toThrow(/defaultSkin/);
  });

  it('throws when cycle references unknown ids', () => {
    expect(() =>
      createSkinRegistry(defs, {
        storageKey: 't',
        cycle: ['a', 'z' as never],
      }),
    ).toThrow(/unknown/);
  });
});

describe('parseStoredSkin', () => {
  const r = createSkinRegistry(
    [
      { id: 'one', label: '1' },
      { id: 'two', label: '2', cycle: false },
    ],
    { storageKey: 'k', defaultSkin: 'two' },
  );

  it('accepts stored valid ids including non-cycled skins', () => {
    expect(parseStoredSkin('one', r)).toBe('one');
    expect(parseStoredSkin('two', r)).toBe('two');
  });

  it('falls back for invalid stored values', () => {
    expect(parseStoredSkin('missing', r)).toBe('two');
    expect(parseStoredSkin(null, r)).toBe('two');
  });
});

describe('nextSkinInCycle', () => {
  const r = createSkinRegistry(
    [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
      { id: 'c', label: 'C', cycle: false },
    ],
    { storageKey: 'k', cycle: ['a', 'b'] },
  );

  it('wraps the cycle sequence', () => {
    expect(nextSkinInCycle('a', r)).toBe('b');
    expect(nextSkinInCycle('b', r)).toBe('a');
    expect(nextSkinInCycle('c', r)).toBe('a');
  });

  it('returns defaultSkin when cycle empty', () => {
    const empty = createSkinRegistry(
      [{ id: 'only', label: 'Only', cycle: false }],
      { storageKey: 'z', cycle: [] },
    );
    expect(nextSkinInCycle('only', empty)).toBe('only');
  });
});

describe('skinNeedsBootIntro', () => {
  const r = createSkinRegistry(
    [
      { id: 'plain', label: 'Plain' },
      {
        id: 'fancy',
        label: 'Fancy',
        bootIntroLines: ['LINE 1'],
      },
    ],
    { storageKey: 'k' },
  );

  it('reflects presence of boot intro lines', () => {
    expect(skinNeedsBootIntro('plain', r)).toBe(false);
    expect(skinNeedsBootIntro('fancy', r)).toBe(true);
  });
});
