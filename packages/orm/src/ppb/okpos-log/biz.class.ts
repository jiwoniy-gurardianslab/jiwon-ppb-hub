import { Prisma as PrismaPpb } from '../../generated/ppb';

import { PrismaPpbClientWrapper as PrismaPpbClient } from '../../wrapper';
import type { SuccessResponse, ErrorResponse } from '../../types';
import type { DTO, OkposLogType, OkposProcessingStatus } from './dto';

import DBOkposLogs from './db.class';

export default class BizOkposLogs {
  private dBOkposLogs: DBOkposLogs;
  constructor(prisma: PrismaPpbClient) {
    this.dBOkposLogs = new DBOkposLogs(prisma);
  }

  createWalkInCreatePending(orderNo: string, raw: PrismaPpb.JsonValue, logType: OkposLogType, processingStatus: OkposProcessingStatus): Promise<SuccessResponse<DTO['Entity']> | ErrorResponse> {
    return this.dBOkposLogs.create({
      orderNo,
      raw,
      logType,
      processingStatus,
    });
  }

  updateStatus(id: string, processingStatus: OkposProcessingStatus, orderId: string): Promise<SuccessResponse<DTO['Entity']> | ErrorResponse> {
    return this.dBOkposLogs.update(id, {
      processingStatus,
      orderId,
    });
  }
}
