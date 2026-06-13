---
'localize-react': minor
---

Give each `<LocalizationProvider>` its own translation cache.

The memo cache used to be a single module-scoped object shared by every
provider in the app. Two providers (or two `createLocalization()`
factories) mounting different translation trees under the same descriptor
could serve each other stale strings within a single render pass — and
with `<RichMessage />`, a poisoned template silently dropped the entire
`{{token}}` substitution step.

The cache is now closure-scoped per `memoize()` wrapper. Each provider
owns an independent cache that is rebuilt — and the old one discarded —
whenever `locale` or `translations` change. Two providers never share
entries. The previous `clearCache()` + cache-clearing `useEffect` are
gone (they were never part of the public API), so this also removes one
effect and shrinks the bundle.

Single-provider apps see identical output. Multi-provider and
multi-factory apps are now correct without needing `disableCache`.
