import * as lib from './index';

describe('lib', () => {
  it('provides non-breaking changes', () => {
    const keys = Object.keys(lib);

    expect(keys).toMatchSnapshot();
  });
});
