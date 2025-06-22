import prisma from '~/server/utils/prisma';
import * as jose from 'jose';
import { handleApiError } from '~/server/utils/apiErrorHandlers';

/**
 * @file 관리자 관련 사이트 목록 조회 API
 * @description 관리자 권한으로 관련 사이트 목록을 조회합니다. 'order' 필드를 기준으로 정렬됩니다.
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

  try {
    // 4. Prisma를 사용하여 모든 관련 사이트 목록을 조회합니다.
    const relatedSites = await prisma.relatedSite.findMany({
      orderBy: {
        order: 'asc', // 'order' 필드를 기준으로 오름차순 정렬
      },
    });
    // 조회된 관련 사이트 목록을 반환합니다.
    return relatedSites;
  } catch (error) {
    // 관련 사이트 조회 중 오류 발생 시 로깅하고 500 Internal Server Error를 반환합니다.
    handleApiError(error, 'Failed to fetch related sites.', 500);
  }
}); 