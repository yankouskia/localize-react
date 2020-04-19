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

  it('translates from key to text with default message', () => {
    const tree = renderer
      .create(
        <LocalizationProvider
          locale="en"
          translations={TRANSLATIONS}
        >
          <Message
            defaultMessage="Default Message"
            descriptor="not.existing"
          />
        </LocalizationProvider>
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
