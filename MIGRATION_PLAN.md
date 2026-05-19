# `localize-react` — Modernization Plan

## What this package does

`localize-react` is a tiny (≈ 740 B gzipped) React i18n library built on the
Context API and hooks. It exposes a `LocalizationProvider`, a
`LocalizationConsumer`, a `LocalizationContext`, a `useLocalize` hook, and a
`<Message />` component. Translations are looked up by key (with dot-notation
nested keys), optionally interpolated with `{{name}}`-style mustaches, with an
opt-out runtime cache and a `defaultMessage` fallback. Locale strings are
normalized (`En-US` → `en_us` → `en`) when looking up the translations map.

Public surface (frozen — must remain compatible across this migration):

```ts
import {
  LocalizationContext,
  LocalizationConsumer,
  LocalizationProvider, // props: { locale?, translations, disableCache?, children }
  useLocalize, // () => { locale, translate, translations }
  Message, // props: { descriptor, values?, defaultMessage? }
} from 'localize-react';
```

## Phase 0 — Current state snapshot (2026-05-19)

| Aspect                             | Current                                                                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Last release                       | `1.7.1` (Jul 2020)                                                                                                                   |
| Node engines                       | _unspecified_ (CI ran on `node:12.2.0-alpine`)                                                                                       |
| Language                           | ES2015 `.js` + JSX, hand-written `index.d.ts`                                                                                        |
| Module system                      | Single UMD bundle (`dist/localize-react.js`, minified, no source maps)                                                               |
| Build                              | Rollup 1 + babel 7 + uglify + auto-external                                                                                          |
| Tests                              | Jest 24, snapshot-heavy, ran via babel-jest                                                                                          |
| Lint / format                      | None                                                                                                                                 |
| CI                                 | CircleCI 2.0, `node:12.2.0-alpine`, only runs coverage + codecov upload                                                              |
| Release                            | Manual `npm publish`                                                                                                                 |
| Docs                               | Long handwritten README, no generated reference                                                                                      |
| Dependencies                       | 16 devDeps, all on majors 1–8 of various toolchains; **multiple known CVEs** outstanding (14 open Dependabot branches on the remote) |
| Coverage claim                     | README says 100%; not verifiable today                                                                                               |
| Baseline `yarn install` on Node 24 | **fails** — `fsevents@1`/`nan` can't compile against V8 12                                                                           |

### Risk register

| #   | Risk                                                                                                                      | Mitigation                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| R1  | Breaking public API for users on `1.x`                                                                                    | Freeze the surface listed above; if a behavioural change is unavoidable, document in `BREAKING_CHANGES.md` and bump major.        |
| R2  | React 16/17 consumers still depend on the library                                                                         | Set `peerDependencies.react` to `>=16.8.0` (unchanged) and test against React 18 + 19 in CI. Don't import any React 19-only APIs. |
| R3  | Cache is module-level (shared across all providers)                                                                       | Existing behaviour — keep it (`disableCache`-aware) and document as a known limitation in `KNOWN_ISSUES.md` if confirmed.         |
| R4  | `transformToPairs` regex builds `new RegExp(template, 'gi')` from user input — possible ReDoS / injection                 | Switch to a non-regex replace pass during the TS port.                                                                            |
| R5  | `Provider.test` snapshot tests are coupled to internal render output                                                      | Replace snapshots with explicit DOM assertions while porting to Vitest + RTL.                                                     |
| R6  | `npm publish` is keyed to a single maintainer with a long-lived token (codecov token is even committed to `package.json`) | Move to OIDC trusted publishing via Changesets + GitHub Actions. Flag the leaked token.                                           |
| R7  | UMD-only build breaks ESM tree-shaking and modern bundlers                                                                | Ship dual ESM + CJS + `.d.ts` via tsup with a proper `exports` map.                                                               |

### Anomalies worth flagging now (R6 expanded)

`package.json:35` contains a **hard-coded Codecov upload token**
(`8365e97e-7298-4a00-ad32-740d44db89e5`). Codecov v3 upload tokens are
project-scoped, not account-scoped, but it still belongs in CI secrets, not
git. Removed during Phase 6; no history rewrite attempted without explicit
sign-off (see Operating Principle 7 / Phase 8).

`rollup.config.js:17` does
`replace({ NODE_ENV: process.env.API_KEY })` — a dead/wrong line copy-pasted
from a template. Will not survive the rewrite.

## Target state

