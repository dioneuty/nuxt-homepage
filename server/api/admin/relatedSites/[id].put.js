import prisma from '~/server/utils/prisma';
import * as jose from 'jose';

export default defineEventHandler(async (event) => {
  // 인증 확인
  const token = getCookie(event, 'auth_token');
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: '인증이 필요합니다.',
    });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    if (payload.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        statusMessage: '관리자 권한이 필요합니다.',
      });
    }
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: '유효하지 않은 토큰입니다.',
    });
  }

  const relatedSiteId = parseInt(event.context.params.id);
  const body = await readBody(event);
  const { name, url, description, order } = body;

  if (!name || !url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name and URL are required.',
    });
  }

  try {
    const updatedRelatedSite = await prisma.relatedSite.update({
      where: {
        id: relatedSiteId,
      },
      data: {
        name,
        url,
        description,
        order: order !== undefined ? parseInt(order) : null,
      },
    });
    return updatedRelatedSite;
  } catch (error) {
    console.error(`Error updating related site with ID ${relatedSiteId}:`, error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update related site.',
    });
  }
}); 