import { Prisma as PrismaPpb } from '../../generated/ppb';
// import { Decimal } from '../../generated/ppb/runtime/library';

import { PrismaPpbClientWrapper as PrismaPpbClient } from '../../wrapper';
import { isDefined } from '../../utils';
import type { SuccessResponse, ErrorResponse } from '../../types';
import type { DTO } from './dto';
// import { HeadOfficeFranchiseId } from './constants';

const BaseSelectOption = {
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
  select: typeof BaseSelectOption;
}>;

export default class DBStocks {
  constructor(private prisma: PrismaPpbClient) {}

  private transformEntity(entity: StockSelectBase): DTO['Entity'] {
    const { id, franchiseId, averagePrice } = entity;
    return {
      ...entity,
      id: id.toString(),
      franchiseId: franchiseId ? franchiseId.toString() : null,
      averagePrice: averagePrice ? averagePrice.toString() : null,
    }
  }

  async findStockBySku(franchiseId: string, sku: string): Promise<SuccessResponse<DTO['Entity'][]> | ErrorResponse> {
    const { success, data: list, error } = await this.prisma.executeWrapper(() => this.prisma.stocks.findMany({
      where: {
        sku,
        franchiseId: BigInt(franchiseId),
      },
      select: BaseSelectOption,
    }));

    if (success) {
      return {
        success,
        data: list.map((data) => {
          return this.transformEntity(data)
        }),
      }
    }

    return {
      success,
      error,
    }
  }

  async create(inputData: Partial<DTO['Create']>): Promise<SuccessResponse<DTO['Entity']> | ErrorResponse> {
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
        select: BaseSelectOption,
      })
    );

    if (success) {
      return {
        success,
        data: this.transformEntity(data)
      }
    }

    return {
      success,
      error,
    }
  }

  async update(id: string, inputData: Partial<DTO['Update']>): Promise<SuccessResponse<DTO['Entity']> | ErrorResponse> {
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
        select: BaseSelectOption,
      })
    );

    if (success) {
      return {
        success,
        data: this.transformEntity(data)
      }
    }

    return {
      success,
      error,
    }
  }

}
