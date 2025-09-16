import { Prisma as PrismaPpb } from '../../generated/ppb';

import { isDefined } from '../../utils';
import { PrismaPpbClientWrapper as PrismaPpbClient } from '../../wrapper';
import type { SuccessResponse, ErrorResponse } from '../../types';
import type { DTO, OkposLogType, OkposProcessingStatus } from './dto';

const BaseSelectOption = {
  id: true,
  orderNo: true,
  raw: true,
  logType: true,
  processingStatus: true,
  orderId: true,
  createdAt: true,
  updatedAt: true,
  responseBody: true,
} as const satisfies PrismaPpb.OkposLogsSelect;

type OkposLogsSelectBase = PrismaPpb.OkposLogsGetPayload<{
  select: typeof BaseSelectOption;
}>;

export default class DBOkposLogs {
  constructor(private prisma: PrismaPpbClient) {}

   private transformEntity(entity: OkposLogsSelectBase): DTO['Entity'] {
    const { id, logType, processingStatus, orderId } = entity;
    return {
      ...entity,
      id: id.toString(),
      logType: logType as OkposLogType,
      processingStatus: processingStatus as OkposProcessingStatus,
      orderId: orderId ? orderId.toString() : null,
    }
  }

  async create(inputData: Partial<DTO['Create']>): Promise<SuccessResponse<DTO['Entity']> | ErrorResponse> {
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
        select: BaseSelectOption,
      })
    );

    if (success) {
      return {
        success,
        data: this.transformEntity(data),
      }
    }

    return {
      success,
      error,
    }
  }

  async update(id: string, inputData: Partial<DTO['Update']>): Promise<SuccessResponse<DTO['Entity']> | ErrorResponse> {
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
        select: BaseSelectOption,
      })
    );

    if (success) {
      return {
        success,
        data: this.transformEntity(data),
      }
    }

    return {
      success,
      error,
    }
  }
}
