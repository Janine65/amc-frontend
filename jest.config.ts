/* eslint-disable */
import type { Config } from 'jest';

const config: Config = {
  displayName: 'amc-interna',
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@model/(.*)$': '<rootDir>/src/app/models/$1',
    '^@shared/(.*)$': '<rootDir>/src/app/components/shared/$1',
    '^@service/(.*)$': '<rootDir>/src/app/service/$1',
    '^@environments/(.*)$': '<rootDir>/src/environments/$1',
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.html$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$|(?:\\.pnpm/)?(?:@angular|@ngrx|primeng|@primeuix|@primeui|@primeicons|@floating-ui|chart\\.js|ng2-charts|quill|@noble|tslib|rxjs|zone\\.js))'],
  moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs'],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!src/environments/**',
    '!src/**/index.ts',
  ],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
};

export default config;
