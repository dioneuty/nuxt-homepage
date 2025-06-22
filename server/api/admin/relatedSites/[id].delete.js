import prisma from '~/server/utils/prisma';
import * as jose from 'jose';
import { handleApiError } from '~/server/utils/apiErrorHandlers';

/**
 * @file 관리자 관련 사이트 삭제 API
 * @description 관리자 권한으로 특정 관련 사이트 항목을 삭제합니다.
 *              이 API는 JWT 토큰을 통한 인증 및 관리자 권한 확인이 필수적입니다.
 */
export default defineEventHandler(async (event) => {
  // 1. 인증 확인: 쿠키에서 JWT 토큰을 가져옵니다.
  const token = getCookie(event, 'auth_token');
  if (!token) {
    handleApiError(null, '인증이 필요합니다.', 401);
  }

  try {
    // 2. 토큰 검증 및 페이로드 추출: JWT Secret을 사용하여 토큰의 유효성을 검증하고 사용자 정보를 추출합니다.
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    // 3. 권한 확인: 추출된 사용자 페이로드에서 역할(role)이 'ADMIN'인지 확인합니다.
    // 관리자가 아닌 경우 403 Forbidden 오류를 반환합니다.
    if (payload.role !== 'ADMIN') {
      handleApiError(null, '관리자 권한이 필요합니다.', 403);
    }
  } catch (error) {
    // 토큰 검증 실패 시 (만료, 변조 등) 401 Unauthorized 오류를 반환합니다.
    handleApiError(error, '유효하지 않은 토큰입니다.', 401);
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
    handleApiError(error, 'Failed to delete related site.', 500);
  }
}); 