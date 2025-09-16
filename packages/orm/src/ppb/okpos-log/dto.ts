import { Prisma as PrismaPpb } from '../../generated/ppb';

export type OkposLogType = 'walk-in-create' | 'walk-in-cancel' | 'sale-status';
export type OkposProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type DTO = {
  Entity: {
    id: string;
    orderNo: string | null;
    raw: PrismaPpb.JsonValue;
    logType: OkposLogType;
    processingStatus: OkposProcessingStatus;
    orderId: string | null;
    createdAt: Date;
    updatedAt: Date;
    responseBody: PrismaPpb.JsonValue;
  },
  CreateInput: {
    orderNo: string;
    raw: PrismaPpb.JsonValue;
    logType: OkposLogType;
    processingStatus: OkposProcessingStatus;
    orderId: string;
    createdAt: Date;
    updatedAt: Date;
    responseBody: PrismaPpb.JsonValue;
  },
  UpdateInput: {
    processingStatus: OkposProcessingStatus;
    orderId: string;
    updatedAt: Date;
  }
}