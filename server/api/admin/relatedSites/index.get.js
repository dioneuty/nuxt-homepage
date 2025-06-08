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

  try {
    const relatedSites = await prisma.relatedSite.findMany({
      orderBy: {
        order: 'asc',
      },
    });
    return relatedSites;
  } catch (error) {
    console.error('Error fetching related sites:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch related sites.',
    });
  }
}); 