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

export function getPrismaClient(): PrismaPpbClientWrapper {
  const ormService = OrmServiceSingleton.getInstance();
  const prisma = ormService.getPrismaClient();
  return prisma;
}

export class OrmServiceSingleton {
  private static instance: PpbOrmInitService | null = null;
  
  public static getInstance(): PpbOrmInitService {
    if (!OrmServiceSingleton.instance) {
      const databaseInfo = getPpbSetupDataInfo();
      const databaseUrl = getDatabaseUrl(databaseInfo);
      OrmServiceSingleton.instance = new PpbOrmInitService(databaseUrl, ['info']);
    }
    
    return OrmServiceSingleton.instance;
  }
  
  // 테스트나 재초기화가 필요한 경우를 위한 메서드
  public static resetInstance(): void {
    OrmServiceSingleton.instance = null;
  }
}