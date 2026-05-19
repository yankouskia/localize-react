import { describe, expect, it, vi } from 'vitest';

import {
  buildTranslation,
  clearCache,
  memoize,
  NO_TEMPLATE_VALUE_MESSAGE,
  NO_TRANSLATION_WARNING_MESSAGE,
  PARSE_TEMPLATE_REGEXP,
  sanitizeLocale,
  transformToPairs,
} from './helpers.js';

describe('sanitizeLocale', () => {
  it('returns null when no locale is supplied', () => {
    expect(sanitizeLocale(undefined, {})).toBeNull();
  });

  it('returns the input as-is when the translations map has an exact key', () => {
    expect(sanitizeLocale('En-uS', { 'En-uS': { name: 'Alex' } })).toBe(
      'En-uS',
    );
  });

  it('falls back to lowercase + underscore form', () => {
    expect(sanitizeLocale('En-cA', { en_ca: { name: 'Alex' } })).toBe('en_ca');
  });

  it('falls back to the leading segment when the long locale is unknown', () => {
    expect(sanitizeLocale('En-Fr', { en: { name: 'Alex' } })).toBe('en');
  });

  it('warns and returns the original locale when nothing matches', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(sanitizeLocale('FR-CA', { en: { name: 'Alex' } })).toBe('FR-CA');
    expect(warn).toHaveBeenCalledWith(NO_TRANSLATION_WARNING_MESSAGE, 'FR-CA');
  });

  it('treats a leaf string at the locale key as a miss', () => {
    expect(sanitizeLocale('en', { en: 'not an object' })).toBe('en');
  });
});

describe('memoize / clearCache', () => {
  it('caches by descriptor + values + defaultMessage', () => {
    const inner = vi.fn<
      (
        descriptor: string,
        values?: Record<string, string | number>,
        defaultMessage?: string,
      ) => string
    >((descriptor) => `out:${descriptor}`);
    const memoized = memoize(inner);

    expect(memoized('a')).toBe('out:a');
    expect(memoized('a')).toBe('out:a');
    expect(inner).toHaveBeenCalledTimes(1);

    memoized('a', { x: 1 });
    expect(inner).toHaveBeenCalledTimes(2);

    memoized('a', { x: 1 });
    expect(inner).toHaveBeenCalledTimes(2);
  });

  it('clearCache invalidates entries', () => {
    const inner = vi.fn<
      (
        descriptor: string,
        values?: Record<string, string | number>,
        defaultMessage?: string,
      ) => string
    >((descriptor) => `out:${descriptor}`);
    const memoized = memoize(inner);

    memoized('a');
    clearCache();
    memoized('a');

    expect(inner).toHaveBeenCalledTimes(2);
  });

  it('defaults defaultMessage to empty string in the cache key', () => {
    const inner = vi.fn<
      (
        descriptor: string,
        values?: Record<string, string | number>,
        defaultMessage?: string,
      ) => string
    >((descriptor) => descriptor);
    const memoized = memoize(inner);

    memoized('a');
    memoized('a', undefined, '');

    expect(inner).toHaveBeenCalledTimes(1);
  });
});

describe('transformToPairs', () => {
  it('returns a [token, value] pair for each matched template', () => {
    expect(transformToPairs(['{{name}}'], { name: 'Alex' })).toEqual([
      ['{{name}}', 'Alex'],
    ]);
  });

  it('handles multiple templates in order', () => {
    expect(
      transformToPairs(['{{name}}', '{{age}}'], { name: 'Alex', age: 25 }),
    ).toEqual([
      ['{{name}}', 'Alex'],
      ['{{age}}', 25],
    ]);
  });

  it('warns and pairs the token with itself when no value matches', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(
      transformToPairs(['{{name}}', '{{missing}}'], { name: 'Alex' }),
    ).toEqual([
      ['{{name}}', 'Alex'],
      ['{{missing}}', '{{missing}}'],
    ]);
    expect(warn).toHaveBeenCalledWith(NO_TEMPLATE_VALUE_MESSAGE, '{{missing}}');
  });

  it('is safe against prototype-pollution keys', () => {
    // Object.hasOwn must reject inherited keys like __proto__.
    expect(transformToPairs(['{{__proto__}}'], {})).toEqual([
      ['{{__proto__}}', '{{__proto__}}'],
    ]);
  });
});

describe('buildTranslation', () => {
  it('returns the source unchanged when values is undefined', () => {
    expect(buildTranslation('Hello {{name}}')).toBe('Hello {{name}}');
  });

  it('returns the source unchanged when values is empty', () => {
    expect(buildTranslation('Hello {{name}}', {})).toBe('Hello {{name}}');
  });

  it('returns the source unchanged when there are no templates', () => {
    expect(buildTranslation('Hello', { name: 'Alex' })).toBe('Hello');
  });

  it('interpolates a single template token', () => {
    expect(buildTranslation('Hello {{name}}', { name: 'Alex' })).toBe(
      'Hello Alex',
    );
  });

  it('interpolates multiple template tokens', () => {
    expect(
      buildTranslation('I am {{name}}, {{age}}', { name: 'Alex', age: 25 }),
    ).toBe('I am Alex, 25');
  });

  it('coerces numeric values', () => {
    expect(buildTranslation('{{n}} items', { n: 7 })).toBe('7 items');
  });

  it('replaces every occurrence of the same token', () => {
    expect(buildTranslation('{{name}} loves {{name}}', { name: 'Alex' })).toBe(
      'Alex loves Alex',
    );
  });

  it('does not re-interpret regex metacharacters in token values', () => {
    // v1's `new RegExp(template, 'gi')` made this string blow up; today
    // the value is inserted verbatim via String#replaceAll.
    expect(buildTranslation('Hello {{name}}', { name: '$1 ({{evil}})' })).toBe(
      'Hello $1 ({{evil}})',
    );
  });

  it('PARSE_TEMPLATE_REGEXP only matches single-level braces', () => {
    const matches = '{{a}} {b} {{c}}'.match(PARSE_TEMPLATE_REGEXP);
    expect(matches).toEqual(['{{a}}', '{{c}}']);
  });
});
