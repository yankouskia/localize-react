import { assertType, expectTypeOf, test } from 'vitest';

import type {
  LocalizationContextValue,
  LocalizationProviderProps,
  MessageProps,
  TemplateValues,
  Translate,
  Translations,
} from './index.js';
import type { Message, useLocalize } from './index.js';

test('Translations allows nested string trees', () => {
  expectTypeOf<{ a: { b: { c: 'leaf' } } }>().toMatchTypeOf<Translations>();
  expectTypeOf<{ flat: 'value' }>().toMatchTypeOf<Translations>();
});

test('TemplateValues accepts string or number values', () => {
  expectTypeOf<{ x: string }>().toMatchTypeOf<TemplateValues>();
  expectTypeOf<{ x: number }>().toMatchTypeOf<TemplateValues>();
  expectTypeOf<{ x: string; y: number }>().toMatchTypeOf<TemplateValues>();
});

test('Translate signature is (descriptor, values?, defaultMessage?) => string', () => {
  expectTypeOf<Translate>().toBeFunction();
  expectTypeOf<Translate>().parameters.toEqualTypeOf<
    [descriptor: string, values?: TemplateValues, defaultMessage?: string]
  >();
  expectTypeOf<Translate>().returns.toEqualTypeOf<string>();
});

test('useLocalize returns LocalizationContextValue', () => {
  expectTypeOf<
    typeof useLocalize
  >().returns.toEqualTypeOf<LocalizationContextValue>();
});

test('Message accepts the declared prop shape', () => {
  assertType<MessageProps>({ descriptor: 'a.b' });
  assertType<MessageProps>({
    descriptor: 'greeting',
    values: { name: 'Alex' },
    defaultMessage: 'Hi',
  });

  expectTypeOf<typeof Message>().parameter(0).toMatchTypeOf<MessageProps>();
});

test('LocalizationProviderProps requires translations and accepts the optional set', () => {
  // @ts-expect-error -- translations is required
  assertType<LocalizationProviderProps>({});

  assertType<LocalizationProviderProps>({ translations: {} });
  assertType<LocalizationProviderProps>({
    translations: { en: { hello: 'Hi' } },
    locale: 'en',
    disableCache: true,
  });
});
