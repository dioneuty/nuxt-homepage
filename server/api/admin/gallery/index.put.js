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

    const body = await readBody(event);
    const { title, description, content, tags, galleryType, id } = body;

    if (!id || isNaN(id)) {
      throw createError({ statusCode: 400, message: '유효하지 않은 갤러리 아이템 ID입니다.' });
    }

    if (!title || !description || !content || !galleryType) {
      throw createError({ statusCode: 400, message: '제목, 설명, 콘텐츠, 갤러리 분류는 필수 입력 사항입니다.' });
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
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '갤러리 아이템 수정에 실패했습니다.',
    });
  }
}); 