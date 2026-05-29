import { render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { NO_TEMPLATE_VALUE_MESSAGE } from './helpers.js';
import { LocalizationProvider } from './Provider.js';
import { RichMessage, buildRichTranslation } from './RichMessage.js';
import type { Translations } from './types.js';

const TRANSLATIONS: Translations = {
  en: {
    greeting: 'Hello, {{name}}!',
    plain: 'Just some text.',
    terms: 'By signing up, you agree to our {{link}}.',
    twins: '{{name}} and {{name}} agree.',
    cart: { summary: '{{count}} items, {{total}} total' },
  },
};

describe('<RichMessage />', () => {
  it('renders a plain string when the descriptor resolves to text', () => {
    render(
      <LocalizationProvider locale="en" translations={TRANSLATIONS}>
        <span data-testid="o">
          <RichMessage descriptor="plain" />
        </span>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('Just some text.');
  });

  it('interpolates string values into the translated template', () => {
    render(
      <LocalizationProvider locale="en" translations={TRANSLATIONS}>
        <span data-testid="o">
          <RichMessage descriptor="greeting" values={{ name: 'Alex' }} />
        </span>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('Hello, Alex!');
  });

  it('embeds React nodes inside the translated sentence', () => {
    render(
      <LocalizationProvider locale="en" translations={TRANSLATIONS}>
        <p data-testid="o">
          <RichMessage
            descriptor="terms"
            values={{
              link: <a href="/terms">Terms of Service</a>,
            }}
          />
        </p>
      </LocalizationProvider>,
    );
    const root = screen.getByTestId('o');
    expect(root).toHaveTextContent(
      'By signing up, you agree to our Terms of Service.',
    );
    const link = root.querySelector('a');
    expect(link).not.toBeNull();
    expect(link).toHaveAttribute('href', '/terms');
    expect(link).toHaveTextContent('Terms of Service');
  });

  it('mixes string and React-node values in the same template', () => {
    render(
      <LocalizationProvider locale="en" translations={TRANSLATIONS}>
        <p data-testid="o">
          <RichMessage
            descriptor="cart.summary"
            values={{
              count: 3,
              total: <strong data-testid="total">$42.00</strong>,
            }}
          />
        </p>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('3 items, $42.00 total');
    expect(screen.getByTestId('total').tagName).toBe('STRONG');
  });

  it('renders the same token twice without React duplicate-key warnings', () => {
    render(
      <LocalizationProvider locale="en" translations={TRANSLATIONS}>
        <span data-testid="o">
          <RichMessage descriptor="twins" values={{ name: <em>Alex</em> }} />
        </span>
      </LocalizationProvider>,
    );
    const root = screen.getByTestId('o');
    expect(root).toHaveTextContent('Alex and Alex agree.');
    expect(root.querySelectorAll('em')).toHaveLength(2);
  });

  it('coerces numeric values to their string form', () => {
    render(
      <LocalizationProvider locale="en" translations={TRANSLATIONS}>
        <span data-testid="o">
          <RichMessage descriptor="greeting" values={{ name: 42 }} />
        </span>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('Hello, 42!');
  });

  it('falls back to defaultMessage when the descriptor is missing', () => {
    render(
      <LocalizationProvider locale="en" translations={TRANSLATIONS}>
        <span data-testid="o">
          <RichMessage
            descriptor="missing"
            defaultMessage="Hi {{name}}"
            values={{ name: <strong>Alex</strong> }}
          />
        </span>
      </LocalizationProvider>,
    );
    const root = screen.getByTestId('o');
    expect(root).toHaveTextContent('Hi Alex');
    expect(root.querySelector('strong')).not.toBeNull();
  });

  it('renders the descriptor itself when nothing else resolves', () => {
    render(
      <LocalizationProvider locale="en" translations={TRANSLATIONS}>
        <span data-testid="o">
          <RichMessage descriptor="missing" />
        </span>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('missing');
  });

  it('leaves the template alone when values is omitted', () => {
    render(
      <LocalizationProvider locale="en" translations={TRANSLATIONS}>
        <span data-testid="o">
          <RichMessage descriptor="greeting" />
        </span>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('Hello, {{name}}!');
  });

  it('renders the same descriptor twice with different node values', () => {
    function Both(): React.JSX.Element {
      return (
        <>
          <p data-testid="a">
            <RichMessage
              descriptor="terms"
              values={{ link: <a href="/v1">v1</a> }}
            />
          </p>
          <p data-testid="b">
            <RichMessage
              descriptor="terms"
              values={{ link: <a href="/v2">v2</a> }}
            />
          </p>
        </>
      );
    }
    render(
      <LocalizationProvider locale="en" translations={TRANSLATIONS}>
        <Both />
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('a').querySelector('a')).toHaveAttribute(
      'href',
      '/v1',
    );
    expect(screen.getByTestId('b').querySelector('a')).toHaveAttribute(
      'href',
      '/v2',
    );
  });

  it('renders correctly inside StrictMode', () => {
    render(
      <StrictMode>
        <LocalizationProvider locale="en" translations={TRANSLATIONS}>
          <p data-testid="o">
            <RichMessage
              descriptor="terms"
              values={{ link: <a href="/t">T</a> }}
            />
          </p>
        </LocalizationProvider>
      </StrictMode>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent(
      'By signing up, you agree to our T.',
    );
  });

  it('warns when a template placeholder has no matching value', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <LocalizationProvider locale="en" translations={TRANSLATIONS}>
        <span data-testid="o">
          <RichMessage descriptor="greeting" values={{ other: 'oops' }} />
        </span>
      </LocalizationProvider>,
    );
    expect(warn).toHaveBeenCalledWith(NO_TEMPLATE_VALUE_MESSAGE, '{{name}}');
    expect(screen.getByTestId('o')).toHaveTextContent('Hello, {{name}}!');
    warn.mockRestore();
  });
});

describe('buildRichTranslation', () => {
  it('returns the template unchanged when values is empty', () => {
    expect(buildRichTranslation('Hello {{name}}', {})).toEqual([
      'Hello {{name}}',
    ]);
  });

  it('returns the template unchanged when there are no tokens', () => {
    expect(buildRichTranslation('Plain text', { x: 1 })).toEqual([
      'Plain text',
    ]);
  });

  it('substitutes string and number tokens', () => {
    expect(
      buildRichTranslation('I am {{name}}, {{age}}', { name: 'Alex', age: 25 }),
    ).toEqual(['I am ', 'Alex', ', ', '25', '']);
  });

  it('passes ReactNode values through verbatim', () => {
    const link = <a href="/x">link</a>;
    const parts = buildRichTranslation('Click {{link}} now', { link });
    expect(parts[0]).toBe('Click ');
    expect(parts[1]).toBe(link);
    expect(parts[2]).toBe(' now');
  });

  it('leaves unknown tokens as their original {{token}} text', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(
      buildRichTranslation('Hi {{name}}, {{unknown}}', { name: 'Alex' }),
    ).toEqual(['Hi ', 'Alex', ', ', '{{unknown}}', '']);
    expect(warn).toHaveBeenCalledWith(NO_TEMPLATE_VALUE_MESSAGE, '{{unknown}}');
    warn.mockRestore();
  });

  it('returns [""] for an empty template even when values exist', () => {
    expect(buildRichTranslation('', { x: 'X' })).toEqual(['']);
  });

  it('handles a leading token', () => {
    expect(buildRichTranslation('{{x}}rest', { x: 'X' })).toEqual([
      '',
      'X',
      'rest',
    ]);
  });

  it('handles a trailing token', () => {
    expect(buildRichTranslation('rest{{x}}', { x: 'X' })).toEqual([
      'rest',
      'X',
      '',
    ]);
  });

  it('handles back-to-back tokens with no separator', () => {
    expect(buildRichTranslation('{{a}}{{b}}', { a: 'A', b: 'B' })).toEqual([
      '',
      'A',
      '',
      'B',
      '',
    ]);
  });

  it('handles a token-only template', () => {
    expect(buildRichTranslation('{{x}}', { x: 'X' })).toEqual(['', 'X', '']);
  });

  it('passes null/undefined/boolean through verbatim (React renders as nothing)', () => {
    expect(buildRichTranslation('a {{x}} b', { x: null })).toEqual([
      'a ',
      null,
      ' b',
    ]);
    expect(buildRichTranslation('a {{x}} b', { x: undefined })).toEqual([
      'a ',
      undefined,
      ' b',
    ]);
    expect(buildRichTranslation('a {{x}} b', { x: false })).toEqual([
      'a ',
      false,
      ' b',
    ]);
  });
});
