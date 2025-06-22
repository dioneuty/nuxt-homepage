import { PrismaClient } from '@prisma/client';
import { verifyAuthToken } from '~/server/utils/auth';
import { handleApiError } from '~/server/utils/apiErrorHandlers';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    await verifyAuthToken(event);
    const userId = event.context.user.id;
    if (!userId || event.context.user.role !== 'ADMIN') {
      handleApiError(null, '접근 권한이 없습니다.', 403);
    }

    //쿼리 파라미터 가져오기
    const id = event.context.params.id;
    const type = event.context.params.galleryType;
    const galleryItemId = parseInt(id);
    const galleryType = type;

    if (isNaN(galleryItemId)) {
      handleApiError(null, '유효하지 않은 갤러리 아이템 ID입니다.', 400);
    }

    if (galleryType === 'admin') {
      await prisma.adminGalleryItem.delete({
        where: { id: galleryItemId },
      });
    } else if (galleryType === 'general') {
      await prisma.galleryItem.delete({
        where: { id: galleryItemId },
      });
    }

    return {
      success: true,
      message: '갤러리 아이템이 성공적으로 삭제되었습니다.',
    };
  } catch (error) {
    handleApiError(error, error.message || '갤러리 아이템 삭제에 실패했습니다.', error.statusCode || 500);
  }
}); 