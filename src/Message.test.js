import React from 'react';
import renderer from 'react-test-renderer';
import { LocalizationProvider } from './Provider';
import { Message } from './Message';

const TRANSLATIONS = {
  en: {
    name: 'Alex',
  },
};

describe('Message', () => {
  it('translates from key to text', () => {
    const tree = renderer
      .create(
        <LocalizationProvider
          locale="en"
          translations={TRANSLATIONS}
        >
          <Message descriptor="name" />
        </LocalizationProvider>
      )
      .toJSON();

      expect(tree).toMatchSnapshot();
  });
});
