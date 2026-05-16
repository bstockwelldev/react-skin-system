# Planned themes & Tabletop Studio integration

This note extends **[@bstockwelldev/react-skin-system](https://github.com/bstockwelldev/react-skin-system)** beyond Step 1: it lists **planned skin themes**, what belongs **in this package vs the host**, and **example adoption paths** anchored in **`tabletop-studio`** (Next.js App Router, `skinRegistry`, sidebar navigation).

## Separation of responsibilities

| Layer | Package (`react-skin-system`) | Host (`tabletop-studio`) |
| --- | --- | --- |
| Skin identity | `SkinDefinition`: `id`, `label`, `cycle`, `bootIntroLines`, `paletteFlavor` | Extends defs in [`src/lib/skins/skinRegistry.ts`](../../tabletop-studio/src/lib/skins/skinRegistry.ts); keep **bootstrap script + `SKIN_STORAGE_KEY`** in sync |
| DOM contract | Writes `document.documentElement[data-skin="{id}"], persists `{storageKey}` | CSS selectors `html[data-skin="…"]` (or `:root[data-skin]`), Tailwind token overrides |
| Routing / IA | *(none)* — skin does not imply URL structure | [`src/config/navigation.ts`](../../tabletop-studio/src/config/navigation.ts): `href`, labels, HUD copy |
| “Overworld map” UX | Optionally shared **patterns** docs only | Dedicated layouts, sprites, quests, animations — application code |

**Rule:** every **real page** stays a normal App Router segment (e.g. `/playtesting`); entering a **“building”** in an overworld is a **presentation layer** mapping to `next/link` (or programmatic `router.push`). Do not duplicate business logic inside theme-only components.

---

## Theme A — JP 90s UNIX Park System (“park terminal”)

**Intent:** Neon park-signage UNIX vibe; feels like early-90s Japanese campus/workstation kiosk copy, not Vault/RobCo.

### Status vs Tabletop Studio

Tabletop Studio already ships a preview skin id:

- **`jp-90s-park-system`** in [`skinRegistry`](../../tabletop-studio/src/lib/skins/skinRegistry.ts) (labels, palette flavor, cycle membership).

Integration work is primarily **completion + polish**, not new plumbing.

### Suggested additions (host-owned CSS)

| Area | Example direction |
| --- | --- |
| Typography | Monospace headings; optional Latin / Latin+CJK-ready stack separate from Vault skin |
| Color | CRT-green alternative to amber; teal/magenta accents for signage |
| Motion | CRT flicker gated behind `prefers-reduced-motion: no-preference`; align with [`SkinBootOverlay`](../src/SkinBootOverlay.tsx) skip path |
| Tokens | Mirror `vault-terminal` patterns: remap `--sidebar-*`, `--background`, `--foreground` under `html[data-skin='jp-90s-park-system']` |

### Package-side (optional enrichment)

Extend `paletteFlavor` / `bootIntroLines` entries for this id when copy is finalized (still defined in **`tabletop-studio`**, not bundled CSS in `@bstockwelldev/react-skin-system` Step 2+).

---

## Theme B — GBC Pokémon (Game Boy Color)

**Intent:** Retro handheld readability: chunky UI, quad-friendly spacing, constrained palette (greens + HUD browns), nostalgic **non-infringing** flavor text (no copyrighted names/assets in the OSS package).

### Proposed registry id

- **`gbc-pocket-workshop`** (example slug; rename to match branding policy).

Recommended: `cycle: true` unless you reserve it for demos only (`cycle: false`).

### `SkinDefinition` sketch (host file)

Conceptual keys only—the host implements the array:

```ts
// tabletop-studio/src/lib/skins/skinRegistry.ts (future)
{
  id: 'gbc-pocket-workshop',
  label: 'Pocket Workshop (GBC homage)',
  bootIntroLines: [
    // 5–7 lines, original copy only
  ],
  paletteFlavor: {
    prompt: '▶ ',
    placeholder: 'Select move… er, command.',
    welcome: 'Your party of prototypes is rested and ready.',
  },
}
```

### Integration plan (Tabletop Studio)

1. **`SKIN_IDS` / bootstrap script** — add id next to `'jp-90s-park-system'` parity (same hygiene as Vault cycle).
2. **CSS blocks** — `html[data-skin='gbc-pocket-workshop']` remaps border radius (smaller), font sizes bumped for “scanline density,” chunky focus rings (`outline`/`ring` equivalents).
3. **Icons** — keep Lucide icons; optional duotone/outline filter via CSS (`filter`) for “sprite” vibe without replacing icon set.

### Accessibility

Maintain **minimum contrast** WCAG AA against new greens; **`SkinBootOverlay`** skip + focus trap unchanged.

---

## Theme C — Virtual world / overworld map

**Intent:** Treat the authenticated product as an ** RPG-style town**: the user avatar moves between **locations** tied to existing tools. **`data-skin` toggles cosmetic shell** (`virtual-world-town` skin); **`navigation`** remains the authoritative map of URLs and feature gates.

### What this theme is **not**

- Not a rewrite of **`projectActions`** / server actions / RLS.
- Not replacing `/playtesting`, `/ideation`, etc. — those routes keep current functionality.

### “Building ↔ route” grounding (from `navigation.ts`)

Concrete mapping proposals (labels can theme while `href` stays fixed):

| In-world metaphor | Tabletop Studio route (`href`) | Notes |
| --- | --- | --- |
| Town square / billboard | `/dashboard` | Entry plaza; HUD ticker already supported via `hudMessage` on items |
| Project vault / archive | `/projects` | Requires no project selection for access |
| Creative park / plaza | `/ideation` | `Ideation Space` (`/ideation`) |
| Workshops / prototyping yard | `/prototyping`, `/canvas`, `/micro-ui-builder` | Project-scoped for most |
| Guild hall library | `/component-library`, `/ruleset`, `/smart-import-wizard` | Rules + imports “archive” framing |
| Battle arena | `/playtesting` | Matches `Playtesting Hub` metaphor |
| Lab / oracle tower | `/ai-validator`, `/ai-usage` | “NPC” prompts as copy only |
| Town hall bulletin | `/project-board`, `/task-queue-board` | Planning surfaces |
| Market row | `/product-pages`, `/analytics`, `/integrations`, `/checkout`, `/pricing` | Commerce / outward-facing metaphors |

**Implementation strategy (phases)**

1. **Skin-only (low risk)** — New `SkinDefinition` + CSS + `paletteFlavor` strings (“NPC” names in HUD, themed `WelcomeTipCard`).
2. **Shell layout (medium)** — Shared `(app)/layout.tsx` branch when `skin === 'virtual-world-town'`: renders a **minimal overworld backdrop** plus existing `AppSidebar` / content — same children tree.
3. **Spatial UI (future, high effort)** — Optional route `/(app)/overworld` mounting a canvas/grid; tile clicks **`router.push` to real tool routes** listed above; persist last position to `localStorage` with a **distinct key** from `SKIN_STORAGE_KEY` to respect single-responsibility of `react-skin-system`.

Gamification knobs (quests, XP) stay **orthogonal**: store in **`user_profiles` / feature flags**, not inside the skin package runtime.

---

## Cross-theme checklist (`tabletop-studio`)

When adding any skin listed above:

1. [`src/lib/skins/skinRegistry.ts`](../../tabletop-studio/src/lib/skins/skinRegistry.ts) — `SKIN_IDS`, `SKIN_CYCLE`, labels, `BOOT_INTRO_LINES`, `PALETTE_FLAVOR`.
2. Root layout bootstrap script — same allowlist tokens as **`buildSkinBootstrapScript`** would emit if/when migrated to **`@bstockwelldev/react-skin-system`**.
3. [`src/contexts/SkinContext.tsx`](../../tabletop-studio/src/contexts/SkinContext.tsx) (today) vs future **package `SkinProvider`** — behavior parity (`withBoot`, reduced motion shortcut).
4. Global CSS token blocks per `html[data-skin='…']`.
5. Quick regression: cycle control, SSR first paint (`beforeInteractive`), `AppSidebar` active state (`usePathname`).

---

## Future packages (outside Step 1)

| Deliverable | Role |
| --- | --- |
| `@bstockwelldev/skin-pack-*` | Versioned CSS + copy bundles per theme |
| Optional overworld toolkit | Sprites, collision grid, quests — separate from **`react-skin-system`** |

_Last updated alongside Tabletop Studio `skinRegistry` as of authoring; adjust links if directories move._
