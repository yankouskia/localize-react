import React from 'react';
import renderer from 'react-test-renderer';
import { LocalizationProvider } from './Provider';
import { useLocalize } from './use-localize';

const TRANSLATIONS = {
  name: 'Alex',
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
});
