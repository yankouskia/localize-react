---
'localize-react': minor
---

Add `<RichMessage />` — a Message variant whose `values` can include React nodes.

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
