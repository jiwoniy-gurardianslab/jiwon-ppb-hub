import { getPrismaClientWrapper } from '../../config';
import { DBError, DBErrorCode } from '../../error';
import BrandClass from './class';

describe('[Brand]', () => {
  const prismaWrapper = getPrismaClientWrapper();
  let brandClass: BrandClass | null = null;

  beforeAll(async () => {
    try {
      prismaWrapper.$connect();
      brandClass = new BrandClass(prismaWrapper);  
    } catch (error: unknown) {
      console.error(error);
    }
  });
  
  afterAll(async () => {
    // await userClass?.clearData();
    prismaWrapper.$disconnect();
  });

  test('[Brand]', async () => {
    if (brandClass) {
      // 없는 값 조회시
      const { success, data, error } = await brandClass.getCount();
      expect(success).toBe(false);
      expect(error).toBeInstanceOf(DBError);
      if (success === false) {
        expect(error.code).toBe(DBErrorCode.DB_NOT_FOUND);
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