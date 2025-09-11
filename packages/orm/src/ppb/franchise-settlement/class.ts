import { Prisma as PrismaPpb } from '../../../generated/ppb';
import { Decimal } from '../../../generated/ppb/runtime/library';

import { PrismaPpbClientWrapper as PrismaPpbClient } from '../../wrapper';
import { SuccessResponse, ErrorResponse } from '../../types';

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

  private getCancelWhere(fromDate: Date, endDate: Date): PrismaPpb.OrdersWhereInput {
    const where: PrismaPpb.OrdersWhereInput = {
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
    }

    return where;
  }

  // 전체금액
  async getPurchaseFeeAmount(franchiseId: number, fromDate: Date, endDate: Date, isCancel: boolean = false): Promise<SuccessResponse<string> | ErrorResponse> {
     const where = isCancel ? {
      ...this.getBaseWhere(franchiseId, fromDate, endDate),
      ...this.getCancelWhere(fromDate, endDate),
    } : this.getBaseWhere(franchiseId, fromDate, endDate);

    if (isCancel) {
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
          where,
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
          data: sum.toString(),
        }
      }

      return {
        success,
        error,
      };
    } else {
      const {
        success,
        data,
        error,
      } = await this.prisma.executeWrapper(() =>
        this.prisma.orders.aggregate({
          // _count: true,
          _sum: {
            priceTotalKrw: true,
            priceDiscountsKrw: true, // rails에서는 priceDiscrounts 사용되고 있긴 함
          },
          where,
        })
      );

      if (success) {
        const { _sum: { priceTotalKrw, priceDiscountsKrw } } = data;
        const total = priceTotalKrw ? priceTotalKrw : new Decimal(0);
        const discount = priceDiscountsKrw ? priceDiscountsKrw : new Decimal(0);
        return {
          success,
          data: total.minus(discount).toString(),
        }
      }

      return {
        success,
        error,
      };
    }
  }

  async getPurchaseSupportAmount(franchiseId: number, fromDate: Date, endDate: Date, isCancel: boolean = false): Promise<SuccessResponse<string> | ErrorResponse> {
    const where = isCancel ? {
      ...this.getBaseWhere(franchiseId, fromDate, endDate),
      ...this.getCancelWhere(fromDate, endDate),
    } : this.getBaseWhere(franchiseId, fromDate, endDate);

    const {
      success,
      data: list,
      error,
    } = await this.prisma.executeWrapper(() =>
      this.prisma.orders.findMany({
        where,
        select: {
          orderItems: {
            select: {
              itemType: true,
              price: true,
              compareAtPrice: true,
              totalDiscount: true,
              orderDiscountFraction: true,
              pointDiscountFraction: true,
              orderSubItems: {
                select: {
                  orderItemId: true,
                  productId: true,
                  variantId: true,
                  packCount: true,
                  productVariant: {
                    select: {
                      productId: true,
                      productVariantPrices: {
                        where: {
                          priceType: 'compare_at'
                        },
                        select: {
                          productId: true,
                          productVariantId: true,
                          packCount: true,
                          price: true,
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          franchiseId: 'asc'
        }
      })
    );

    if (success) {
      const supportFundByFranchise = list.reduce((acc, order) => {
        order.orderItems.forEach((item) => {
          let amount = new Decimal(0);
          
          if (item.itemType === 'SINGLE') {
            amount = item.compareAtPrice ? item.compareAtPrice.minus(item.price || new Decimal(0))
              .plus(item.totalDiscount || new Decimal(0))
              .plus(item.orderDiscountFraction || new Decimal(0))
              .plus(item.pointDiscountFraction || new Decimal(0))
            : new Decimal(0);
          } else if (item.itemType === 'BUNDLE') {
            const bundleCompareAtPrice = item.orderSubItems.reduce((sum, subItem) => {
              const matchingPrice = subItem.productVariant?.productVariantPrices?.find(
                price => price.productId === subItem.productId && 
                        price.packCount === subItem.packCount
              );
              return sum.plus(matchingPrice ? matchingPrice.price ? matchingPrice.price: new Decimal(0) : new Decimal(0));
            }, new Decimal(0));

            amount = bundleCompareAtPrice.minus(item.price || new Decimal(0))
              .plus(item.totalDiscount || new Decimal(0))
              .plus(item.orderDiscountFraction || new Decimal(0))
              .plus(item.pointDiscountFraction || new Decimal(0));
            // .plus(item.totalDiscount || new Decimal(0))
            //         (item.orderDiscountFraction || new Decimal(0)) + 
            //         (item.pointDiscountFraction || new Decimal(0));
          }
          acc = acc.plus(amount);
        });

      return acc;
    }, new Decimal(0));

      return {
        success,
        data: supportFundByFranchise.toString(),
      }
    }

    return {
      success,
      error,
    };
  }
}
