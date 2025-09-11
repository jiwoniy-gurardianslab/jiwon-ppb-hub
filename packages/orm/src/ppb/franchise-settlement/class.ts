import { Prisma as PrismaPpb } from '../../../generated/ppb';
import { Decimal } from '../../../generated/ppb/runtime/library';

import { PrismaPpbClientWrapper as PrismaPpbClient } from '../../wrapper';

export default class FranchiseSettlement {
  constructor(private prisma: PrismaPpbClient) {}

  private getBaseWhere(franchiseId: number, fromDate: Date, endDate: Date): PrismaPpb.OrdersWhereInput {
    const where: PrismaPpb.OrdersWhereInput = {
      franchiseId: {
        equals: franchiseId,
      },
      orderType: {
        in: ['stock-pickup', 'purchase-reserv']
      },
      createdAt: {
        gte: fromDate,
        lte: endDate,
      }
    };

    return where;
  }

  async getPurchaseFeeForSettlement(franchiseId: number, fromDate: Date, endDate: Date) {
    const {
      success,
      data,
      error,
    } = await this.prisma.executeWrapper(() =>
      this.prisma.orders.aggregate({
        _count: true,
        _sum: {
          priceTotalKrw: true,
          priceDiscountsKrw: true, // rails에서는 priceDiscrounts 사용되고 있긴 함
        },
        where: {
          ...this.getBaseWhere(franchiseId, fromDate, endDate),
        },
      })
    );

    if (success) {
      const { _sum: { priceTotalKrw, priceDiscountsKrw }, _count } = data;
      return {
        success,
        data: {
          total: priceTotalKrw,
          discount: priceDiscountsKrw,
          count: _count,
        },
      }
    }

    return {
      success,
      error,
    };
  }

  async getPurchaseCanceledForSettlement(franchiseId: number, fromDate: Date, endDate: Date) {
    const {
      success,
      data: list,
      error,
    } = await this.prisma.executeWrapper(() =>
      this.prisma.orders.findMany({
        orderBy: { id: 'asc' },
        select: {
          franchiseId: true,
          noshowedAt: true,
          priceTotalKrw: true,
          priceDiscountsKrw: true,
          priceCancelRefundKrw: true,
        },
        where: {
          ...this.getBaseWhere(franchiseId, fromDate, endDate),
          shippingStartedAt: {
            equals: null,
          },
          AND: {
            OR: [
              {
                customerCanceledAt: {
                  gte: fromDate,
                  lte: endDate,
                }
              },
              {
                franchiseDeniedAt: {
                  gte: fromDate,
                  lte: endDate,
                }
              },
              {
                noshowedAt: {
                  gte: fromDate,
                  lte: endDate,
                }
              },
            ]
          }
        },
      })
    );

    if (success) {
      const value = list.map((data) => {
        const { noshowedAt, priceTotalKrw, priceDiscountsKrw, priceCancelRefundKrw } = data;
        if (noshowedAt) {
          return priceTotalKrw.minus(priceDiscountsKrw);
        }
        return priceCancelRefundKrw;
      });
      const sum = value.reduce((acc, current) => acc.plus(current), new Decimal(0));
      return {
        success,
        data: sum,
      }
    }

    return {
      success,
      error,
    };
  }
}
