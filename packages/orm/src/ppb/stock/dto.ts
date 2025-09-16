// import { Prisma as PrismaPpb } from '../../generated/ppb';

export type StockTransactionType = 'sold' | 'hold' | 'restock' | 'adjust';

export type StockDTO = {
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

export type StockHistoryDTO = {
  Entity: {
    id: string;
    stockId: string;
    transactionType: StockTransactionType | null;
    transactionQuantity: string | null;
    stockHistoriableType: string | null;
    stockHistoriableId: string | null;
    available: number | null;
    createdAt: Date;
    updatedAt: Date;
  },
  Create: {
    transactionType: string;
    transactionQuantity: string;
    stockHistoriableType: string;
    stockHistoriableId: string;
    available: number;
  },
}