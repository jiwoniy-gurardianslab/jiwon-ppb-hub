import { getPrismaClient } from '../../config';
// import { DBError, DBErrorCode } from '../../error';
import FranchiseSettlement from './class';

function getPreviousMonthRange() {
  const now = new Date();
  const koreaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));

  const year = koreaTime.getFullYear();
  const month = koreaTime.getMonth(); // 0-based (0 = January)
  
  // 이전 달 계산
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonth = month === 0 ? 11 : month - 1;
  
  const fromDate = new Date(prevYear, prevMonth, 1);
  const toDate = new Date(prevYear, prevMonth + 1, 0, 23, 59, 59, 999);
  // const toDate = new Date(prevYear, prevMonth + 1, 0); // 다음 달 0일 = 현재 달 마지막 날
  
  return { fromDate, toDate };
}

describe('Purchase fee for settlements', () => {
  const prismaInstance = getPrismaClient();
  let franchiseSettlement: FranchiseSettlement | null = null;

  beforeAll(async () => {
    try {
      prismaInstance.$connect();
      franchiseSettlement = new FranchiseSettlement(prismaInstance);  
    } catch (error: unknown) {
      console.error(error);
    }
  });
  
  afterAll(async () => {
    // await userClass?.clearData();
    prismaInstance.$disconnect();
  });

  test('바로드림, 구매예약 전체 금액', async () => {
    // 전체금액 * 0.05
    if (franchiseSettlement) {
      const { fromDate, toDate } = getPreviousMonthRange();
      const { success: totalSuccess, data: totalFee } = await franchiseSettlement.getPurchaseFeeAmount(10351, fromDate, toDate);

      // 수수료는 0.05를 곱해야함
      if (totalSuccess) {
        console.log(totalFee);
        console.log(parseFloat(totalFee) * 0.05);
      }
    }
  });

  test('바로드림, 구매예약 취소 금액', async () => {
    // 전체금액 * 0.05
    if (franchiseSettlement) {
      const { fromDate, toDate } = getPreviousMonthRange();
      const { success: totalSuccess, data: totalFee } = await franchiseSettlement.getPurchaseFeeAmount(10351, fromDate, toDate, true);

      // 수수료는 0.05를 곱해야함
      if (totalSuccess) {
        console.log(totalFee);
        console.log(parseFloat(totalFee) * 0.05);
      }
    }
  });

  test('이번달 정산 지원 전체금액', async () => {
    if (franchiseSettlement) {
      const { fromDate, toDate } = getPreviousMonthRange();
      const { success: totalSuccess, data: totalFee } = await franchiseSettlement.getPurchaseSupportAmount(10351, fromDate, toDate);

      if (totalSuccess) {
        console.log(totalFee);
        console.log(parseFloat(totalFee) * 0.5);
      }
    }
  });

  test('이번달 정산 지원 전체', async () => {
    if (franchiseSettlement) {
      const { fromDate, toDate } = getPreviousMonthRange();
      const { success: totalSuccess, data: totalFee } = await franchiseSettlement.getPurchaseSupportAmount(10351, fromDate, toDate, true);

      if (totalSuccess) {
        console.log(totalFee);
        console.log(parseFloat(totalFee) * 0.5);
      }
    }
  });

  // test('[Post - Update]', async () => {
  //   if (postClass && currentId) {
  //     const updateData = {
  //       title: 'Update title',
  //       content: 'Update content',
  //     }
  //     const { success: updateSuccess, data: updatedData } = await postClass.updateOne(currentId, testUserId, updateData);
  //     expect(updateSuccess).toBe(true);
  //     if (updateSuccess === true) {
  //       expect(updatedData.title).toBe(updateData.title);
  //       expect(updatedData.content).toBe(updateData.content);
  //     }

  //     // error
  //     const { success: updateFail, error } = await postClass.updateOne(currentId, 2, updateData);
  //     expect(updateFail).toBe(false);
  //     if (updateFail === false) {
  //       expect(error).toBeDefined();
  //       expect(error.code).toBe(ServiceErrorCode.NO_PERMISSION);
  //     }
  //   }
  // });

  // // test('[Query - Search keyword]', async () => {
  // //   if (postClass && currentId) {
  // //     const { success, data, error } = await postClass.findList({ title: '한국의' })
  // //     expect(success).toBe(true);
  // //     if (success === true) {
  // //       console.log(data);
  // //     }
  // //   }
  // // });

  // test('[Post - Delete]', async () => {
  //   if (postClass && currentId) {
  //     const { success, data } = await postClass.deleteOne(currentId);
  //     expect(success).toBe(true);
  //     if (success === true) {
  //       expect(currentId).toBe(data.id);
  //       currentId = null;
  //       expect(currentId).toBeNull();
  //     }
  //   }
  // });
});