import {
  buildTranslation,
  clearCache,
  memoize,
  sanitizeLocale,
  transformToPairs,
  NO_TEMPLATE_VALUE_MESSAGE,
  NO_TRANSLATION_WARNING_MESSAGE,
} from './helpers';

describe('helpers', () => {
  describe('sanitizeLocale', () => {
    it('returns null is locale is not specified', () => {
      const sanitizedLocale = sanitizeLocale(null, {});
      expect(sanitizedLocale).toMatchSnapshot();
    });

    it('returns the same locale is that is defined in translations', () => {
      const sanitizedLocale = sanitizeLocale('En-uS', { 'En-uS': { name: 'Alex' } });
      expect(sanitizedLocale).toMatchSnapshot();
    });

    it('returns the lowercase underscore locale if original was not found', () => {
      const sanitizedLocale = sanitizeLocale('En-cA', { en_ca: { name: 'Alex' } });
      expect(sanitizedLocale).toMatchSnapshot();
    });

    it('returns the shorten locale if original was not found', () => {
      const sanitizedLocale = sanitizeLocale('En-Fr', { en: { name: 'Alex' } });
      expect(sanitizedLocale).toMatchSnapshot();
    });

    it('returns the original and makes warning if no matching happened', () => {
      global.console = { warn: jest.fn() };

      const sanitizedLocale = sanitizeLocale('FR-CA', { en: { name: 'Alex' } });
      expect(sanitizedLocale).toMatchSnapshot();
      expect(global.console.warn).toHaveBeenCalled();
      expect(global.console.warn).toHaveBeenCalledWith(NO_TRANSLATION_WARNING_MESSAGE, 'FR-CA');
    });
  });

  describe('memoize', () => {
    it('memoizes value', () => {
      const fn = jest.fn(_ => _);

      const memoizedFn = memoize(fn);
      const firstResult = memoizedFn(1);
      const secondResult = memoizedFn(1);

      clearCache();

      expect(firstResult).toEqual(secondResult);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('transformToPairs', () => {
    it('creates pair of template - value', () => {
      const pairs = transformToPairs(['{{name}}'], { name: 'Alex' });
      expect(pairs).toMatchSnapshot();
    });

    it('creates pairs of template - value', () => {
      const pairs = transformToPairs(['{{name}}', '{{age}}'], { name: 'Alex', age: 25 });
      expect(pairs).toMatchSnapshot();
    });

    it('creates pairs with same value if no correspondent value found', () => {
      global.console = { warn: jest.fn() };

      const pairs = transformToPairs(['{{name}}', '{{age}}', '{{not_found}}'], { name: 'Alex', age: 25 });
      expect(pairs).toMatchSnapshot();

      expect(global.console.warn).toHaveBeenCalled();
      expect(global.console.warn).toHaveBeenCalledWith(NO_TEMPLATE_VALUE_MESSAGE, '{{not_found}}');
    });
  });

  describe('buildTranslation', () => {
    it('builds simple translation with no values', () => {
      const result = buildTranslation('Hello {{world}}');
      expect(result).toMatchSnapshot();
    });

    it('builds simple translation with empty values', () => {
      const result = buildTranslation('Hello {{world}}', {});
      expect(result).toMatchSnapshot();
    });

    it('builds translation with no templates inside', () => {
      const result = buildTranslation('Hello', { name: 'Alex' });
      expect(result).toMatchSnapshot();
    });

    it('builds translation with multiple values', () => {
      const result = buildTranslation('Hello, my name is {{name}}. I am {{age}}', { age: 25, name: 'Alex' });
      expect(result).toMatchSnapshot();
    });
  });
});

