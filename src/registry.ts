import type {
  CreateSkinRegistryOptions,
  SkinDefinition,
  SkinRegistry,
} from './types.js';

function assertUniqueIds<Id extends string>(definitions: readonly SkinDefinition<Id>[]): void {
  const seen = new Set<string>();
  for (const d of definitions) {
    if (seen.has(d.id)) {
      throw new Error(`createSkinRegistry: duplicate skin id "${d.id}"`);
    }
    seen.add(d.id);
  }
}

function deriveCycleIds<Id extends string>(
  definitions: readonly SkinDefinition<Id>[],
): Id[] {
  const derived = definitions.filter((d) => d.cycle !== false).map((d) => d.id);
  if (derived.length > 0) return derived;
  return definitions.map((d) => d.id);
}

/**
 * Validates and normalizes a skin registry plus cycle order for `@bstockwelldev/react-skin-system`.
 */
export function createSkinRegistry<Id extends string>(
  definitions: readonly SkinDefinition<Id>[],
  options: CreateSkinRegistryOptions<Id>,
): SkinRegistry<Id> {
  if (!definitions.length) {
    throw new Error('createSkinRegistry: at least one skin definition is required');
  }

  assertUniqueIds(definitions);

  const ids = definitions.map((d) => d.id);

  let defaultSkin: Id =
    options.defaultSkin ?? ids[0]!;

  if (!ids.includes(defaultSkin)) {
    throw new Error(
      `createSkinRegistry: defaultSkin "${defaultSkin}" is not in definitions`,
    );
  }

  const byId = Object.fromEntries(
    definitions.map((d) => [d.id, d]),
  ) as Record<Id, SkinDefinition<Id>>;

  const requestedCycle = options.cycle ?? deriveCycleIds(definitions);
  const missing = requestedCycle.filter((id) => !ids.includes(id));
  if (missing.length) {
    throw new Error(
      `createSkinRegistry: cycle contains unknown ids: ${missing.join(', ')}`,
    );
  }

  const duplicateCycle = requestedCycle.some(
    (id, idx) => requestedCycle.indexOf(id) !== idx,
  );
  if (duplicateCycle) {
    throw new Error('createSkinRegistry: cycle order must not contain duplicates');
  }

  return {
    ids,
    cycle: requestedCycle,
    defaultSkin,
    byId,
    storageKey: options.storageKey,
    valid: new Set(ids.map(String)),
  };
}

/** True when switching to this skin should run the boot overlay (unless reduced motion skips). */
export function skinNeedsBootIntro<Id extends string>(
  skinId: Id,
  registry: SkinRegistry<Id>,
): boolean {
  const lines = registry.byId[skinId]?.bootIntroLines;
  return Boolean(lines?.length);
}

/** Parse a stored raw value against the registry; unknown values fall back to defaultSkin. */
export function parseStoredSkin<Id extends string>(
  value: string | null | undefined,
  registry: SkinRegistry<Id>,
): Id {
  if (value && registry.valid.has(value)) {
    return value as Id;
  }
  return registry.defaultSkin;
}

/** Advance within the declared cycle sequence. Unknown current maps to index -1 → first in cycle. */
export function nextSkinInCycle<Id extends string>(
  current: Id,
  registry: SkinRegistry<Id>,
): Id {
  const list = registry.cycle;
  if (!list.length) {
    return registry.defaultSkin;
  }
  const idx = list.indexOf(current);
  const nextIdx = idx === -1 ? 0 : (idx + 1) % list.length;
  const nextId = list[nextIdx];
  return nextId ?? registry.defaultSkin;
}
