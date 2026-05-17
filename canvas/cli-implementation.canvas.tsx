import React from 'react';

export default function CLIImplementationCanvas(): JSX.Element {
  const container: React.CSSProperties = {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial',
    color: '#e6eef3',
    background: '#071017',
    padding: 18,
    lineHeight: 1.4,
  };
  const card: React.CSSProperties = {
    background: '#0b1620',
    border: '1px solid rgba(255,255,255,0.04)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  };
  const heading: React.CSSProperties = { fontSize: 16, marginBottom: 8, color: '#9be79b' };
  const code: React.CSSProperties = {
    background: '#051018',
    border: '1px solid rgba(255,255,255,0.03)',
    padding: 8,
    fontFamily: 'monospace',
    fontSize: 12,
    borderRadius: 6,
    overflowX: 'auto',
  };

  return (
    <div style={container}>
      <h2 style={{ color: '#c7f0c7' }}>skin-cli — Implementation Canvas</h2>

      <div style={card}>
        <div style={heading}>Goals</div>
        <ul>
          <li>Provide idempotent host automation for skin registry + bootstrap.</li>
          <li>Enable safe file patches (dry-run/diff preview) and CI-ready workflows.</li>
          <li>Make adoption repeatable across Next.js and Vite hosts.</li>
        </ul>
      </div>

      <div style={card}>
        <div style={heading}>Commands (MVP)</div>
        <ul>
          <li><strong>skin-cli init</strong> — detect host, scaffold registry file and imports.</li>
          <li><strong>skin-cli add-pack &lt;npm-name&gt;</strong> — install pack and append to registry.</li>
          <li><strong>skin-cli bootstrap next</strong> — inject <code>beforeInteractive</code> bootstrap script or print snippet.</li>
          <li><strong>skin-cli verify</strong> — validate registry ids vs bootstrap allowlist; run static checks.</li>
        </ul>

        <div style={{ marginTop: 8, ...code }}>
{`# Examples
skin-cli init --host next --registry-path src/lib/skins/registry.ts
skin-cli add-pack @bstockwelldev/skin-pack-robco-terminal --save
skin-cli bootstrap next --registry src/lib/skins/registry.ts --write --backup
skin-cli verify --registry src/lib/skins/registry.ts --bootstrap-check`}
        </div>
      </div>

      <div style={card}>
        <div style={heading}>UX Flows</div>
        <ol>
          <li>Detect host → choose target files → present dry-run summary.</li>
          <li>User reviews diff preview (unified diff) → accept to write files.</li>
          <li>On conflicts, show conflict details and provide manual resolution suggestions.</li>
        </ol>
        <div style={{ marginTop: 8 }}>
          <strong>Conflict resolution</strong>: back up files to <code>.skin-cli-backups/</code>, produce guidance, and open PR suggestion.
        </div>
      </div>

      <div style={card}>
        <div style={heading}>File patches & target paths</div>
        <ul>
          <li><code>src/lib/skins/registry.ts</code> — generated registry module (imports packs + createSkinRegistry).</li>
          <li><code>app/layout.tsx</code> — optional snippet insertion for <code>buildSkinBootstrapScript</code> (beforeInteractive).</li>
          <li>Global CSS import (e.g., <code>app/globals.css</code>) — <code>@import '&lt;pack&gt;/style.css'</code>.</li>
        </ul>

        <div style={{ marginTop: 8, ...code }}>
{`// Generated: src/lib/skins/registry.ts (example)
import { createSkinRegistry } from '@bstockwelldev/react-skin-system';
import { robcoTerminalSkin } from '@bstockwelldev/skin-pack-robco-terminal';
import { jp90sParkSystemSkin } from '@bstockwelldev/skin-pack-jp-90s-park-system';

export const registry = createSkinRegistry([robcoTerminalSkin, jp90sParkSystemSkin], {
  storageKey: 'tabletop-studio-skin',
  defaultSkin: 'tabletop-default',
});`}
        </div>
      </div>

      <div style={card}>
        <div style={heading}>CI checks & Tests</div>
        <ul>
          <li>Run Unit tests (vitest) and typecheck (tsc).</li>
          <li>Run `pnpm changeset status` and `pnpm changeset version` locally in dry-run mode.</li>
          <li>Add fixture apps (minimal Next/Vite) under <code>__fixtures__/next</code> and <code>__fixtures__/vite</code> to validate patches.</li>
        </ul>
      </div>

      <div style={card}>
        <div style={heading}>Security & Permissions</div>
        <ul>
          <li>NPM publish requires <code>NPM_TOKEN</code> in GitHub secrets.</li>
          <li>Changesets release workflow will use GitHub Actions with NPM token to publish.</li>
          <li>Ensure PRs are reviewed before merging; CLI should never auto-publish.</li>
        </ul>
      </div>

      <div style={card}>
        <div style={heading}>Release flow (Changesets)</div>
        <ol>
          <li>Create changeset for package(s) (patch).</li>
          <li>Open release PR (changesets creates changelog/versions).</li>
          <li>Merge PR → Actions run Release workflow → publish to npm.</li>
        </ol>
      </div>

      <div style={card}>
        <div style={heading}>Timeline & estimates</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, marginBottom: 6 }}>Phases</div>
            <ul>
              <li>Design & spec: 1 day</li>
              <li>Core CLI (init/add-pack/bootstrap/verify): 2–3 days</li>
              <li>Fixtures & tests: 1 day</li>
              <li>CI & release automation: 1 day</li>
            </ul>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, marginBottom: 6 }}>Simple timeline</div>
            <div style={{ height: 80, display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <div style={{ flex: 1, background: '#2d5030', height: 20, borderRadius: 4, textAlign: 'center' }}>Design</div>
              <div style={{ flex: 1, background: '#3a7a44', height: 60, borderRadius: 4, textAlign: 'center' }}>Core CLI</div>
              <div style={{ flex: 1, background: '#2d5030', height: 30, borderRadius: 4, textAlign: 'center' }}>Fixtures</div>
              <div style={{ flex: 1, background: '#264433', height: 20, borderRadius: 4, textAlign: 'center' }}>CI/Release</div>
            </div>
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={heading}>Prioritized TODO</div>
        <ol>
          <li>Create CLI repo scaffold and core command handlers (init, add-pack, bootstrap, verify).</li>
          <li>Implement dry-run & unified diff preview renderer (text + optional HTML).</li>
          <li>Create Next/Vite fixture apps and end-to-end tests for patching.</li>
          <li>Add linting, CI checks, and Changesets publishing flow (already scaffolded).</li>
          <li>Document usage and migration guide referencing:
            <ul>
              <li><code>react-skin-system/</code></li>
              <li><code>skin-pack-robco-terminal/</code></li>
              <li><code>skin-pack-jp-90s-park-system/</code></li>
              <li><code>skin-pack-gbc-pocket-workshop/</code></li>
              <li><code>skin-pack-virtual-world-town/</code></li>
            </ul>
          </li>
        </ol>
      </div>

    </div>
  );
}

