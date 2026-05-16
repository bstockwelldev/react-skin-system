# @bstockwelldev/react-skin-system

React runtime for **`html[data-skin]`** themed UIs—registry validation, **`localStorage`** persistence, optional **boot intro overlay**, and **skin cycling**.

- **Framework-agnostic styling**: CSS tokens/selectors (`:root[data-skin="…"]` or `html[data-skin="…"]`) remain **host-owned**.
- **No Tailwind/shadcn peers** — keep adapters in your application.
- **Next.js-ready**: optional **`buildSkinBootstrapScript`** helper for **`beforeInteractive`** inline scripts.

## Install (local workspace / unpublished)

Until a registry workflow lands, consume via **exact path**:

```bash
pnpm add @bstockwelldev/react-skin-system@file:../react-skin-system
```

## Quick start — define skins

Skins are plain objects validated by **`createSkinRegistry`**.

```ts
import {
  createSkinRegistry,
  type SkinDefinition,
} from '@bstockwelldev/react-skin-system';

export const SAMPLE_SKINS: SkinDefinition<'default' | 'ocean'>[] = [
  {
    id: 'default',
    label: 'Default',
    bootIntroLines: ['BOOT> Welcome', 'Applying theme…'],
  },
  {
    id: 'ocean',
    label: 'Ocean terminal',
    cycle: false,
    paletteFlavor: {
      prompt: 'DEEP>',
      placeholder: 'command…',
      welcome: 'Submerged console nominal.',
    },
  },
];

export function makeRegistry() {
  return createSkinRegistry(SAMPLE_SKINS, {
    storageKey: 'my-app/skin',
    defaultSkin: 'default',
    // Optional explicit cycling order — defaults from defs excluding `cycle: false`.
    cycle: ['default'],
  });
}
```

## React provider

Wrap your tree once (typically next to routing / modal providers).

```tsx
'use client';

import { SkinProvider, makeRegistry } from './skins';

const registry = makeRegistry();

export function Providers({ children }: { children: React.ReactNode }) {
  return <SkinProvider registry={registry}>{children}</SkinProvider>;
}
```

### **`useSkin()`**

```tsx
'use client';

import { useSkin } from '@bstockwelldev/react-skin-system';

export function CycleButton() {
  const { skin, setSkin, cycleSkin, paletteFlavor, needsBootIntro } = useSkin();
  void paletteFlavor;
  void needsBootIntro;

  return (
    <>
      <p>Active skin: {skin}</p>
      <button type="button" onClick={() => cycleSkin()}>
        Next skin in cycle
      </button>
      <button type="button" onClick={() => setSkin('ocean', { withBoot: false })}>
        Jump to Ocean (skip boot ledger)
      </button>
    </>
  );
}
```

## Next.js App Router bootstrap (optional)

Hydration flicker avoidance: stamp **`document.documentElement`** (`data-skin`) **before** React paints.

```tsx
/* app/layout.tsx */
import Script from 'next/script';
import { SkinProvider } from '@bstockwelldev/react-skin-system';
import { buildSkinBootstrapScript } from '@bstockwelldev/react-skin-system/next';

import { makeRegistry } from './skins';

const registry = makeRegistry();
const BOOTSTRAP_SCRIPT = buildSkinBootstrapScript(registry);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="skin-bootstrap" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: BOOTSTRAP_SCRIPT }} />
      </head>
      <body>
        <SkinProvider registry={registry}>{children}</SkinProvider>
      </body>
    </html>
  );
}
```

> **Integrity:** regenerate this script whenever the registry **`ids`** / **`storageKey`** change so allowlists cannot drift between layout + runtime helpers.

## Vite + React SPA

Either:

1. **Inline** the bootstrap helper in **`index.html`** (`<script>` ahead of `<body>`), _or_
2. Mount **`SkinProvider`** immediately and accept a single paint with default styling before **`useEffect`** syncs **`data-skin`**.

Minimal pattern:

```tsx
// main.tsx
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { SkinProvider } from '@bstockwelldev/react-skin-system';
import { App } from './App';
import { makeRegistry } from './skins';

const registry = makeRegistry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SkinProvider registry={registry}>
      <App />
    </SkinProvider>
  </StrictMode>,
);
```

Embed `buildSkinBootstrapScript(registry)` manually in `index.html` if CLS/flicker matters.

## Styling contracts (host-owned)

Define CSS under `html[data-skin="YOUR_ID"]` (or `:root`). Example stub:

```css
html[data-skin='default'] {
  color-scheme: light;
}

html[data-skin='ocean'] {
  color-scheme: dark;
}

/* Map app tokens consumed by overlays / chrome */
```

Ship branding + motion classes via **`SkinBootOverlay`** **`classNames`** prop if Tailwind/CSS modules are unavailable in the standalone package defaults.

## API surface (Step 1)

| Export | Responsibility |
| --- | --- |
| **`createSkinRegistry`** | Validate defs, **`ids`**, **`cycle`**, defaults, **`valid`** set |
| **`parseStoredSkin`** | Parse persisted string + fallback **`defaultSkin`** |
| **`nextSkinInCycle`** | Deterministic **`cycle`** traversal |
| **`skinNeedsBootIntro`** | Honors **`bootIntroLines`** |
| **`applySkinDom`** | Apply **`data-skin`** + (**optional**) **`localStorage`** persistence |
| **`SkinProvider`** / **`useSkin`** | React reconciliation + accessibility hooks |
| **`SkinBootOverlay`** | Focus trap + **`aria-modal`** ledger |
| **`buildSkinBootstrapScript`** (**`…/next`**) | Embed storage key + **`ids`** + **`default`** for early hydration |

Step 2+ (out of scope here): theme packs (`@bstockwelldev/skin-pack-*`), install CLI, private registry publishes, app dogfooding.

## Development

```bash
pnpm install
pnpm run build
pnpm run typecheck
pnpm run test
```

## License

MIT — see **`LICENSE`**.
