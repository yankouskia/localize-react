let TRANSLATION_CACHE = {};

export const NO_TRANSLATION_WARNING_MESSAGE = '[LOCALIZE-REACT]: There are no translations for specified locale';
export const NO_TEMPLATE_VALUE_MESSAGE = '[LOCALIZE-REACT] Looks like template is being used, but no value passed for ';
export const PARSE_TEMPLATE_REGEXP = /{{([^{]+[^}])}}/g;

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

  console.warn(NO_TRANSLATION_WARNING_MESSAGE, locale);
  return locale;
}

export function memoize(fn) {
  return function memoizedFn(input, values) {
    const cacheKey = values ? JSON.stringify(values, null, '') + input : input;
    if (TRANSLATION_CACHE[cacheKey]) return TRANSLATION_CACHE[cacheKey];

    const output = fn(input, values);
    TRANSLATION_CACHE[cacheKey] = output;

    return output;
  }
}

export function clearCache() {
  TRANSLATION_CACHE = {};
}

export function transformToPairs(templates, values) {
  const valuesKeys = Object.keys(values);

  return templates.map(tpl => {
    const correspondentKey = Array.prototype.slice.call(tpl, 2, -2).join('');
    const rightKey = valuesKeys.find(valueKey => valueKey === correspondentKey);

    if (!rightKey) {
      console.warn(NO_TEMPLATE_VALUE_MESSAGE, tpl);
      return [tpl, tpl];
    }

    return [tpl, values[rightKey]];
  });
}

export function buildTranslation(str, values) {
  if (!values) return str;

  const keys = Object.keys(values);
  if (keys.length === 0) return str;

  const templates = str.match(PARSE_TEMPLATE_REGEXP);
  if (!templates || templates.length === 0) return str;

  const templatePairs = transformToPairs(templates, values);

  return templatePairs.reduce((result, templatePair) => {
    const replaceRegexp = new RegExp(templatePair[0], 'gi');

    return result.replace(replaceRegexp, templatePair[1]);
  }, str);
}
