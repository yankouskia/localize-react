# Contributing to `localize-react`

Thanks for your interest. The repo is small enough that one PR can move the
needle — there's no big-rewrite-in-progress, so almost everything is fair
game.

## Setup

```sh
# Node and pnpm versions are pinned via .nvmrc and packageManager.
corepack enable
nvm use            # or fnm use / asdf install — anything that reads .nvmrc
pnpm install
```

The first install also bootstraps the pre-commit hook (lint + format on
staged files via `simple-git-hooks` + `lint-staged`).

## Scripts

| Script               | What it does                                                |
| -------------------- | ----------------------------------------------------------- |
| `pnpm dev`           | tsup in watch mode — rebuilds `dist/` on save.              |
| `pnpm build`         | Production build (ESM + CJS + `.d.ts` + sourcemaps).        |
| `pnpm typecheck`     | `tsc --noEmit` against the strict config.                   |
| `pnpm lint`          | ESLint v9 flat config.                                      |
| `pnpm lint:fix`      | Same, with autofix.                                         |
| `pnpm format`        | Prettier 3.                                                 |
| `pnpm test`          | Vitest in interactive watch.                                |
| `pnpm test run`      | Single Vitest run.                                          |
| `pnpm test:coverage` | Vitest with v8 coverage (thresholds enforced at 90%).       |
| `pnpm docs`          | Generate the TypeDoc API site into `docs/api`.              |
| `pnpm size`          | size-limit budget check (ESM ≤ 2 kB, CJS ≤ 2.5 kB, brotli). |
| `pnpm clean`         | Wipe `dist/`, `coverage/`, `.tsbuildinfo`.                  |

## Before opening a PR

1. `pnpm typecheck && pnpm lint && pnpm test run && pnpm build` is green.
2. New behaviour has a test; bug fixes have a regression test.
3. If shipped behaviour changed, add a changeset:

   ```sh
   pnpm changeset
   ```

   Pick the smallest bump that's correct (`patch` for fixes, `minor` for
   non-breaking additions, `major` for breaking changes — and update
   `BREAKING_CHANGES.md` if so).

4. Commits follow [Conventional Commits](https://www.conventionalcommits.org/)
   (`feat:`, `fix:`, `docs:`, `chore:`, `ci:`, `build:`, `refactor:`,
   `test:`, `deps:`). One logical change per commit.

## Release flow

Maintainers don't `npm publish` from a laptop — pushes to `main` are
handled by `.github/workflows/release.yml`:

1. As changesets land on `main`, the workflow opens a "Version Packages"
   PR that bumps `package.json` and updates `CHANGELOG.md` from the
   pending changesets.
2. When that PR merges, the workflow publishes to npm via **trusted
   publishing** (OIDC — no long-lived `NPM_TOKEN` in repo secrets) with
   provenance attestation enabled.

If something blocks the automation (e.g. registry outage), the manual
fallback is:

```sh
pnpm install
pnpm changeset version    # consume changesets, bump version, update changelog
pnpm install               # refresh lockfile
git commit -am "chore(release): version packages"
pnpm release               # changeset publish
git push --follow-tags
```

But this should be rare.

## Code of conduct

This project follows the [Contributor Covenant 2.1](./CODE_OF_CONDUCT.md).
Be kind, assume good intent, and give people a chance to fix their work.
