import { Prisma as PrismaPpb } from '../../generated/ppb';

export type OkposLogType = 'walk-in-create' | 'walk-in-cancel' | 'sale-status';
export type OkposProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type DTO = {
  Entity: {
    id: string;
    orderNo: string | null;
    raw: PrismaPpb.JsonValue;
    logType: OkposLogType;
    processingStatus: OkposProcessingStatus | null;
    orderId: string | null;
    createdAt: Date;
    updatedAt: Date;
    responseBody: PrismaPpb.JsonValue;
  },
  Create: {
    orderNo: string;
    raw: PrismaPpb.JsonValue;
    logType: OkposLogType;
    processingStatus: OkposProcessingStatus;
    orderId: string;
    createdAt: Date;
    updatedAt: Date;
    responseBody: PrismaPpb.JsonValue;
  },
  Update: {
    processingStatus: OkposProcessingStatus;
    orderId: string;
    updatedAt: Date;
  }
}