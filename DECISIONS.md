# Architecture Decision Records

Lightweight ADRs for the 2026 modernization. One section per decision; format
is: **Context → Decision → Alternatives considered → Consequences**.

---

## ADR-001 — Use pnpm as the package manager

**Context.** Repo shipped with `yarn.lock` (Yarn Classic). Yarn Classic is in
maintenance mode and `node_modules` hoisting masks dependency leaks. We need a
fast, strict, modern manager for the new toolchain.

**Decision.** pnpm 9.x, pinned via `packageManager` and consumed through
corepack. Old `yarn.lock` is deleted; a fresh `pnpm-lock.yaml` is committed.

**Alternatives considered.**

- _npm 11._ Works, lockfile is fine, but slower installs and no symlinked
  store — not a strong reason against, just no upside over pnpm.
- _Yarn Berry (PnP)._ Strong story but tooling-hostile for a library that
  consumers don't see this side of. Overkill.

**Consequences.** Contributors need corepack (built into Node ≥ 16.10). The
README install snippet shows all three managers for end users — `pnpm` is
only the contributor-side choice.

---

## ADR-002 — TypeScript-first source with dual ESM + CJS publish

**Context.** Source today is hand-written ES2015 JS bundled to UMD with a
separate hand-maintained `index.d.ts`. Modern consumers (Vite, Next.js, Remix,
Bun, Deno-via-npm) want ESM with proper subpath exports; older CJS consumers
still exist.

**Decision.** Source is TypeScript. Build is `tsup` producing ESM (`.mjs`) +
CJS (`.cjs`) + a single `.d.ts` set, exposed through an `exports` map with
`import`/`require`/`types` conditions. `sideEffects: false` for tree-shaking.

**Alternatives considered.**

- _ESM-only._ Cleaner story long-term but breaks every CJS consumer in one
  shot; not worth the ecosystem pain for a library this small.
- _`tsc` project references._ Fine for pure-TS-consumers libraries but doesn't
  emit dual outputs without a second tool.
- _unbuild / rollup-plugin-dts._ Both viable; tsup is the smallest mental
  model for the job and is what most maintained libs in this niche use today.

**Consequences.** `package.json` becomes ~25 lines longer (the `exports` map).
We add `@arethetypeswrong/cli` and `publint` to CI to catch publish-shape
regressions.

---

## ADR-003 — Vitest replaces Jest

**Context.** Test suite uses Jest 24 (2019). Jest 30 works on Node 24 but
needs Babel for JSX, has slower watch mode, and requires an extra layer for
TS in ESM.

**Decision.** Vitest 2.x with jsdom + `@testing-library/react`. Coverage via
`@vitest/coverage-v8`. Hard threshold ≥ 90% lines/functions/branches.

**Alternatives considered.**

- _Jest 30._ Workable, but adds Babel and `ts-jest` cost for no benefit.
- _Node's built-in test runner._ Lacks first-class React/jsdom story.

**Consequences.** Snapshot tests are rewritten as explicit DOM assertions —
better signal, no more "why did this snapshot change" PR reviews.

---

## ADR-004 — ESLint v9 flat config + Prettier, not Biome

**Context.** Need lint + format. Biome is a single fast tool; ESLint v9 +
Prettier is the conventional choice with the deepest React/TS rule
ecosystem.

**Decision.** ESLint v9 flat config with `typescript-eslint` v8,
`eslint-plugin-react`, `eslint-plugin-react-hooks`,
`eslint-plugin-react-refresh` (skipped — not a dev server),
`eslint-plugin-unicorn`, `eslint-plugin-import-x`, `eslint-plugin-n`,
`eslint-plugin-promise`. Prettier 3 handles formatting.

**Alternatives considered.**

- _Biome._ Excellent and fast, but its React-specific lint rules are still
  narrower than the typescript-eslint + react-hooks combination — and a
  library where the public API is a React hook should not skimp on hook
  linting.

**Consequences.** Two tools to install vs one. Acceptable.

---

## ADR-005 — Changesets for versioning + npm trusted publishing

**Context.** Today: manual `npm publish` against a single maintainer's token.
That token is long-lived and there's a leaked Codecov token in `package.json`
(separate issue, tracked in `MIGRATION_PLAN.md`).

