export const WARNING_MESSAGE = 'localize-react: There are no translations for specified locale';

export function sanitizeLocale(locale, translations) {
  if (!locale) {
    return null;
  }

  if (typeof translations[locale] === 'object') {
    return locale;
  }

  const normalizedLocale = locale.toLowerCase().replace(/-/g, '_');
  if (typeof translations[normalizedLocale] === 'object') {
    return normalizedLocale;
  }

  const shortenLocale = normalizedLocale.split('_')[0];
  if (typeof translations[shortenLocale] === 'object') {
    return shortenLocale;
  }

  console.warn(WARNING_MESSAGE, locale);
  return locale;
}
