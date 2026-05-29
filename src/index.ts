/**
 * `localize-react` — tiny, type-safe React i18n built on Context and hooks.
 *
 * @packageDocumentation
 */

export {
  LocalizationConsumer,
  LocalizationContext,
  LocalizationProvider,
} from './Provider.js';

export { useLocalize } from './use-localize.js';

export { Message } from './Message.js';

export { RichMessage, buildRichTranslation } from './RichMessage.js';

export { createLocalization } from './createLocalization.js';

export type {
  LocalizationContextValue,
  LocalizationProviderProps,
  MessageProps,
  RichMessageProps,
  RichTemplateValues,
  TemplateValues,
  Translate,
  Translations,
} from './types.js';

export type {
  ExtractTokens,
  TranslationAt,
  TranslationPaths,
  TypedLocalization,
  TypedLocalizationContextValue,
  TypedLocalizationProviderProps,
  TypedMessageProps,
  TypedRichMessageProps,
  TypedTranslate,
} from './createLocalization.js';
