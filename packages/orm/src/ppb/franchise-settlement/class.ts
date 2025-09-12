import { Prisma as PrismaPpb } from '../../generated/ppb';
import { Decimal } from '../../generated/ppb/runtime/library';

import { PrismaPpbClientWrapper as PrismaPpbClient } from '../../wrapper';
import { SuccessResponse, ErrorResponse } from '../../types';

/* 구매예약, 바로드림 구매에 대한 정산 */
export default class BizFranchiseSettlement {
  constructor(private prisma: PrismaPpbClient) {}

  // 정산을 위해 이전달 시작 ~ 종료 계산
  getPreviousMonthRange(): { fromDate: Date; toDate: Date; } {
    const now = new Date();
    const koreaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));

    const year = koreaTime.getFullYear();
    const month = koreaTime.getMonth(); // 0-based (0 = January)
    
    // 이전 달 계산
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonth = month === 0 ? 11 : month - 1;
    
    const fromDate = new Date(prevYear, prevMonth, 1);
    const toDate = new Date(prevYear, prevMonth + 1, 0, 23, 59, 59, 999);
    
    return { fromDate, toDate };
  }

  // 바로드림, 구매예약
  private getStockSalesBaseCondition(franchiseId: number, fromDate: Date, endDate: Date): PrismaPpb.OrdersWhereInput {
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

  // 바로드림, 구매예약 취소 조건
  private getStockSalesCancelCondition(fromDate: Date, endDate: Date): PrismaPpb.OrdersWhereInput {
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

  private getShippingSalesBaseCondition(franchiseId: number, fromDate: Date, endDate: Date): PrismaPpb.OrdersWhereInput {
    const where: PrismaPpb.OrdersWhereInput = {
      franchiseId: {
        equals: franchiseId,
      },
      orderType: {
        in: ['shipping-pickup']
      },
      createdAt: {
        gte: fromDate,
        lte: endDate,
      }
    };

    return where;
  }

  private getShippingSalesCancelCondition(fromDate: Date, endDate: Date): PrismaPpb.OrdersWhereInput {
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
        ]
      }
    }

    return where;
  }

  private getShippingSalesReturnCondition(fromDate: Date, endDate: Date): PrismaPpb.OrdersWhereInput {
    const where: PrismaPpb.OrdersWhereInput = {
      shippingReturnedAt: {
        gte: fromDate,
        lte: endDate,
      },
    }

    return where;
  }


  // 바로드림, 구매예약
  // 전체 판매금액 
  // 판매금액 - 취소 금액
  // 판매금액 => priceSalesKrw = priceTotalKrw - priceDiscountsKrw
  // isCancel = false => 전체 판매금액
  // isCancel = true => 취소된 금액
  async getStockSalesAmount(franchiseId: number, isCancel: boolean = false): Promise<SuccessResponse<string> | ErrorResponse> {
    const { fromDate, toDate } = this.getPreviousMonthRange();
     const where = isCancel ? {
      ...this.getStockSalesBaseCondition(franchiseId, fromDate, toDate),
      ...this.getStockSalesCancelCondition(fromDate, toDate),
    } : this.getStockSalesBaseCondition(franchiseId, fromDate, toDate);

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

  // 바로드림, 구매예약
  // 할인지원금
  // 판매금액 할인지원금 - 취소 금액 할인지원금
  // isCancel = false => 전체 판매금액 할인지원금
  // isCancel = true => 취소된 금액 할인지원금
  async getStockSalesSupportAmount(franchiseId: number, isCancel: boolean = false): Promise<SuccessResponse<string> | ErrorResponse> {
    const { fromDate, toDate } = this.getPreviousMonthRange();
    const where = isCancel ? {
      ...this.getStockSalesBaseCondition(franchiseId, fromDate, toDate),
      ...this.getStockSalesCancelCondition(fromDate, toDate),
    } : this.getStockSalesBaseCondition(franchiseId, fromDate, toDate);

    const {
      success,
      data: list,
      error,
    } = await this.prisma.executeWrapper(() =>
      this.prisma.orders.findMany({
        where,
        select: {
          priceDiscountsKrw: true,
          // orderItems: {
          //   select: {
          //     itemType: true,
          //     price: true,
          //     compareAtPrice: true,
          //     totalDiscount: true,
          //     orderDiscountFraction: true,
          //     pointDiscountFraction: true,
          //     orderSubItems: {
          //       select: {
          //         orderItemId: true,
          //         productId: true,
          //         variantId: true,
          //         packCount: true,
          //         productVariant: {
          //           select: {
          //             productId: true,
          //             productVariantPrices: {
          //               where: {
          //                 priceType: 'compare_at'
          //               },
          //               select: {
          //                 productId: true,
          //                 productVariantId: true,
          //                 packCount: true,
          //                 price: true,
          //               }
          //             }
          //           }
          //         }
          //       }
          //     }
          //   }
          // }
        },
        orderBy: {
          franchiseId: 'asc'
        }
      })
    );

    if (success) {
      const totalAmount = list.reduce((acc, order) => {
        // 이게 맞는건지 아래가 맞는건지 확인 필요
        acc = acc.plus(order.priceDiscountsKrw);

        // order.orderItems.forEach((item) => {
        //   let amount = new Decimal(0);
        //   // compareAtPrice - 정가
        //   // totalDiscount - 쿠폰 할인 금액2 (총 할인 금액의 역할을 하지 않음)
        //   // orderDiscountFraction 주문서 쿠폰 할인금액 (비율로 계산된 금액)
        //   // point_discount_fraction - 포인트 할인금액 (비율로 계산된 금액)
          
        //   if (item.itemType === 'SINGLE') {
        //     amount = item.compareAtPrice ? item.compareAtPrice.minus(item.price || new Decimal(0))
        //       .plus(item.totalDiscount || new Decimal(0))
        //       .plus(item.orderDiscountFraction || new Decimal(0))
        //       .plus(item.pointDiscountFraction || new Decimal(0))
        //     : new Decimal(0);
        //   } else if (item.itemType === 'BUNDLE') {
        //     const bundleCompareAtPrice = item.orderSubItems.reduce((sum, subItem) => {
        //       const matchingPrice = subItem.productVariant?.productVariantPrices?.find(
        //         price => price.productId === subItem.productId && 
        //                 price.packCount === subItem.packCount
        //       );
        //       return sum.plus(matchingPrice ? matchingPrice.price ? matchingPrice.price: new Decimal(0) : new Decimal(0));
        //     }, new Decimal(0));

        //     amount = bundleCompareAtPrice.minus(item.price || new Decimal(0))
        //       .plus(item.totalDiscount || new Decimal(0))
        //       .plus(item.orderDiscountFraction || new Decimal(0))
        //       .plus(item.pointDiscountFraction || new Decimal(0));
        //   }
        //   acc = acc.plus(amount);
        // });

      return acc;
    }, new Decimal(0));

      return {
        success,
        data: totalAmount.toString(),
      }
    }

    return {
      success,
      error,
    };
  }

  // 일단 만들어둠
  async getShippingSalesAmount(franchiseId: number, calcualteType: 'sale' | 'cancel' | 'return' = 'sale'): Promise<SuccessResponse<string> | ErrorResponse> {
    const { fromDate, toDate } = this.getPreviousMonthRange();
     const where = calcualteType === 'sale' ? this.getShippingSalesBaseCondition(franchiseId, fromDate, toDate)
      : calcualteType === 'cancel' ? {
        ...this.getShippingSalesBaseCondition(franchiseId, fromDate, toDate),
        ...this.getShippingSalesCancelCondition(fromDate, toDate)
      }
      : {
        ...this.getShippingSalesBaseCondition(franchiseId, fromDate, toDate),
        ...this.getShippingSalesReturnCondition(fromDate, toDate)
      }

    if (calcualteType === 'cancel') {
      const {
        success,
        data,
        error,
      } = await this.prisma.executeWrapper(() =>
        this.prisma.orders.aggregate({
          // _count: true,
          _sum: {
            priceCancelRefundKrw: true,
          },
          where,
        })
      );

      if (success) {
        const { _sum: { priceCancelRefundKrw } } = data;
        const total = priceCancelRefundKrw ? priceCancelRefundKrw : new Decimal(0);
        return {
          success,
          data: total.toString(),
        }
      }

      return {
        success,
        error,
      };
    } else if (calcualteType === 'return') {
      const {
        success,
        data,
        error,
      } = await this.prisma.executeWrapper(() =>
        this.prisma.orders.aggregate({
          // _count: true,
          _sum: {
            priceCancelRefundKrw: true,
          },
          where,
        })
      );

      if (success) {
        const { _sum: { priceCancelRefundKrw } } = data;
        const total = priceCancelRefundKrw ? priceCancelRefundKrw : new Decimal(0);
        return {
          success,
          data: total.toString(),
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
            priceDiscountsKrw: true,
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
}
