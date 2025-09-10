import { DBError } from './error';

export type DatabaseOptions = {
  database: 'postgresql',
  username: string;
  password: string;
  host: string;
  port: string;
  databaseName: string;
  schema: string;
}

export type SuccessResponse<T = undefined> = {
  success: true;
  data: T;
  cursor?: number | string | undefined;
  error?: never;
}

export type ErrorResponse = {
  success: false;
  error: DBError;
  data?: never;
  cursor?: never;
}