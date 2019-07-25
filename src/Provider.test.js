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
  },
  fr: {
    github: 'yankouskia',
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
  })

});
