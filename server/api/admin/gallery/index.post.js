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
    const { title, description, content, tags } = body;

    if (!title || !description || !content) {
      throw createError({ statusCode: 400, message: '제목, 설명, 콘텐츠는 필수 입력 사항입니다.' });
    }

    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

    const newGalleryItem = await prisma.adminGalleryItem.create({
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
  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '갤러리 아이템 생성에 실패했습니다.',
    });
  }
}); 