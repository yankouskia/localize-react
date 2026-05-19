import { render, screen } from '@testing-library/react';
import { PureComponent } from 'react';
import { describe, expect, it } from 'vitest';

import {
  LocalizationConsumer,
  LocalizationContext,
  LocalizationProvider,
} from './Provider.js';
import type { Translations } from './types.js';

const TRANSLATIONS: Translations = {
  en: {
    name: 'Alex',
    emptyMessage: '',
    n: { i: { c: { k: 'yankouskia' } } },
  },
  fr: {
    github: 'https://github.com/yankouskia',
    templateHello: 'Hello {{name}}',
  },
};

describe('<LocalizationProvider />', () => {
  it('renders children passthrough', () => {
    render(
      <LocalizationProvider locale="fr" translations={TRANSLATIONS}>
        <span data-testid="child">child text</span>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('child')).toHaveTextContent('child text');
  });
});

describe('<LocalizationConsumer />', () => {
  it('exposes translate for the active locale', () => {
    render(
      <LocalizationProvider locale="en" translations={TRANSLATIONS}>
        <LocalizationConsumer>
          {({ translate }) => <span data-testid="o">{translate('name')}</span>}
        </LocalizationConsumer>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('Alex');
  });

  it('returns the descriptor when no translations are supplied', () => {
    render(
      <LocalizationProvider locale="fr" translations={{}}>
        <LocalizationConsumer>
          {({ translate }) => (
            <span data-testid="o">{translate('any.key')}</span>
          )}
        </LocalizationConsumer>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('any.key');
  });

  it('returns an empty string when the value is an empty string', () => {
    render(
      <LocalizationProvider locale="en" translations={TRANSLATIONS}>
        <LocalizationConsumer>
          {({ translate }) => (
            <span data-testid="o">{`<${translate('emptyMessage')}>`}</span>
          )}
        </LocalizationConsumer>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('<>');
  });

  it('returns the descriptor for unknown top-level keys', () => {
    render(
      <LocalizationProvider locale="en" translations={TRANSLATIONS}>
        <LocalizationConsumer>
          {({ translate }) => (
            <span data-testid="o">{translate('unknown')}</span>
          )}
        </LocalizationConsumer>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('unknown');
  });

  it('returns the descriptor for empty key', () => {
    render(
      <LocalizationProvider locale="en" translations={TRANSLATIONS}>
        <LocalizationConsumer>
          {({ translate }) => (
            <span data-testid="o">{`<${translate('')}>`}</span>
          )}
        </LocalizationConsumer>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('<>');
  });

  it('interpolates values into a fallback string when the key is not in the map', () => {
    render(
      <LocalizationProvider locale="en" translations={TRANSLATIONS}>
        <LocalizationConsumer>
          {({ translate }) => (
            <span data-testid="o">
              {translate('Hello, {{name}}', { name: 'Alex' })}
            </span>
          )}
        </LocalizationConsumer>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('Hello, Alex');
  });

  it('interpolates values into a found template', () => {
    render(
      <LocalizationProvider locale="fr" translations={TRANSLATIONS}>
        <LocalizationConsumer>
          {({ translate }) => (
            <span data-testid="o">
              {translate('templateHello', { name: 'Alex' })}
            </span>
          )}
        </LocalizationConsumer>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('Hello Alex');
  });

  it('resolves a nested key via dot-notation', () => {
    render(
      <LocalizationProvider locale="en" translations={TRANSLATIONS}>
        <LocalizationConsumer>
          {({ translate }) => (
            <span data-testid="o">{translate('n.i.c.k')}</span>
          )}
        </LocalizationConsumer>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('yankouskia');
  });

  it('returns the descriptor when a nested path resolves to a non-string', () => {
    render(
      <LocalizationProvider locale="en" translations={TRANSLATIONS}>
        <LocalizationConsumer>
          {({ translate }) => (
            <span data-testid="o">{translate('n.i.c.k.deeper')}</span>
          )}
        </LocalizationConsumer>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('n.i.c.k.deeper');
  });

  it('resolves nested keys when no locale is set (translations is the flat map)', () => {
    render(
      <LocalizationProvider translations={{ a: { b: 'translation' } }}>
        <LocalizationConsumer>
          {({ translate }) => <span data-testid="o">{translate('a.b')}</span>}
        </LocalizationConsumer>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('translation');
  });

  it('clears the cache when locale or translations change', () => {
    const { rerender } = render(
      <LocalizationProvider
        locale="a"
        translations={{ a: { b: 'A' }, c: { b: 'C' } }}
      >
        <LocalizationConsumer>
          {({ translate }) => <span data-testid="o">{translate('b')}</span>}
        </LocalizationConsumer>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('A');

    rerender(
      <LocalizationProvider
        locale="c"
        translations={{ a: { b: 'A' }, c: { b: 'C' } }}
      >
        <LocalizationConsumer>
          {({ translate }) => <span data-testid="o">{translate('b')}</span>}
        </LocalizationConsumer>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('C');
  });

  it('disableCache=true picks up in-place translation edits', () => {
    const translations: Translations = { a: { b: 'translation' } };
    const { rerender } = render(
      <LocalizationProvider disableCache translations={translations}>
        <LocalizationConsumer>
          {({ translate }) => <span data-testid="o">{translate('a.b')}</span>}
        </LocalizationConsumer>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('translation');

    // Mutate the translations object in place (the kind of dev-only
    // workflow `disableCache` exists to support).
    (translations as { a: { b: string } }).a.b = 'changed';

    rerender(
      <LocalizationProvider disableCache translations={translations}>
        <LocalizationConsumer>
          {({ translate }) => <span data-testid="o">{translate('a.b')}</span>}
        </LocalizationConsumer>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('changed');
  });
});

describe('LocalizationContext', () => {
  it('works with class components via static contextType', () => {
    class GitHubLink extends PureComponent {
      static override contextType = LocalizationContext;

      declare context: React.ContextType<typeof LocalizationContext>;

      override render() {
        return <span data-testid="o">{this.context.translate('github')}</span>;
      }
    }

    render(
      <LocalizationProvider locale="fr" translations={TRANSLATIONS}>
        <GitHubLink />
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent(
      'https://github.com/yankouskia',
    );
  });

  it('uses defaultMessage when descriptor is not in translations', () => {
    render(
      <LocalizationProvider locale="fr" translations={{ fr: {} }}>
        <LocalizationConsumer>
          {({ translate }) => (
            <span data-testid="o">
              {translate('not.existing', undefined, 'Default Message')}
            </span>
          )}
        </LocalizationConsumer>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('Default Message');
  });

  it('uses defaultMessage with interpolated values', () => {
    render(
      <LocalizationProvider locale="fr" translations={{ fr: {} }}>
        <LocalizationConsumer>
          {({ translate }) => (
            <span data-testid="o">
              {translate('missing.key', { name: 'Alex' }, 'Hello {{name}}!')}
            </span>
          )}
        </LocalizationConsumer>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('Hello Alex!');
  });

  it('returns a passthrough translate when used without a provider', () => {
    render(
      <LocalizationConsumer>
        {({ translate }) => (
          <span data-testid="o">
            {translate('whatever', undefined, 'fallback')}
          </span>
        )}
      </LocalizationConsumer>,
    );
    expect(screen.getByTestId('o')).toHaveTextContent('fallback');
  });
});
