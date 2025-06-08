import { PrismaClient } from '@prisma/client';
import { verifyAuthToken } from '~/server/utils/auth';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    await verifyAuthToken(event);
    const userId = event.context.user.id;
    if (!userId || event.context.user.role !== 'ADMIN') {
      throw createError({ statusCode: 403, message: '접근 권한이 없습니다.' });
    }

    //쿼리 파라미터 가져오기
    const id = event.context.params.id;
    const type = event.context.params.galleryType;
    const galleryItemId = parseInt(id);
    const galleryType = type;

    if (isNaN(galleryItemId)) {
      throw createError({ statusCode: 400, message: '유효하지 않은 갤러리 아이템 ID입니다.' });
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
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '갤러리 아이템 삭제에 실패했습니다.',
    });
  }
}); 