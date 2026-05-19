---
id: migration-v2
title: Migration v1 → v2
description: What changed in v2, what didn't, and how to update.
---

# Migration v1 → v2

**TL;DR:** the runtime API is unchanged. v2 is a toolchain modernization.

## What changed

- **TypeScript-first** — the source is strict TS 6, types ship inside the package, no separate `@types/localize-react`.
- **Dual ESM + CJS** — the `exports` field now publishes both with proper `types` conditions; bundlers and Node 20+ pick the right one automatically.
- **React 18/19 ready** — `react@>=16.8 <20` peer range; tested in CI on Node 20/22/24 × Linux/macOS/Windows.
- **Build & test pipeline** — `tsup` build, `vitest` test runner, `eslint` v9 flat config, `size-limit` budget (< 1 kB brotli), `@arethetypeswrong/cli` types validation, `publint` packaging check.
- **Releases** — Changesets-driven, npm provenance via OIDC trusted publishing, no manual tokens.

## What didn't change

The **runtime API surface is identical**:

| v1                     | v2                     |
| ---------------------- | ---------------------- |
| `LocalizationProvider` | `LocalizationProvider` |
| `useLocalize`          | `useLocalize`          |
| `Message`              | `Message`              |
| `LocalizationContext`  | `LocalizationContext`  |
| `LocalizationConsumer` | `LocalizationConsumer` |

Same props, same signatures, same `{{mustache}}` interpolation, same fallback ordering. If your code compiled against v1, it compiles against v2.

## What broke

A small number of stricter type behaviours under `exactOptionalPropertyTypes: true`:

```diff
-<LocalizationProvider locale={undefined} translations={messages}>
+<LocalizationProvider translations={messages}>
```

Passing `undefined` explicitly is now a type error (it was always a "do you really mean this?" smell). Omit the prop instead.

The peer-dep upper bound now reads `<20`, so installs against React 20+ pre-releases will warn until we test there.

## Upgrade steps

1. **Bump:**
   ```bash
   npm install localize-react@^2 --save
   ```
2. **Re-run typecheck.** If you were passing `locale={undefined}`, remove the prop.
3. **(Optional) Add the typed `useLocalize` helper.** See the **[TypeScript guide](./guides/typescript)** for a 10-line helper that derives a literal-union descriptor type from your translations.

## Reporting issues

If you hit anything unexpected — even a tiny type regression — please file an [issue](https://github.com/yankouskia/localize-react/issues). The runtime is intentionally minimal, so most "weird behaviours" turn out to be quick fixes.
