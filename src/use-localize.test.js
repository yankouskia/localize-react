import React, { useEffect } from 'react';
import renderer from 'react-test-renderer';
import { LocalizationProvider } from './Provider';
import { useLocalize } from './use-localize';

const TRANSLATIONS = {
  name: 'Alex',
  en: {
    msg: 'English'
  },
  ja: {
    msg: 'Japanese'
  }
};

describe('Localize hook', () => {
  it('translates from key to text', () => {
    function Test() {
      const { translate } = useLocalize();

      return translate('name');
    }

    const tree = renderer
      .create(
        <LocalizationProvider
          translations={TRANSLATIONS}
        >
          <Test />
        </LocalizationProvider>
      )
      .toJSON();

      expect(tree).toMatchSnapshot();
  });

  it('changes locale', () => {
    function Test() {
      const { translate, setLocale } = useLocalize();

      useEffect(() => {
        setLocale("ja");
      }, []);

      return translate('msg');
    }

    let tree;

    renderer.act(() => {
      tree = renderer.create(
        <LocalizationProvider
          locale={"en"}
          translations={TRANSLATIONS}
        >
          <Test />
        </LocalizationProvider>
      );
    });

    expect(tree.toJSON()).toMatchSnapshot();
  });
});
