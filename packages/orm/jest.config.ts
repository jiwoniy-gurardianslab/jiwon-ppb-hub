import { jestBaseConfig } from '@ppb/config';

export default {
  ...jestBaseConfig,
  setupFiles: ['<rootDir>/setup.jest.ts'],
};