// import { Prisma as PrismaPpb } from '../../../generated/ppb';

import { PrismaPpbClientWrapper as PrismaPpbClient } from '../../wrapper';

export default class PpbOrderSettlement {
  constructor(private prisma: PrismaPpbClient) {}

  async findList() {
    const {
      success,
      data: list,
      error,
    } = await this.prisma.executeWrapper(() =>
      this.prisma.orders.findMany({
        where: {
          id: {
            in: [],
          }
        },
      })
    );

      if (success) {
        // const rtnCursor = list.length ? list[list.length - 1].id : undefined;
        return {
          success,
          data: list,
      }

      return {
        success,
        error,
      };
    }
  }
}