| Aspect          | Target                                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Node engines    | `>=20.19.0` (active LTS); CI matrix `20`, `22`, `24` × `ubuntu-latest`, `macos-latest`, `windows-latest`                                               |
| Language        | TypeScript 5.x, `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + `verbatimModuleSyntax`                                          |
| Module system   | Dual ESM + CJS via `exports` map, with proper `types` conditions; `publint` + `attw` clean                                                             |
| Build           | `tsup` (esbuild under the hood) — ESM, CJS, `.d.ts`, source maps, `.d.ts.map`                                                                          |
| Tests           | Vitest + `@testing-library/react`, jsdom env, explicit DOM assertions, `expectTypeOf` for type tests, coverage thresholds ≥ 90%                        |
| Lint / format   | ESLint v9 flat config (`typescript-eslint` v8, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `unicorn`, `import-x`, `n`, `promise`) + Prettier 3 |
| CI              | GitHub Actions: `ci.yml`, `release.yml` (Changesets + npm provenance), `codeql.yml`, `docs.yml`                                                        |
| Release         | Changesets, npm provenance, automated by GitHub Actions                                                                                                |
| Docs            | Rewritten README + TypeDoc-generated API site published to GitHub Pages                                                                                |
| Dependencies    | Renovate config, all majors current, zero high/critical CVEs                                                                                           |
| Package manager | pnpm (pinned via `packageManager` + corepack)                                                                                                          |

## Phase-by-phase plan

1. **Phase 0 — Reconnaissance** _(this document)._ Commit baseline + plan. ✅
2. **Phase 1 — Foundation.** New `package.json`, `tsconfig*.json`, `.nvmrc`,
   `.node-version`, browserslist; install pnpm-managed toolchain; wire up
   `exports` map (publish layout only — real source comes in Phase 3).
3. **Phase 2 — Dependencies.** Remove every dep from the 2019 stack; install
   modern equivalents (TypeScript, tsup, Vitest, ESLint v9, Prettier,
   Changesets, TypeDoc, `@arethetypeswrong/cli`, `publint`, `size-limit`).
4. **Phase 3 — Code modernization.** Port `src/*.js → src/*.{ts,tsx}` with
   strict types and generics over `translations`. Drop snapshot-coupled
   helpers; replace `new RegExp(userInput)` with safe string replacement.
   Public API stays identical.
5. **Phase 4 — Tooling.** ESLint flat config; Prettier; `tsup.config.ts`;
   `simple-git-hooks` + `lint-staged`; standard `package.json` scripts.
6. **Phase 5 — Testing.** Rewrite each test file using Vitest + RTL;
   replace snapshot assertions with explicit ones; add `expectTypeOf` tests;
   set coverage thresholds.
7. **Phase 6 — CI/CD.** Delete CircleCI; add GH Actions matrix, Changesets
   release workflow with OIDC provenance, CodeQL, Pages deploy for docs.
8. **Phase 7 — Documentation.** Rewrite README; generate TypeDoc; add
   `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `CHANGELOG.md`,
   `.github/` templates.
9. **Phase 8 — Hygiene.** Refresh `.gitignore`/`.gitattributes`, LICENSE
   year, `CODEOWNERS`, `size-limit`, `examples/` directory, scratch-project
   install verification (ESM, CJS, TS-strict, Node 20 + Node 24).
10. **Phase 9 — Final verification.** Run the full suite end-to-end; write
    final summary.

Every phase ends with `pnpm install && pnpm typecheck && pnpm lint && pnpm test && pnpm build` green before committing the phase. Checkboxes below are updated as each phase completes.

## Progress

- [x] Phase 0 — Reconnaissance & plan
- [ ] Phase 1 — Foundation
- [ ] Phase 2 — Dependencies
- [ ] Phase 3 — Code modernization
- [ ] Phase 4 — Tooling
- [ ] Phase 5 — Testing
- [ ] Phase 6 — CI/CD
- [ ] Phase 7 — Documentation
- [ ] Phase 8 — Hygiene
- [ ] Phase 9 — Final verification

## Deferred / out of scope

These are explicitly **not** in this migration; documented here so the
maintainer can decide later:

- **Renaming the package** (`localize-react` is already taken on npm by us).
- **Removing the module-level cache** in favour of per-provider cache.
  Behavioural change; deferred to v3 unless the maintainer says otherwise.
- **History rewrite to scrub the committed Codecov token.** Codecov upload
  tokens are low-blast-radius; rewriting public history needs maintainer
  sign-off. Token will be removed from `HEAD` and rotated in Phase 6.
- **Stryker mutation testing**, **browser test environment with Playwright**,
  and a **separate Docusaurus/Starlight site**. For a 4-file library these
  are over-investment; TypeDoc on Pages is enough. Logged in `DECISIONS.md`.
