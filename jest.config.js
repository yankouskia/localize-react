module.exports = {
  collectCoverage: false,
  collectCoverageFrom: [
    '**/src/**.{js,jsx}',
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['json', 'html'],
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
  ],
  modulePaths: ['./src'],
  testMatch: [`<rootDir>/src/**/*.test.js`],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  unmockedModulePathPatterns: [
    'node_modules/react/',
  ],
  verbose: true,
};
