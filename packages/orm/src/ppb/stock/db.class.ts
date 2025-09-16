import { Prisma as PrismaPpb } from '../../generated/ppb';
// import { Decimal } from '../../generated/ppb/runtime/library';

import { PrismaPpbClientWrapper as PrismaPpbClient } from '../../wrapper';
import { isDefined } from '../../utils';
import type { SuccessResponse, ErrorResponse } from '../../types';
import type { DTO } from './dto';
// import { HeadOfficeFranchiseId } from './constants';

const StockSelectOption = {
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
  select: typeof StockSelectOption;
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
      select: StockSelectOption,
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

  async create(inputData: Partial<DTO['CreateInput']>): Promise<SuccessResponse<DTO['Entity']> | ErrorResponse> {
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
        select: StockSelectOption,
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
