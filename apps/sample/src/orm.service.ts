import {
  Injectable,
  // Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import { getPpbPrismaClient, PrismaPpbClientWrapper } from '@ppb/orm';

// https://www.prisma.io/docs/orm/reference/prisma-client-reference
@Injectable()
export class PpbOrmInitService implements OnModuleInit, OnModuleDestroy {
  // private readonly logger = new Logger(PartnerOrmInitService.name);
  private ppbClient: PrismaPpbClientWrapper;

  constructor() {
    // this.logger.log(`[constructor]: ${env}`);
    // this.logger.log(`[constructor]: ${databaseUrl}`);
    this.ppbClient = getPpbPrismaClient({
      database: 'postgresql',
      username: 'guardians',
      password: '1q2w3e$R',
      host: 'ppb-development-cluster.cluster-cohpkveydrp3.ap-northeast-2.rds.amazonaws.com',
      port: '5432',
      databaseName: 'ppb-development',
      schema: 'public',
    });
  }

  async onModuleInit() {
    try {
      // https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections
      await this.ppbClient.connect();
      console.log(`success`);
      // this.logger.log(`[onModuleInit] - success`);
    } catch (error: unknown) {
      console.log(`error: ${JSON.stringify(error)}`);
    }
  }

  async onModuleDestroy() {
    await this.ppbClient.disconnect();
  }

  getPrismaClient(): PrismaPpbClientWrapper {
    return this.ppbClient;
  }
}
