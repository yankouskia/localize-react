import React from 'react';
import renderer from 'react-test-renderer';
import {
  LocalizationConsumer,
  LocalizationContext,
  LocalizationProvider,
} from './Provider';

const TRANSLATIONS = {
  en: {
    name: 'Alex',
    emptyMessage: '',
    n: {
      i: {
        c: {
          k: 'yankouskia',
        }
      }
    }
  },
  fr: {
    github: 'https://github.com/yankouskia',
    templateHello: 'Hello {{name}}',
  },
};

describe('Provider', () => {
  describe('LocalizationProvider', () => {
    it('renders children', () => {
      const tree = renderer
        .create(
          <LocalizationProvider
            locale="fr"
            translations={TRANSLATIONS}
          >
            children as a text
          </LocalizationProvider>
        )
        .toJSON();

        expect(tree).toMatchSnapshot();
    });
  });

  describe('LocalizationConsumer', () => {
    it('provides translation for set locale', () => {
      const tree = renderer
        .create(
          <LocalizationProvider
            locale="en"
            translations={TRANSLATIONS}
          >
            <LocalizationConsumer>
              {({ translate }) => translate('name')}
            </LocalizationConsumer>
          </LocalizationProvider>
        )
        .toJSON();

        expect(tree).toMatchSnapshot();
    });

    it('provides empty object translations by default', () => {
      const tree = renderer
        .create(
          <LocalizationProvider
            locale="fr"
          >
            <LocalizationConsumer>
              {({ translate }) => translate('any key')}
            </LocalizationConsumer>
          </LocalizationProvider>
        )
        .toJSON();

        expect(tree).toMatchSnapshot();
    });

    it('provides translation for empty message', () => {
      const tree = renderer
        .create(
          <LocalizationProvider
            locale="en"
            translations={TRANSLATIONS}
          >
            <LocalizationConsumer>
              {({ translate }) => (
                <div>
                  <span>{translate('emptyMessage')}</span>
                </div>
              )}
            </LocalizationConsumer>
          </LocalizationProvider>
        )
        .toJSON();

        expect(tree).toMatchSnapshot();
    });

    it('provides translation the same as key for unexisting key', () => {
      const tree = renderer
        .create(
          <LocalizationProvider
            locale="en"
            translations={TRANSLATIONS}
          >
            <LocalizationConsumer>
              {({ translate }) => (
                <div>
                  <span>{translate('unexistingKey')}</span>
                </div>
              )}
            </LocalizationConsumer>
          </LocalizationProvider>
        )
        .toJSON();

        expect(tree).toMatchSnapshot();
    });

    it('provides translation for empty key as the same key', () => {
      const tree = renderer
        .create(
          <LocalizationProvider
            locale="en"
            translations={TRANSLATIONS}
          >
            <LocalizationConsumer>
              {({ translate }) => (
                <div>
                  <span>{translate('')}</span>
                </div>
              )}
            </LocalizationConsumer>
          </LocalizationProvider>
        )
        .toJSON();

        expect(tree).toMatchSnapshot();
    });

    it('provides translation for not found key with values', () => {
      const tree = renderer
        .create(
          <LocalizationProvider
            locale="en"
            translations={TRANSLATIONS}
          >
            <LocalizationConsumer>
              {({ translate }) => (
                <div>
                  <span>{translate('Hello, {{name}}', { name: 'Alex' })}</span>
                </div>
              )}
            </LocalizationConsumer>
          </LocalizationProvider>
        )
        .toJSON();

        expect(tree).toMatchSnapshot();
    });

    it('provides translation for key with values', () => {
      const tree = renderer
        .create(
          <LocalizationProvider
            locale="fr"
            translations={TRANSLATIONS}
          >
            <LocalizationConsumer>
              {({ translate }) => (
                <div>
                  <span>{translate('templateHello', { name: 'Alex' })}</span>
                </div>
              )}
            </LocalizationConsumer>
          </LocalizationProvider>
        )
        .toJSON();

        expect(tree).toMatchSnapshot();
    });

    it('provides translation with nested key', () => {
      const tree = renderer
        .create(
          <LocalizationProvider
            locale="en"
            translations={TRANSLATIONS}
          >
            <LocalizationConsumer>
              {({ translate }) => (
                <div>
                  <span>{translate('n.i.c.k')}</span>
                </div>
              )}
            </LocalizationConsumer>
          </LocalizationProvider>
        )
        .toJSON();

        expect(tree).toMatchSnapshot();
    });

    it('provides key translation if nested key was not found', () => {
      const tree = renderer
        .create(
          <LocalizationProvider
            locale="en"
            translations={TRANSLATIONS}
          >
            <LocalizationConsumer>
              {({ translate }) => (
                <div>
                  <span>{translate('n.i.c.k.not.found')}</span>
                </div>
              )}
            </LocalizationConsumer>
          </LocalizationProvider>
        )
        .toJSON();

        expect(tree).toMatchSnapshot();
    });

    it('provides nested key translation without locale', () => {
      const tree = renderer
        .create(
          <LocalizationProvider
            translations={{ a: { b: 'translation' } }}
          >
            <LocalizationConsumer>
              {({ translate }) => (
                <div>
                  <span>{translate('a.b')}</span>
                </div>
              )}
            </LocalizationConsumer>
          </LocalizationProvider>
        )
        .toJSON();

        expect(tree).toMatchSnapshot();
    });

    it('clears cache after props update', () => {
      const tree = renderer
        .create(
          <LocalizationProvider
            locale="a"
            translations={{ a: { b: 'A' }, c: { b: 'C' } }}
          >
            <LocalizationConsumer>
              {({ translate }) => (
                <div>
                  <span>{translate('b')}</span>
                </div>
              )}
            </LocalizationConsumer>
          </LocalizationProvider>
        );

        renderer.act(() => {
          tree.update(
            <LocalizationProvider
              locale="c"
              translations={{ a: { b: 'A' }, c: { b: 'C' } }}
            >
              <LocalizationConsumer>
                {({ translate }) => (
                  <div>
                    <span>{translate('b')}</span>
                  </div>
                )}
              </LocalizationConsumer>
            </LocalizationProvider>
          );
        });

        expect(tree.toJSON()).toMatchSnapshot();
    });
  });

  it('calculate translation each time when disableCache is passed', () => {
    const translations = { a: { b: 'translation' } };

    const tree = renderer
      .create(
        <LocalizationProvider
            disableCache
            translations={translations}
          >
            <LocalizationConsumer>
              {({ translate }) => (
                <div>
                  <span>{translate('a.b')}</span>
                </div>
              )}
            </LocalizationConsumer>
          </LocalizationProvider>
      );

      expect(tree.toJSON()).toMatchSnapshot();

      translations.a.b = 'Changed Translation';

      renderer.act(() => {
        tree.update(
          <LocalizationProvider
            disableCache
            translations={translations}
          >
            <LocalizationConsumer>
              {({ translate }) => (
                <div>
                  <span>{translate('a.b')}</span>
                </div>
              )}
            </LocalizationConsumer>
          </LocalizationProvider>
        );
      });

      expect(tree.toJSON()).toMatchSnapshot();
  });

  describe('LocalizationContext', () => {
    it('can be used in classes', () => {
      class Translation extends React.PureComponent {
        render() {
          return (
            <span>
              {this.context.translate('github')}
            </span>
          )
        }
      }

      Translation.contextType = LocalizationContext;

      const tree = renderer
        .create(
          <LocalizationProvider
            locale="fr"
            translations={TRANSLATIONS}
          >
            <Translation />
          </LocalizationProvider>
        )
        .toJSON();

        expect(tree).toMatchSnapshot();
    });
  });

  describe('Default message', () => {
    it('should render default message if no translation exists', () => {
      class Translation extends React.PureComponent {
        render() {
          return (
            <span>
              {this.context.translate('not.existing', null, 'Default Message')}
            </span>
          )
        }
      }

      Translation.contextType = LocalizationContext;

      const tree = renderer
        .create(
          <LocalizationProvider
            locale="fr"
            translations={{ fr: {} }}
          >
            <Translation />
          </LocalizationProvider>
        )
        .toJSON();

        expect(tree).toMatchSnapshot();
    });
  });
});
