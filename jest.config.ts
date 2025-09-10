import type { Config } from 'jest';

const baseConfig: Config = {
  projects: [
    '<rootDir>/packages/*',
    '<rootDir>/apps/*',
  ],

  // 모듈 해석
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^~/(.*)$': '<rootDir>/$1'
  },

  // 무시할 패턴
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/'
  ],

  // TypeScript 지원
  preset: 'ts-jest',
  testEnvironment: 'node',

  testTimeout: 10000,
  verbose: process.env.CI ? false : true
};

export default baseConfig;
