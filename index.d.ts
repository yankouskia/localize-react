import { Context, ComponentType, Consumer, PropsWithChildren } from "react";

interface Translations {
  [key: string]: string | number | Translations;
}

type TemplateValues = Record<string, string | number>;

type Translate = (
  key: string,
  values?: TemplateValues,
  defaultMessage?: string
) => string;

interface LocalizationContextValue {
  locale: string;
  translate: Translate;
  translations: Translations;
}

interface LocalizationProviderProps {
  locale?: string;
  disableCache?: boolean;
  translations: Translations;
  defaultLocale?: string;
}

interface MessageComponentProps {
  descriptor: string;
  values?: TemplateValues;
  defaultMessage?: string;
}

type UseLocalizeHook = () => LocalizationContextValue;

type MessageComponent = ComponentType<MessageComponentProps>;

export const useLocalize: UseLocalizeHook;

export const Message: MessageComponent;

export const LocalizationContext: Context<LocalizationContextValue>;

export const LocalizationProvider: ComponentType<
  PropsWithChildren<LocalizationProviderProps>
>;

export const LocalizationConsumer: Consumer<LocalizationContextValue>;
