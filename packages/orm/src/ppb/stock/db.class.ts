import { Prisma as PrismaPpb } from '../../generated/ppb';
// import { Decimal } from '../../generated/ppb/runtime/library';

import { PrismaPpbClientWrapper as PrismaPpbClient } from '../../wrapper';
import { isDefined } from '../../utils';
import type { SuccessResponse, ErrorResponse } from '../../types';
import type { StockDTO, StockHistoryDTO, StockTransactionType } from './dto';
// import { HeadOfficeFranchiseId } from './constants';

// stock
const StockBaseSelectOption = {
  id: true,
  sku: true,
  available: true,
  lastAdjustedAt: true,
  createdAt: true,
  updatedAt: true,
  barcode: true,
  franchiseId: true,
  outOfStock: true,
  outOfStockedAt: true,
  averagePrice: true,
} as const satisfies PrismaPpb.StocksSelect;

type StockSelectBase = PrismaPpb.StocksGetPayload<{
  select: typeof StockBaseSelectOption;
}>;

const StockHistoriesBaseSelectOption = {
  id: true,
  stockId: true,
  transactionType: true,
  transactionQuantity: true,
  stockHistoriableType: true,
  stockHistoriableId: true,
  available: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies PrismaPpb.StockHistoriesSelect;

type StockHistoriesSelectBase = PrismaPpb.StockHistoriesGetPayload<{
  select: typeof StockHistoriesBaseSelectOption;
}>;

export default class DBStocks {
  constructor(private prisma: PrismaPpbClient) {}

  private transformStockEntity(entity: StockSelectBase): StockDTO['Entity'] {
    const { id, franchiseId, averagePrice } = entity;
    return {
      ...entity,
      id: id.toString(),
      franchiseId: franchiseId ? franchiseId.toString() : null,
      averagePrice: averagePrice ? averagePrice.toString() : null,
    }
  }

  private transformStockHistoriesEntity(entity: StockHistoriesSelectBase): StockHistoryDTO['Entity'] {
    const { id, transactionType, stockId, stockHistoriableId, transactionQuantity } = entity;
    return {
      ...entity,
      id: id.toString(),
      stockId: stockId.toString(),
      transactionType: transactionType as StockTransactionType,
      stockHistoriableId: stockHistoriableId ? stockHistoriableId.toString() : null,
      transactionQuantity: transactionQuantity ? transactionQuantity.toString() : null,
    }
  }

  async findStockBySku(franchiseId: string, sku: string): Promise<SuccessResponse<StockDTO['Entity'][]> | ErrorResponse> {
    const { success, data: list, error } = await this.prisma.executeWrapper(() => this.prisma.stocks.findMany({
      where: {
        sku,
        franchiseId: BigInt(franchiseId),
      },
      select: StockBaseSelectOption,
    }));

    if (success) {
      return {
        success,
        data: list.map((data) => {
          return this.transformStockEntity(data)
        }),
      }
    }

    return {
      success,
      error,
    }
  }

  async create(inputData: Partial<StockDTO['Create']>): Promise<SuccessResponse<StockDTO['Entity']> | ErrorResponse> {
    const input: PrismaPpb.StocksCreateInput = {
      createdAt: new Date(),
      updatedAt: new Date(),
      available: 0,
    }

    if (isDefined(inputData.franchiseId)) {
      input.franchise = {
        connect: {
          id: BigInt(inputData.franchiseId),
        }
      }
    }

    if (isDefined(inputData.sku)) {
      input.sku = inputData.sku;
    }

    if (isDefined(inputData.barcode)) {
      input.barcode = inputData.barcode;
    }

    const { success, data, error } = await this.prisma.executeWrapper(() =>
      this.prisma.stocks.create({
        data: input,
        select: StockBaseSelectOption,
      })
    );

    if (success) {
      return {
        success,
        data: this.transformStockEntity(data)
      }
    }

    return {
      success,
      error,
    }
  }

  async update(id: string, inputData: Partial<StockDTO['Update']>): Promise<SuccessResponse<StockDTO['Entity']> | ErrorResponse> {
    const input: PrismaPpb.StocksUpdateInput = {
      updatedAt: new Date(),
    }

    if (isDefined(inputData.barcode)) {
      input.barcode = inputData.barcode;
    }
    if (isDefined(inputData.available)) {
      input.available = inputData.available;
    }
    if (isDefined(inputData.lastAdjustedAt)) {
      input.lastAdjustedAt = inputData.lastAdjustedAt;
    }
    if (isDefined(inputData.outOfStock)) {
      input.outOfStock = inputData.outOfStock;
    }
    if (isDefined(inputData.outOfStockedAt)) {
      input.outOfStockedAt = inputData.outOfStockedAt;
    }
    if (isDefined(inputData.averagePrice)) {
      input.averagePrice = inputData.averagePrice;
    }

    const { success, data, error } = await this.prisma.executeWrapper(() =>
      this.prisma.stocks.update({
        where: {
          id: BigInt(id),
        },
        data: input,
        select: StockBaseSelectOption,
      })
    );

    if (success) {
      return {
        success,
        data: this.transformStockEntity(data)
      }
    }

    return {
      success,
      error,
    }
  }

  async createStockHistory(stockId: string, inputData: Partial<StockHistoryDTO['Create']>): Promise<SuccessResponse<StockHistoryDTO['Entity']> | ErrorResponse> {
    const input: PrismaPpb.StockHistoriesCreateInput = {
      createdAt: new Date(),
      updatedAt: new Date(),
      stock: {
        connect: {
          id: BigInt(stockId),
        },
      },
    }

    if (isDefined(inputData.transactionType)) {
      input.transactionType = inputData.transactionType;
    }

    if (isDefined(inputData.transactionQuantity)) {
      input.transactionQuantity = inputData.transactionQuantity;
    }

    if (isDefined(inputData.stockHistoriableType)) {
      input.stockHistoriableType = inputData.stockHistoriableType;
    }

    if (isDefined(inputData.stockHistoriableId)) {
      input.stockHistoriableId = BigInt(inputData.stockHistoriableId);
    }

    if (isDefined(inputData.available)) {
      input.available = inputData.available;
    }

    const { success, data, error } = await this.prisma.executeWrapper(() =>
      this.prisma.stockHistories.create({
        data: input,
        select: StockHistoriesBaseSelectOption,
      })
    );

    if (success) {
      return {
        success,
        data: this.transformStockHistoriesEntity(data),
      }
    }

    return {
      success,
      error,
    }
  }
}
