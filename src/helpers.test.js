import { sanitizeLocale, WARNING_MESSAGE } from './helpers';

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
    expect(global.console.warn).toHaveBeenCalledWith(WARNING_MESSAGE, 'FR-CA');
  });
});
