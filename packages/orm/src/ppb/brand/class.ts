// import type { DTO, Query, Cursor } from '@ppb/types';
// import type { Prisma as PrismaPpb } from '../../../generated/ppb';

import { PrismaPpbClientWrapper } from '../../wrapper';
// import { getSkipAndTake, isDefined } from '../../utils';
import { SuccessResponse, ErrorResponse } from '../../types';
// import { DefaultTake, DefaultPerPage } from '../../constants';

export default class PpbBrand {
  constructor(private prisma: PrismaPpbClientWrapper) {}

  async findList(): Promise<SuccessResponse<any> | ErrorResponse> {
    const { success, data: list, error } = await this.prisma.executeWrapper(() => this.prisma.brands.findMany());

    if (success) {
      const rtnCursor = list.length ? list[list.length - 1].id : undefined;

      return {
        success,
        data: list,
        cursor: rtnCursor?.toString(),
      }
    }

    return {
      success,
      error,
    }
  }
  
  async getCount(): Promise<SuccessResponse<number> | ErrorResponse> {

    const { success, data, error } = await this.prisma.executeWrapper(() => this.prisma.brands.count());

    if (success) {
      return {
        success,
        data,
      };
    }

    return {
      success,
      error,
    }
  }
}