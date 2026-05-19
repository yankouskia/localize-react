import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Message } from './Message.js';
import { LocalizationProvider } from './Provider.js';
import type { Translations } from './types.js';

const TRANSLATIONS: Translations = {
  en: {
    name: 'Alex',
    greeting: 'Hello, {{name}}!',
  },
};

describe('<Message />', () => {
  it('renders the translated string for the given descriptor', () => {
    render(
      <LocalizationProvider locale="en" translations={TRANSLATIONS}>
        <span data-testid="o">
          <Message descriptor="name" />
        </span>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('Alex');
  });

  it('falls back to defaultMessage when descriptor is not found', () => {
    render(
      <LocalizationProvider locale="en" translations={TRANSLATIONS}>
        <span data-testid="o">
          <Message descriptor="not.existing" defaultMessage="Default" />
        </span>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('Default');
  });

  it('interpolates values inside the translation', () => {
    render(
      <LocalizationProvider locale="en" translations={TRANSLATIONS}>
        <span data-testid="o">
          <Message descriptor="greeting" values={{ name: 'Alex' }} />
        </span>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('Hello, Alex!');
  });

  it('interpolates values inside the defaultMessage too', () => {
    render(
      <LocalizationProvider locale="en" translations={{ en: {} }}>
        <span data-testid="o">
          <Message
            descriptor="missing"
            defaultMessage="Hi {{name}}"
            values={{ name: 'Alex' }}
          />
        </span>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('Hi Alex');
  });
});
