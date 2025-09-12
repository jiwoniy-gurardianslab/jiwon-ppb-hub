import { getPrismaClient } from '../../config';
import BizFranchiseSettlement from './class';

describe('Purchase fee for settlements', () => {
  const prismaInstance = getPrismaClient();
  let franchiseSettlement: BizFranchiseSettlement | null = null;

  beforeAll(async () => {
    try {
      prismaInstance.$connect();
      franchiseSettlement = new BizFranchiseSettlement(prismaInstance);  
    } catch (error: unknown) {
      console.error(error);
    }
  });
  
  afterAll(async () => {
    // await userClass?.clearData();
    prismaInstance.$disconnect();
  });

  // 바로드림 수수료는 판매금액의 0.05
  test.skip('[바로드림, 구매예약] 이번달 판매 금액', async () => {
    // 전체금액 * 0.05
    if (franchiseSettlement) {
      const { success: totalSuccess, data: totalFee } = await franchiseSettlement.getStockSalesAmount(10351);

      // 수수료는 0.05를 곱해야함
      if (totalSuccess) {
        console.log(totalFee);
      }
    }
  });

  test.skip('[바로드림, 구매예약] 이번달 판매취소 금액', async () => {
    // 전체금액 * 0.05
    if (franchiseSettlement) {
      const { success: totalSuccess, data: totalFee } = await franchiseSettlement.getStockSalesAmount(10351, true);

      // 수수료는 0.05를 곱해야함
      if (totalSuccess) {
        console.log(totalFee);
        // console.log(parseFloat(totalFee) * 0.05);
      }
    }
  });

  test.skip('[바로드림, 구매예약] 이번달 판매 지원금', async () => {
    if (franchiseSettlement) {
      const { success: totalSuccess, data: totalFee } = await franchiseSettlement.getStockSalesSupportAmount(10351);

      if (totalSuccess) {
        console.log(totalFee);
        // console.log(parseFloat(totalFee) * 0.5);
      }
    }
  });

  test.skip('[바로드림, 구매예약] 이번달 취소 판매 지원금', async () => {
    if (franchiseSettlement) {
      const { success: totalSuccess, data: totalFee } = await franchiseSettlement.getStockSalesSupportAmount(10351, true);

      if (totalSuccess) {
        console.log(totalFee);
        // console.log(parseFloat(totalFee) * 0.5);
      }
    }
  });
});