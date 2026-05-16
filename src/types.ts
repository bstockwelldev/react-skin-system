export interface PaletteFlavor {
  prompt: string;
  placeholder: string;
  welcome: string;
}

export interface SkinDefinition<Id extends string = string> {
  id: Id;
  label: string;
  family?: string;
  /** When true (default), this skin participates in cycling when no explicit cycle order is given. Set false to exclude from the default cycle derivation. */
  cycle?: boolean;
  /** Ledger lines shown in `SkinBootOverlay` before DOM apply. */
  bootIntroLines?: readonly string[];
  paletteFlavor?: PaletteFlavor;
}

export interface SkinRegistry<Id extends string = string> {
  ids: readonly Id[];
  cycle: readonly Id[];
  defaultSkin: Id;
  byId: Readonly<Record<Id, SkinDefinition<Id>>>;
  storageKey: string;
  /** All registered skin IDs (persisted selections must validate here). */
  valid: ReadonlySet<string>;
}

export interface CreateSkinRegistryOptions<Id extends string = string> {
  /** localStorage key (e.g. `my-app-skin`). */
  storageKey: string;
  /** Fallback when stored value is unknown. Defaults to first definition id. */
  defaultSkin?: Id;
  /** Explicit cycle order (must be subset of definition ids). If omitted, derives from defs with `cycle !== false`. */
  cycle?: readonly Id[];
}
