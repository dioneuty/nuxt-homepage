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

    const body = await readBody(event);
    const { title, description, content, tags, galleryType, id } = body;

    if (!id || isNaN(id)) {
      handleApiError(null, '유효하지 않은 갤러리 아이템 ID입니다.', 400);
    }

    if (!title || !description || !content || !galleryType) {
      handleApiError(null, '제목, 설명, 콘텐츠, 갤러리 분류는 필수 입력 사항입니다.', 400);
    }

    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

    if (galleryType === 'admin') {

      const updatedAdminGalleryItem = await prisma.adminGalleryItem.update({
        where: { id: id },
        data: {
          title,
          description,
          content,
          tags: tagArray,
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        item: updatedAdminGalleryItem,
      };

    } else if (galleryType === 'general') {

      const updatedGalleryItem = await prisma.galleryItem.update({
        where: { id: id },
        data: {
          title,
          description,
          content,
          tags: tagArray,
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        item: updatedGalleryItem,
      };
    }

  } catch (error) {
    handleApiError(error, error.message || '갤러리 아이템 수정에 실패했습니다.', error.statusCode || 500);
  }
}); 