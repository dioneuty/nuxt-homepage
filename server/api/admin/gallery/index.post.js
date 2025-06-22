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
    const { title, description, content, tags, galleryType } = body;

    if (!title || !description || !content || !galleryType) {
      handleApiError(null, '제목, 설명, 콘텐츠, 갤러리 분류는 필수 입력 사항입니다.', 400);
    }

    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

    if (galleryType === 'admin') {
      const newAdminGalleryItem = await prisma.adminGalleryItem.create({
        data: {
          title,
          description,
          content,
          tags: tagArray,
        },
      });

      return {
        success: true,
        item: newAdminGalleryItem,
      };
    } else if (galleryType === 'general') {
      const newGalleryItem = await prisma.galleryItem.create({
        data: {
          title,
          description,
          content,
          tags: tagArray,
        },
      });

      return {
        success: true,
        item: newGalleryItem,
      };
    }

  } catch (error) {
    handleApiError(error, error.message || '갤러리 아이템 생성에 실패했습니다.', error.statusCode || 500);
  }
}); 