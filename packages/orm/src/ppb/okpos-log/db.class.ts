import { Prisma as PrismaPpb } from '../../generated/ppb';

import { isDefined } from '../../utils';
import { PrismaPpbClientWrapper as PrismaPpbClient } from '../../wrapper';
import type { SuccessResponse, ErrorResponse } from '../../types';
import type { DTO, OkposLogType, OkposProcessingStatus } from './dto';

export default class DBOkposLogs {
  constructor(private prisma: PrismaPpbClient) {}

  async create(inputData: Partial<DTO['CreateInput']>): Promise<SuccessResponse<DTO['Entity']> | ErrorResponse> {
    const input: PrismaPpb.OkposLogsCreateInput = {
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    if (isDefined(inputData.orderNo)) {
      input.orderNo = inputData.orderNo;
    }

    if (isDefined(inputData.logType)) {
      input.logType = inputData.logType;
    }

    if (isDefined(inputData.processingStatus)) {
      input.processingStatus = inputData.processingStatus;
    }

    if (isDefined(inputData.orderId)) {
      input.order = {
        connect: {
          id: BigInt(inputData.orderId),
        }
      }
    }

    if (isDefined(inputData.raw)) {
      input.raw = inputData.raw;
    }

    if (isDefined(inputData.responseBody)) {
      input.responseBody = inputData.responseBody;
    }

    const { success, data, error } = await this.prisma.executeWrapper(() =>
      this.prisma.okposLogs.create({
        data: input,
      })
    );

    if (success) {
      return {
        success,
        data: {
          ...data,
          id: data.id.toString(),
          logType: data.logType as OkposLogType,
          processingStatus: data.processingStatus as OkposProcessingStatus,
          orderId: data.orderId ? data.orderId.toString() : null,
        },
      }
    }

    return {
      success,
      error,
    }
  }

  async update(id: string, inputData: Partial<DTO['UpdateInput']>): Promise<SuccessResponse<DTO['Entity']> | ErrorResponse> {
    const input: PrismaPpb.OkposLogsUpdateInput = {
      updatedAt: new Date(),
    }

    if (isDefined(inputData.processingStatus)) {
      input.processingStatus = inputData.processingStatus;
    }

    if (isDefined(inputData.orderId)) {
      input.order = {
        connect: {
          id: BigInt(inputData.orderId),
        }
      }
    }

    const { success, data, error } = await this.prisma.executeWrapper(() =>
      this.prisma.okposLogs.update({
        where: {
          id: BigInt(id),
        },
        data: input,
      })
    );

    if (success) {
      return {
        success,
        data: {
          ...data,
          id: data.id.toString(),
          logType: data.logType as OkposLogType,
          processingStatus: data.processingStatus as OkposProcessingStatus,
          orderId: data.orderId ? data.orderId.toString() : null,
        },
      }
    }

    return {
      success,
      error,
    }
  }
}
