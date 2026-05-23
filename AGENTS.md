# AGENTS.md — @bstockwelldev/react-skin-system

## Purpose

- Framework-neutral **`html[data-skin]`** runtime only: registry, persistence, boot overlay, bootstrap script helper.
- Styling lives in the host and optional **`@bstockwelldev/skin-pack-*`** packages — no Tailwind/shadcn coupling here.

## Quick start

```bash
pnpm install
pnpm run build
pnpm run typecheck
pnpm run test
```

## Repo shape

- `src/` — runtime (`SkinProvider`, registry, DOM helpers, `/next` bootstrap export).
- `docs/` — release roadmap, planned themes / Tabletop Studio notes.
- `tests/` — Vitest.

## Standards

- Keep **`buildSkinBootstrapScript`** output aligned with **`SkinRegistry.ids`** / **`storageKey`** (hosts must regenerate layout scripts when those change).
- DOM utilities must tolerate SSR and JSDOM (no unguarded `matchMedia`).
- Prefer small, typed public surfaces; **`SkinDefinition`** shape changes are breaking — use Changesets semver.

## Always / ask first / never

- **Always**: add or update tests for persistence, bootstrap parsing, or registry validation changes.
- **Ask first**: breaking changes to **`SkinDefinition`**, **`SkinRegistry`**, or export graph.
- **Never**: add host-specific routes, app selectors, or bundled theme CSS (use skin packs).

## Further reading

- Release & publish order: [`docs/steps-3-4-roadmap.md`](docs/steps-3-4-roadmap.md)
- Theme ideas & Tabletop Studio: [`docs/planned-themes-tabletop-integration.md`](docs/planned-themes-tabletop-integration.md)
