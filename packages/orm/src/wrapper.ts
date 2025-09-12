import {
  Prisma as PpbPrisma,
  PrismaClient as PpbPrismaClient
} from './generated/ppb';

import { SuccessResponse, ErrorResponse } from './types';
import { handlePrismaError } from './error';

// 타입과 클라이언트를 모두 export
// export * from '@prisma/client';
// export type * as PartnerTypes from '../generated/partner';
// export { PartnerPrisma, PartnerPrismaClient };
export { PpbPrisma, PpbPrismaClient };

export class PrismaPpbClientWrapper extends PpbPrismaClient {
  // @ts-ignore: prisma is kept for future use
  constructor(private prisma: PpbPrismaClient) {
    super();
  }

  async connect() {
    try {
      // https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections
      await this.prisma.$connect();
      console.log(`PpbPrismaClient connect success`);
    } catch (error: unknown) {
      if (error instanceof PpbPrisma.PrismaClientInitializationError) {
        console.error(`PpbPrismaClient connect error: ${error.message}`);
      }
    }
  }

  async disconnect() {
    try {
      await this.prisma.$disconnect();
      console.log(`PpbPrismaClient disconnect success`);
    } catch (error: unknown) {
      if (error instanceof PpbPrisma.PrismaClientInitializationError) {
        console.error(`PpbPrismaClient disconnect error: ${error.message}`);
      }
    }
  }

  /**
   * Prisma 작업을 감싸는 래퍼 함수
   * @param operation Prisma 메서드를 실행하는 비동기 함수
   * @returns operation의 결과
   */
  async executeWrapper<T>(operation: () => Promise<T>): Promise<SuccessResponse<T> | ErrorResponse> {
    try {
      const data = await operation();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: handlePrismaError(error),
      };
    }
  }
}
