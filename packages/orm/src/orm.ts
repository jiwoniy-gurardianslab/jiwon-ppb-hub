// import { PrismaClient } from '@prisma/client';

import {
  PpbPrismaClient,
  PrismaPpbClientWrapper,
} from './wrapper';

// TODO 싱글톤 서비스로 구현
// 현재는 Global로 싱글톤으로 강제되긴 함
// https://www.prisma.io/docs/orm/reference/prisma-client-reference#prismaclient
export class PpbOrmInitService {
  private prisma: PpbPrismaClient;

  constructor(datasourceUrl: string, logLevel: ('query' | 'info' | 'warn' | 'error')[]) {
    process.env.DATABASE_PPB_URL = datasourceUrl;

    const prismaInstance = new PpbPrismaClient({
      datasources: {
        db: {
          url: datasourceUrl,
        },
      },
      log: logLevel.map(level => ({ level, emit: 'event' as const })),
    });

    prismaInstance.$on('error', (e) => {
      console.error(`[Prisma Error]: ${JSON.stringify(e, null, 2)}`);
    });

    prismaInstance.$on('warn', (e) => {
      console.warn(`[Prisma Warning]: ${JSON.stringify(e, null, 2)}`);
    });

    prismaInstance.$on('info', (e) => {
      console.info(`[Prisma Info]: ${JSON.stringify(e, null, 2)}`);
    });

    prismaInstance.$on('query', (e) => {
      console.log('Query: ' + e.query)
      console.log('Params: ' + e.params)
      console.log('Duration: ' + e.duration + 'ms')
    });

    this.prisma = prismaInstance;
  }

  getPrismaClient(): PrismaPpbClientWrapper {
    return new PrismaPpbClientWrapper(this.prisma);
  }
}
