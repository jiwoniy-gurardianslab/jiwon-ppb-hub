import { PrismaPpbClientWrapper } from './wrapper';
import { PpbOrmInitService } from './orm';
import type { DatabaseOptions } from './types';

export const getPpbSetupDataInfo = (): DatabaseOptions => {
  return {
    database: process.env.PPB_DATABASE_TYPE,
    username: process.env.PPB_DATABASE_USERNAME,
    password: process.env.PPB_DATABASE_PASSWORD,
    host: process.env.PPB_DATABASE_HOST,
    port: process.env.PPB_DATABASE_PORT,
    databaseName: process.env.PPB_DATABASE_NAME,
    schema: process.env.PPB_DATABASE_SCHEMA,
  } as DatabaseOptions;
}

export function getDatabaseUrl({
  database,
  username,
  password,
  host,
  port,
  databaseName,
  schema,
}: DatabaseOptions) {
  return `${database}://${username}:${password}@${host}:${port}/${databaseName}?schema=${schema}`;
}

export function getPrismaClientWrapper(): PrismaPpbClientWrapper {
  const databaseInfo = getPpbSetupDataInfo();
  const databaseUrl = getDatabaseUrl(databaseInfo);
  // TODO 싱글톤 관리
  const ormService = new PpbOrmInitService(databaseUrl, ['info']);
  const prisma = ormService.getPrismaClient();
  return prisma;
}