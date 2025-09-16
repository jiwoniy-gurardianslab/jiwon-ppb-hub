// import { Prisma as PrismaPpb } from '../../generated/ppb';

export type OkposLogType = 'walk-in-create' | 'walk-in-cancel' | 'sale-status';
export type OkposProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type DTO = {
  Entity: {
    id: string;
    sku: string | null;
    available: number;
    lastAdjustedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    barcode: string | null;
    franchiseId: string | null;
    outOfStock: boolean | null;
    outOfStockedAt: Date | null;
    averagePrice: string | null;
  },
  Create: {
    franchiseId: string;
    sku: string;
    barcode: string;
    available: number;
  },
  Update: {
    barcode: string;
    available: number;
    lastAdjustedAt: Date;
    outOfStock: boolean;
    outOfStockedAt: Date;
    averagePrice: string;
  }
}