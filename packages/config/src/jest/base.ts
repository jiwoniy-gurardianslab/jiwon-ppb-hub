import type { Config } from 'jest';

const baseConfig: Config = {
  // TypeScript 지원
  preset: 'ts-jest',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testEnvironment: 'node',

  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx'
      }
    }],
  },
  // 모듈 확장자
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  coverageDirectory: 'coverage',
  // 커버리지 설정
  collectCoverageFrom: [
    'src/**/*.(ts|tsx|js|jsx)',
    '!src/**/*.d.ts',
    '!src/**/*.stories.*'
  ],
  // 테스트 파일 패턴
  testMatch: [
    '**/__tests__/**/*.{ts,tsx}',
    '**/?(*.)+(spec|test).{ts,tsx}'
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

  testTimeout: 10000,
  verbose: process.env.CI ? false : true
};

export default baseConfig;
