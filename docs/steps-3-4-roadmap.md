# Roadmap: Steps 3–4 (after Step 2 skin pack)

This document tracks **release process, publishing order, and consumer migration** for the skin stack (`@bstockwelldev/react-skin-system`, skin packs, and `@bstockwelldev/skin-cli`). For day-to-day usage, start with each package’s **README**.

## Current state (2026)

| Step | Package / artifact | Status |
| --- | --- | --- |
| 1 | [`@bstockwelldev/react-skin-system`](https://github.com/bstockwelldev/react-skin-system) | **`private: false`**, semver **`0.1.x`**. CI: **build / typecheck / test**. Changesets **`release`** workflow publishes when **`NPM_TOKEN`** secret is configured. |
| 2 | Skin packs — RobCo, JP 90s, GBC workshop, Virtual world town | Each repo ships **`SkinDefinition` + `./style.css`**, **`peerDependencies`** on **`@bstockwelldev/react-skin-system@^0.1.0`**. Prefer **npm semver** installs after the runtime hits the registry; refresh **`pnpm-lock.yaml`** locally after publish. |
| 3 | [`@bstockwelldev/skin-cli`](https://github.com/bstockwelldev/skin-cli) | **Shipped**: **`skin-cli init`**, **`add-pack`**, **`bootstrap next`**, **`verify`**, **`--dry-run`**. Separate repo; publish after runtime (and optionally after exemplar packs) for template quality. |
| 4 | **npm + GitHub Actions** | **Changesets** + **`ci.yml` / `release.yml`** per repo. **Publish order:** runtime → skin packs (any order) → CLI (last is optional but recommended after consumers exist). |

**Operational detail for agents / contributors:** root **[`AGENTS.md`](https://github.com/bstockwelldev/react-skin-system/blob/master/AGENTS.md)** and **[`CONTRIBUTING.md`](https://github.com/bstockwelldev/react-skin-system/blob/master/CONTRIBUTING.md)** in each repository.

---

## Step 3 — `@bstockwelldev/skin-cli` *(implemented; spec retained below)*

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

## Step 4 — Private (or scoped public) publishing + CI *(in progress per repo)*

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

## Step 5+ (explicitly beyond initial publish)

- Dogfood **`tabletop-studio`**: migrate `skinRegistry` / layouts to **`SkinProvider`** + published packs (**separate backlog**).  
- Additional **`skin-pack-*`** themes and deeper product integration are **backlog**, not gated on CLI/publish scaffolding.

---

## Appendix — superseded wording

Earlier drafts described the runtime as **`private`** and Steps 3–4 as “not started.” That applied before **`private: false`**, **`skin-cli`**, and Changesets workflows landed. Prefer the **Current state** table above.

---

_Last updated during documentation hygiene / npm prep sweep._
