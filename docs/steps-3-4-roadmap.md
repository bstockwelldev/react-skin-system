# Roadmap: Steps 3–4 (after Step 2 skin pack)

This document tracks **remaining work** to make the skin stack repeatable and publishable **before** adopting it inside apps such as **`tabletop-studio`**.

## Current state

| Step | Package / artifact | Status |
| --- | --- | --- |
| 1 | [`@bstockwelldev/react-skin-system`](https://github.com/bstockwelldev/react-skin-system) | Runtime shipped (provider, registry, bootstrap helper, tests). Remains **`private`** until publishing is configured. |
| 2 | [`@bstockwelldev/skin-pack-robco-terminal`](https://github.com/bstockwelldev/skin-pack-robco-terminal) | Exemplar **RobCo** `SkinDefinition` + scoped CSS (`html[data-skin='robco-terminal']`). **`private`** until publishing. |

**Not yet started:** Step 3 (CLI), Step 4 (registry + CI publish).

---

## Step 3 — `@bstockwelldev/skin-cli`

**Goal:** Idempotent scaffolding so hosts do not hand-wire registry entries, bootstrap scripts, and CSS imports across Next.js / Vite codebases.

### Deliverables

1. **New repo/package** `@bstockwelldev/skin-cli`  
   - **Runtime:** Node 20+ CLI (e.g. `commander` or `citty`).  
   - **No React peer** unless a future optional UI wizard is justified.

2. **Core commands (MVP)**

   | Command | Behavior |
   | --- | --- |
   | **`skin-cli init`** | Detect Next (App Router) vs Vite; write or merge a **`skins/registry.ts`** (or host-chosen path) importing `createSkinRegistry` + selected packs; print follow-up checklist. |
   | **`skin-cli add-pack <npm-name>`** | Add `pnpm`/`npm` dependency; append pack skin(s) to registry array template; hint `@import …/style.css` for global CSS. |
   | **`skin-cli bootstrap next`** | Emit or patch **`beforeInteractive`** snippet using `buildSkinBootstrapScript(registry)` (document exact file targets; prefer patch behind `--write` with backup). |
   | **`skin-cli verify`** | Assert registry `ids` ∪ `storageKey` match inlined bootstrap script string (static scan + optional AST later). |

3. **Safety**

   - **`--dry-run`** default or explicit guard before writes.  
   - **Diff preview** stdout for every file change.  
   - **Conflict detection**: skip if handcrafted bootstrap duplicates allowlist differently.

4. **Tests**

   - Fixtures: minimal Next + Vite temp dirs; CLI runs in subprocess; snapshot changed files.  
   - No dependency on real **`tabletop-studio`**—use neutral fixture apps.

### Dependencies / ordering

- **`react-skin-system`** defines the **`SkinRegistry`** contract and **`buildSkinBootstrapScript`**.  
- **Skin packs** are optional inputs; **`skin-cli`** should accept any pack that exports `SkinDefinition` objects and ships **`./style.css`**.

---

## Step 4 — Private (or scoped public) publishing + CI

**Goal:** Consume packages via semver instead of **`file:`** siblings, suitable for CI and remote agents.

### Repo layout decisions

Choose one and document it in the repos’ **`README`**:

| Model | Pros | Cons |
| --- | --- | --- |
| **A. Independent repos** (current layout) | Clear ownership; aligns with **`package.json`** `repository.url` today. | Coordinating semver across packages needs discipline (Changesets-per-repo or release train). |
| **B. Monorepo (`pnpm-workspace.yaml`)** | Single Changesets bump; shared CI.t | Migration cost; tooling churn. |

*Default assumption for Steps 3–4: **stay independent repos**, version packages independently.*

### NPM / GitHub Packages

1. **`private: false`** (or controlled publish scope) when ready—but only after naming + license audit.  
2. **Scoped registry (`@bstockwelldev`)**  
   - **GitHub Packages:** `.npmrc` in consumer apps:

```ini
@bstockwelldev:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

3. **`NODE_AUTH_TOKEN`** / **`GITHUB_TOKEN`** in CI secrets for **`npm publish`** (or **`pnpm publish`**).

### Release automation (recommended)

- **Changesets** (or **`release-it`**) per repo: changelog + version bump PR.  
- **GitHub Actions** workflow:
  - On **PR**: `pnpm i`, **`lint`/`test`/`typecheck`/`build`** for each package (`react-skin-system`, `skin-pack-*`, later `skin-cli`).  
  - On **release tag** / merge of version PR: **`npm publish`** to GitHub Packages.

### Publication order

1. **`@bstockwelldev/react-skin-system`** first (consumers depend on it).  
2. **`@bstockwelldev/skin-pack-robco-terminal`** — change **`devDependency`** **`file:`** reference to semver range **`^x.y.z`** on the published runtime.  
3. **`@bstockwelldev/skin-cli`** depends on semver **`react-skin-system`** (+ optional pinned pack versions in templates).

### Consumer migration checklist (host apps — *after* Steps 3–4)

- Replace **`file:`** installs with **`@bstockwelldev/...`** from registry.  
- Lock **`storageKey`** and bootstrap allowlists to **`buildSkinBootstrapScript`** output.  
- Import pack CSS via **`@import '@bstockwelldev/skin-pack-robco-terminal/style.css'`** (or bundler-relative equivalent).

---

## Step 5+ (explicitly beyond 3–4)

- Dogfood **`tabletop-studio`**: migrate `skinRegistry` / layouts to **`SkinProvider`** + published packs (**separate backlog**—not part of Steps 3–4).  
- Additional **`skin-pack-*`** packages (JP 90s, GBC homage, overworld-themed tokens) once the CLI + publish path exist.

---

_Last updated alongside Step 2 RobCo skin pack completion._
