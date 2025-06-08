import prisma from '~/server/utils/prisma';
import * as jose from 'jose';

/**
 * @file 관리자 관련 사이트 삭제 API
 * @description 관리자 권한으로 특정 관련 사이트 항목을 삭제합니다.
 *              이 API는 JWT 토큰을 통한 인증 및 관리자 권한 확인이 필수적입니다.
 */
export default defineEventHandler(async (event) => {
  // 1. 인증 확인: 쿠키에서 JWT 토큰을 가져옵니다.
  const token = getCookie(event, 'auth_token');
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: '인증이 필요합니다.',
    });
  }

  try {
    // 2. 토큰 검증 및 페이로드 추출: JWT Secret을 사용하여 토큰의 유효성을 검증하고 사용자 정보를 추출합니다.
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    // 3. 권한 확인: 추출된 사용자 페이로드에서 역할(role)이 'ADMIN'인지 확인합니다.
    // 관리자가 아닌 경우 403 Forbidden 오류를 반환합니다.
    if (payload.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        statusMessage: '관리자 권한이 필요합니다.',
      });
    }
  } catch (error) {
    // 토큰 검증 실패 시 (만료, 변조 등) 401 Unauthorized 오류를 반환합니다.
    console.error('Token verification error in admin relatedSites/[id].delete.js:', error); // 오류 로깅
    throw createError({
      statusCode: 401,
      statusMessage: '유효하지 않은 토큰입니다.',
    });
  }

  // 4. URL 파라미터에서 삭제할 관련 사이트의 ID를 추출합니다.
  const relatedSiteId = parseInt(event.context.params.id);

  try {
    // 5. Prisma를 사용하여 해당 ID의 관련 사이트 레코드를 삭제합니다.
    await prisma.relatedSite.delete({
      where: {
        id: relatedSiteId,
      },
    });
    // 삭제 성공 메시지를 반환합니다.
    return { message: 'Related site deleted successfully.' };
  } catch (error) {
    // 관련 사이트 삭제 중 오류 발생 시 로깅하고 500 Internal Server Error를 반환합니다.
    console.error(`Error deleting related site with ID ${relatedSiteId}:`, error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete related site.',
    });
  }
}); 