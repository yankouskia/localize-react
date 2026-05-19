import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LocalizationProvider } from './Provider.js';
import { useLocalize } from './use-localize.js';

function Greet({ descriptor }: { descriptor: string }) {
  const { translate } = useLocalize();
  return <span data-testid="o">{translate(descriptor)}</span>;
}

describe('useLocalize', () => {
  it('returns the active context value', () => {
    render(
      <LocalizationProvider translations={{ name: 'Alex' }}>
        <Greet descriptor="name" />
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('Alex');
  });

  it('returns a usable default when called outside a provider', () => {
    render(<Greet descriptor="some.key" />);
    // No provider: translate is the identity-with-default-message.
    expect(screen.getByTestId('o')).toHaveTextContent('some.key');
  });

  it('exposes locale and translations on the context value', () => {
    function Inspect() {
      const { locale, translations } = useLocalize();
      return (
        <span data-testid="o">
          {`${locale ?? ''}|${(translations.name as string) ?? ''}`}
        </span>
      );
    }

    render(
      <LocalizationProvider locale="en-US" translations={{ name: 'Alex' }}>
        <Inspect />
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('en-US|Alex');
  });
});
