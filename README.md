[![CircleCI](https://circleci.com/gh/yankouskia/localize-react.svg?style=shield)](https://circleci.com/gh/yankouskia/localize-react) [![Codecov Coverage](https://img.shields.io/codecov/c/github/yankouskia/localize-react/master.svg?style=flat-square)](https://codecov.io/gh/yankouskia/localize-react/) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/yankouskia/localize-react/pulls) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/yankouskia/localize-react/blob/master/LICENSE) ![GitHub stars](https://img.shields.io/github/stars/yankouskia/localize-react.svg?style=social)

[![NPM](https://nodei.co/npm/localize-react.png?downloads=true)](https://www.npmjs.com/package/localize-react)

# localize-react

✈️ Lightweight React Localization Library 🇺🇸

## Motivation

Creating really simple lightweight library for localization in React applications without any dependencies, which is built on top of new [React Context Api](https://reactjs.org/docs/context.html)

Library has just **3.9KB** gzipped size


## Installation

npm:

```sh
npm install localize-react --save
```

yarn:

```sh
yarn add localize-react
```

## API

### Provider & Consumer

`LocalizationProvider` is used to provide data for translations into React context. The root application component should be wrapped into `LocalizationProvider`. Component has the next props:
- `children` - children to render
- `locale` - [OPTIONAL] locale to be used for translations. If locale is not specified regular translations object will be used as map of `{ descriptor: translations }`
- `translations` - object with translations

Example:

```js
import React from 'react';
import ReactDOM from 'react-dom';
import { LocalizationConsumer, LocalizationProvider } from 'localize-react';

const TRANSLATIONS = {
  en: {
    name: 'Alex',
  },
};

const App = () => (
  <LocalizationProvider
    locale="en"
    translations={TRANSLATIONS}
  >
    <LocalizationConsumer>
      {({ translate }) => translate('name')}
    </LocalizationConsumer>
  </LocalizationProvider>
);

ReactDOM.render(<App />, node); // "Alex" will be rendered
```

### Message

`Message` component is used to provide translated message by specified descriptor, which should be passed via props. Component has the next props:
- `descriptor` - translation key (descriptor)

Example:

```js
import React from 'react';
import ReactDOM from 'react-dom';
import { LocalizationConsumer, Message } from 'localize-react';

const TRANSLATIONS = {
  en: {
    name: 'Alex',
  },
};

const App = () => (
  <LocalizationProvider
    locale="en"
    translations={TRANSLATIONS}
  >
    <Message descriptor="name" />
  </LocalizationProvider>
);

ReactDOM.render(<App />, node); // "Alex" will be rendered
```

### useLocalize

`useLocalize` hook is used to provide localization context, which can be used for translation.

**NOTE**

Keep in mind, that hooks are not supported in class components!

Example:

```js
import React from 'react';
import ReactDOM from 'react-dom';
import { useLocalize } from 'localize-react';

const TRANSLATIONS = {
  en: {
    name: 'Alex',
  },
};

function Test() {
  const { translate } = useLocalize();

  return translate('name');
}

const App = () => {

  return (
    <LocalizationProvider
      locale="en"
      translations={TRANSLATIONS}
    >
      <Test />
    </LocalizationProvider>
  );
}

ReactDOM.render(<App />, node); // "Alex" will be rendered
```

### contextType

Alternative way of usage inside class components:

```js
class Translation extends React.PureComponent {
  render() {
    return (
      <span>
        {this.context.translate('name')}
      </span>
    )
  }
}

Translation.contextType = LocalizationContext;

const App = () => {
  return (
    <LocalizationProvider
      locale="en"
      translations={TRANSLATIONS}
    >
      <Translation />
    </LocalizationProvider>
  );
}

ReactDOM.render(<App />, node); // "Alex" will be rendered
```

### locale
Locale could be passed in short or long option.


Valid examples:

```
en-us
EN_US
en
eN-uS
```

If there is no exact match in translations, then the value of locale will be sanitized and formatted to **lower_case_separate_by_underscore**. Make sure you provide translations object with keys in this format. If translations for long locale will not be found, and translations will be found for shorten alternative - that version will be used

## Restriction

At least `React 16.8.0` is required to use this library, because new React Context API & React Hooks

## Contributing

`localize-react` is open-source library, opened for contributions

### Tests

**Current test coverage is 100%**

`jest` is used for tests. To run tests:

```sh
yarn test
```

### License

localize-react is [MIT licensed](https://github.com/yankouskia/localize-react/blob/master/LICENSE)
