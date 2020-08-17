import { Context, ComponentType, Consumer, PropsWithChildren } from 'react';

type Translate = (
  key: string,
  values?: Record<string, unknown>,
  defaultMessage?: string
) => string;

interface LocalizationContextValue {
  locale: string;
  translate: Translate;
  translations: Record<string, unknown>;
}

interface LocalizationProviderProps {
  locale?: string;
  disableCache?: boolean;
  translations: Record<string, unknown>;
}

interface MessageComponentProps {
  descriptor: string;
  values?: Record<string, unknown>;
  defaultMessage?: string;
}

type UseLocalizeHook = () => LocalizationContextValue;

type MessageComponent = ComponentType<MessageComponentProps>;

export const useLocalize: UseLocalizeHook;

export const Message: MessageComponent;

export const LocalizationContext: Context<LocalizationContextValue>;

export const LocalizationProvider: ComponentType<PropsWithChildren<LocalizationProviderProps>>;

export const LocalizationConsumer: Consumer<LocalizationContextValue>;
