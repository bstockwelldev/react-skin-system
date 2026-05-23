# Contributing

Thank you for helping improve **@bstockwelldev/react-skin-system**.

## Prerequisites

- **Node.js** 20+
- **pnpm** (`corepack enable` recommended)

## Local checks

```bash
pnpm install
pnpm run build
pnpm run typecheck
pnpm run test
```

## Releases

This repo versions with [**Changesets**](https://github.com/changesets/changesets):

1. After your change: `pnpm dlx @changesets/cli add` (or `pnpm exec changeset`).
2. Open a PR with the `.changeset` file and implementation.
3. Merge the **Version Packages** PR from the Changesets workflow when ready to publish.

**Publish `@bstockwelldev/react-skin-system` before** consumers that semver-depend on it (skin packs, host apps).

## Security

See [`SECURITY.md`](SECURITY.md).

## Questions

Prefer [GitHub Issues](https://github.com/bstockwelldev/react-skin-system/issues) or [Discussions](https://github.com/bstockwelldev/react-skin-system/discussions) for design questions before large refactors.