**Decision.** `@changesets/cli` for changelog + version bumps; GitHub Actions
release workflow uses npm's trusted publishing (OIDC) so no long-lived
`NPM_TOKEN` lives in repo secrets. Provenance attestation enabled via
`publishConfig.provenance: true`.

**Alternatives considered.**

- _semantic-release._ Heavier, opinionated, harder to override per release.
- _Manual publish (status quo)._ Doesn't meet the brief.

**Consequences.** Contributors must add a changeset (`pnpm changeset`) when
they touch shipped code; CI fails otherwise on PRs that change `src/`.

---

## ADR-006 — TypeDoc on GitHub Pages, no fuller docs site

**Context.** Library has 5 exported symbols and one ~300-line README. A
Docusaurus/Starlight/VitePress site would be net negative — more to maintain,
fewer pages than the navigation.

**Decision.** TypeDoc generates a static API reference; `docs.yml` deploys it
to GitHub Pages on push to `main`. README stays canonical for prose.

**Alternatives considered.** Listed above; rejected for size.

**Consequences.** If the package grows guides/concepts later, swap in
Starlight. The TypeDoc output URL doesn't need to change at that point.

---

## ADR-007 — Drop the UMD bundle

**Context.** The 1.x package only ships UMD. UMD existed for `<script>` tag
loading. Today, anyone using a CDN should use `esm.sh`, `unpkg`, or
`jsdelivr`, which can serve the ESM output directly.

**Decision.** Drop UMD. Ship ESM + CJS only.

**Alternatives considered.** Keep UMD for the small fraction of consumers
loading from a `<script>` tag. Cost: another build output, a `globals`
config, and a second name-collision surface.

**Consequences.** Documented in `BREAKING_CHANGES.md` for v2. Users on a
script tag can switch to `<script type="module" src="https://esm.sh/localize-react@2"></script>`.

---

## ADR-008 — Keep module-level translation cache (don't refactor)

> **Superseded by ADR-009 (v2.2).** The per-provider cache shipped after all.

**Context.** `helpers.ts` keeps a single module-scoped `TRANSLATION_CACHE`.
Two `<LocalizationProvider>`s in the same app share it. This is a latent bug
(switching locales in one provider can serve stale strings to the other)
but it's been shipped behaviour for 7 years.

**Decision.** Preserve the existing behaviour for v2.0. Document the
limitation in `KNOWN_ISSUES.md` and leave a `[[per-provider-cache]]` issue
hook for v3.

**Alternatives considered.** Move the cache into the provider's `useRef`.
Cleaner, but visibly changes timing in edge cases (two providers, same
key, different translations). That's a behavioural breaking change with no
upgrade path other than "test your app". Not worth bundling into a release
otherwise dominated by toolchain work.

---

## ADR-009 — Per-provider translation cache (supersedes ADR-008)

**Context.** ADR-008 deferred the module-scoped-cache fix to "v3". But the
typed `createLocalization()` factory (v2.0) actively encourages mounting
more than one translation tree in the same app — feature-scoped factories
are the intended pattern — and `<RichMessage />` (v2.1) makes the failure
mode worse: when the shared cache returns the wrong template, the entire
`{{token}}` substitution step silently becomes a no-op. Two adversarial
reviews independently reproduced the cross-contamination. The "latent bug
nobody hits" assumption no longer holds.

**Decision.** Give each `memoize()` wrapper its own closure-scoped cache.
The provider already rebuilds the wrapper via `useMemo([disableCache,
pureTranslations])` whenever `locale`/`translations` change, so wrapper
rebuild _is_ cache invalidation — the separate module-level
`clearCache()` + `useEffect` are deleted. Net effect: two providers never
share entries, and the bundle shrinks (one fewer export, one fewer effect).

**Alternatives considered.**

- _Namespace the module cache by a provider id._ Keeps a global object
  alive for the app's lifetime (a slow leak) and needs an id-generation
  scheme. The closure approach gets correct lifetimes for free — the cache
  dies with the provider.
- _`useRef` cache._ Equivalent lifetime, but the cache would then have to
  be threaded into `memoize`; the closure already captures it cleanly.

**Consequences.** Removes `clearCache` from the internal surface (it was
never part of the public API). Tests that relied on a global reset between
cases no longer need it — unmounting a provider discards its cache. The
documented "shared cache" caveat is removed from the FAQ, the type-safe-API
guide, and the `<RichMessage />` recipe. This is a behavioural fix, not a
breaking API change: single-provider apps see identical output.
