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

export type {
  LocalizationContextValue,
  LocalizationProviderProps,
  MessageProps,
  TemplateValues,
  Translate,
  Translations,
} from './types.js';
