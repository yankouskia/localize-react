import { describe, expect, it } from 'vitest';

import * as publicApi from './index.js';

describe('public API', () => {
  it('exports exactly the documented surface', () => {
    expect(Object.keys(publicApi).sort()).toEqual(
      [
        'LocalizationConsumer',
        'LocalizationContext',
        'LocalizationProvider',
        'Message',
        'useLocalize',
      ].sort(),
    );
  });
});
