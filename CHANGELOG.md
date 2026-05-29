# localize-react

## 2.1.0

### Minor Changes

- [`908c9ae`](https://github.com/yankouskia/localize-react/commit/908c9ae9db7468e80b97f8f462d0d570bfb91f6a) Thanks [@yankouskia](https://github.com/yankouskia)! - Add `<RichMessage />` — a Message variant whose `values` can include React nodes.

  `<Message />` returns a `string` and only accepts `string | number`, which
  means a sentence with an inline link, button, or formatted span has to
  be split across JSX — and stops translating cleanly when a target
  language puts the wrapped piece somewhere else in the sentence.

  `<RichMessage />` returns `ReactNode`, so a single translation can host
  inline rich content:

  ```tsx
  // en: 'By signing up, you agree to our {{link}}.'
  // de: 'Mit der Anmeldung stimmen Sie unseren {{link}} zu.'
  <RichMessage
    descriptor="signup.terms"
    values={{ link: <a href="/terms">Terms of Service</a> }}
  />
  ```

  The link lands wherever the translator put `{{link}}`. String/number
  values are still coerced and rendered as text, matching `<Message />`.

  Same `{{name}}` template grammar, same descriptor lookup, same
  fallback semantics. The implementation walks the resolved template once
  and wraps each part in a keyed `<Fragment />`, so re-using a single
  React element across multiple occurrences of the same token does not
  produce duplicate-key warnings.

  `createLocalization()` now exposes `RichMessage` alongside `Message`,
  with the same descriptor narrowing — the only difference is that
  `values` accepts `string | number | ReactNode` at every token slot.

  Also exports the underlying helper `buildRichTranslation(template,
values)` so callers can produce the parts array themselves (useful
  when joining, splitting across DOM boundaries, or feeding to a
  non-Fragment renderer), plus the public types `RichMessageProps`,
  `RichTemplateValues`, and `TypedRichMessageProps<T, P>`.

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
