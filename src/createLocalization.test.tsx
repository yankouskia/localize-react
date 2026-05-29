import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createLocalization } from './createLocalization.js';
import { NO_TRANSLATION_WARNING_MESSAGE } from './helpers.js';

const translations = {
  en: {
    greeting: 'Hi {{name}}!',
    cart: {
      summary: '{{count}} items, {{total}} total',
      checkout: 'Checkout',
    },
  },
  es: {
    greeting: '¡Hola {{name}}!',
    cart: {
      summary: '{{count}} artículos, {{total}} total',
      checkout: 'Pagar',
    },
  },
} as const;

describe('createLocalization', () => {
  it('returns a Provider that wires up the seed translations', () => {
    const { LocalizationProvider, Message } = createLocalization(translations);
    render(
      <LocalizationProvider locale="en">
        <span data-testid="o">
          <Message descriptor="cart.checkout" />
        </span>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('Checkout');
  });

  it('interpolates values via the typed translate', () => {
    const { LocalizationProvider, useLocalize } =
      createLocalization(translations);

    function Out(): string {
      const { translate } = useLocalize();
      return translate('greeting', { name: 'Alex' });
    }

    render(
      <LocalizationProvider locale="en">
        <span data-testid="o">
          <Out />
        </span>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('Hi Alex!');
  });

  it('switches locale via the locale prop', () => {
    const { LocalizationProvider, Message } = createLocalization(translations);
    const { rerender } = render(
      <LocalizationProvider locale="en">
        <span data-testid="o">
          <Message descriptor="greeting" values={{ name: 'Alex' }} />
        </span>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('Hi Alex!');

    rerender(
      <LocalizationProvider locale="es">
        <span data-testid="o">
          <Message descriptor="greeting" values={{ name: 'Alex' }} />
        </span>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('¡Hola Alex!');
  });

  it('exposes the seed translations + the active locale on the context', () => {
    const { LocalizationProvider, useLocalize } =
      createLocalization(translations);

    let captured: ReturnType<typeof useLocalize> | undefined;
    function Probe(): null {
      captured = useLocalize();
      return null;
    }
    render(
      <LocalizationProvider locale="en">
        <Probe />
      </LocalizationProvider>,
    );
    expect(captured?.translations).toBe(translations);
    expect(captured?.locale).toBe('en');
  });

  it('renders without a locale (omitted prop) and uses the descriptor as fallback', () => {
    const { LocalizationProvider, Message } = createLocalization(translations);
    render(
      <LocalizationProvider>
        <span data-testid="o">
          <Message descriptor="cart.checkout" />
        </span>
      </LocalizationProvider>,
    );
    // No locale → no translation tree resolves, so the descriptor itself
    // is rendered (matches v1 behaviour of the untyped Provider).
    expect(screen.getByTestId('o')).toHaveTextContent('cart.checkout');
  });

  it('forwards disableCache to the underlying provider', () => {
    const { LocalizationProvider, Message } = createLocalization(translations);
    // Disabling the cache should not alter the rendered output for a
    // simple descriptor — this exercises the prop pass-through.
    render(
      <LocalizationProvider locale="en" disableCache>
        <span data-testid="o">
          <Message descriptor="cart.checkout" />
        </span>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('Checkout');
  });

  it('ignores defaultMessage when the descriptor resolves successfully', () => {
    const seed = { en: { onlyHere: 'present' } } as const;
    const { LocalizationProvider, Message } = createLocalization(seed);
    render(
      <LocalizationProvider locale="en">
        <span data-testid="o">
          <Message descriptor="onlyHere" defaultMessage="fallback" />
        </span>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('present');
  });

  it('renders defaultMessage when the active locale has no matching tree', () => {
    const seed = { en: { onlyHere: 'present' } } as const;
    const { LocalizationProvider, Message } = createLocalization(seed);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      // @ts-expect-error -- intentionally selecting a locale outside the seed
      <LocalizationProvider locale="fr">
        <span data-testid="o">
          <Message descriptor="onlyHere" defaultMessage="fallback" />
        </span>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('fallback');
    warn.mockRestore();
  });

  it('resolves deeply nested dot-paths', () => {
    const deep = {
      en: { a: { b: { c: { d: 'leaf {{x}}' } } } },
    } as const;
    const { LocalizationProvider, Message } = createLocalization(deep);
    render(
      <LocalizationProvider locale="en">
        <span data-testid="o">
          <Message descriptor="a.b.c.d" values={{ x: 1 }} />
        </span>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('leaf 1');
  });

  it('interpolates multi-token templates via translate', () => {
    const { LocalizationProvider, useLocalize } =
      createLocalization(translations);
    function Out(): string {
      const { translate } = useLocalize();
      return translate('cart.summary', { count: 3, total: '$42' });
    }
    render(
      <LocalizationProvider locale="en">
        <span data-testid="o">
          <Out />
        </span>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('3 items, $42 total');
  });

  it('interpolates values containing regex meta-characters literally', () => {
    const { LocalizationProvider, useLocalize } =
      createLocalization(translations);
    function Out(): string {
      const { translate } = useLocalize();
      return translate('greeting', { name: '$1 ({{name}})' });
    }
    render(
      <LocalizationProvider locale="en">
        <span data-testid="o">
          <Out />
        </span>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('Hi $1 ({{name}})!');
  });

  it('forwards an explicit disableCache={false} through the spread', () => {
    const { LocalizationProvider, Message } = createLocalization(translations);
    render(
      <LocalizationProvider locale="en" disableCache={false}>
        <span data-testid="o">
          <Message descriptor="cart.checkout" />
        </span>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('Checkout');
  });

  it('falls back to the descriptor when the locale prop is removed on rerender', () => {
    const { LocalizationProvider, Message } = createLocalization(translations);
    const { rerender } = render(
      <LocalizationProvider locale="en">
        <span data-testid="o">
          <Message descriptor="cart.checkout" />
        </span>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('Checkout');

    rerender(
      <LocalizationProvider>
        <span data-testid="o">
          <Message descriptor="cart.checkout" />
        </span>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('cart.checkout');
  });

  it('sets a recognisable displayName on the returned Provider', () => {
    const { LocalizationProvider } = createLocalization(translations);
    expect((LocalizationProvider as { displayName?: string }).displayName).toBe(
      'TypedLocalizationProvider',
    );
  });

  it('renders the typed RichMessage with React-node values', () => {
    const { LocalizationProvider, RichMessage } =
      createLocalization(translations);
    render(
      <LocalizationProvider locale="en">
        <p data-testid="o">
          <RichMessage
            descriptor="greeting"
            values={{ name: <strong data-testid="who">Alex</strong> }}
          />
        </p>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('Hi Alex!');
    expect(screen.getByTestId('who').tagName).toBe('STRONG');
  });

  it('warns when the locale prop has no matching entry (passthrough behaviour)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { LocalizationProvider, Message } = createLocalization(translations);
    render(
      // @ts-expect-error -- intentionally testing the runtime warning path
      <LocalizationProvider locale="fr">
        <span data-testid="o">
          <Message descriptor="cart.checkout" />
        </span>
      </LocalizationProvider>,
    );
    expect(warn).toHaveBeenCalledWith(NO_TRANSLATION_WARNING_MESSAGE, 'fr');
    expect(screen.getByTestId('o')).toHaveTextContent('cart.checkout');
    warn.mockRestore();
  });
});
