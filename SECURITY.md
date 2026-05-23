# Security policy

## Supported versions

We address security fixes on the latest **semver minor** released on npm for `@bstockwelldev/react-skin-system` (see [releases](https://github.com/bstockwelldev/react-skin-system/releases)).

## Reporting a vulnerability

Please **do not** open a public issue for undisclosed security bugs.

- Use [GitHub private vulnerability reporting](https://github.com/bstockwelldev/react-skin-system/security/advisories/new) for this repository, **or**
- Email the maintainer with subject line `SECURITY: react-skin-system`.

Include reproduction steps, impact assessment, and any suggested fix when possible.

## Scope notes

This package orchestrates **`data-skin`**, **`localStorage`**, and bootstrap inline scripts on the host page. Threat models should assume the host integrates these APIs in fully trusted UI; CSP and script injection policies remain the responsibility of the embedding application.
