# localize-react

## 2.0.0

### Minor Changes

- [`f9056b3`](https://github.com/yankouskia/localize-react/commit/f9056b35a2b70cd550c6b54f8e4590d56c75b347) Thanks [@yankouskia](https://github.com/yankouskia)! - Add `createLocalization()` — a zero-runtime, fully type-safe factory.

  Pass your per-locale translations object once and get back typed
  `{ LocalizationProvider, useLocalize, Message }` bindings:
  - Descriptors autocomplete from the actual translation tree
    (`'greeting' | 'cart.summary' | …`).
  - The `values` parameter is shaped by the `{{tokens}}` in the resolved
    template — required when there are any, optional otherwise.
  - The Provider's `locale` prop is typed as the union of seed locales.

  It's a pure compile-time wrapper around the existing exports — no extra
  state, no second cache, +63 bytes brotli. The original
  `LocalizationProvider`, `useLocalize`, and `Message` exports continue to
  work unchanged.

  Also exposes the underlying type utilities for users who want to build
  their own helpers: `TranslationPaths<T>`, `TranslationAt<T, P>`,
  `ExtractTokens<S>`, and the typed-API shapes `TypedTranslate<T>`,
  `TypedLocalizationContextValue<T>`, `TypedLocalizationProviderProps<T>`,
  `TypedMessageProps<T, P>`, `TypedLocalization<T>`.
