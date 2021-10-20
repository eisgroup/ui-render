const {modulesToTranspile, monoreposToResolve} = require('./config')
module.exports = {
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/cypress/**',
  ],
  setupFilesAfterEnv: ['<rootDir>/jestSetup.js'],
  testPathIgnorePatterns: ['node_modules/', '.next/', 'cypress/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest',
    '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
  },
  // @Note: `ignore` patterns set inside babel.config.js will not be used by Jest
  transformIgnorePatterns: [
    `node_modules/(?!(${modulesToTranspile.join('|')})/)`,
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  moduleNameMapper: {
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',

    // Resolver for internal monorepo packages to prefix import path with `src`
    ...monoreposToResolve.length && {[`^(${monoreposToResolve.join('|')})(.*)$`]: '<rootDir>/packages/$1/src$2'},
  },
}
