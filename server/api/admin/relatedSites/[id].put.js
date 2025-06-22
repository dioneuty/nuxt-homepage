import prisma from '~/server/utils/prisma';
import * as jose from 'jose';
import { handleApiError } from '~/server/utils/apiErrorHandlers';

/**
 * @file 관리자 관련 사이트 업데이트 API
 * @description 관리자 권한으로 특정 관련 사이트 항목을 업데이트합니다.
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

  // 4. URL 파라미터에서 업데이트할 관련 사이트의 ID를 추출합니다.
  const relatedSiteId = parseInt(event.context.params.id);
  // 5. 요청 본문에서 관련 사이트 업데이트 데이터를 추출합니다.
  const body = await readBody(event);
  const { name, url, description, order } = body;

  // 6. 필수 필드 검증: 'name'과 'url'은 필수입니다.
  if (!name || !url) {
    handleApiError(null, 'Name and URL are required.', 400);
  }

  try {
    // 7. Prisma를 사용하여 해당 ID의 관련 사이트 레코드를 업데이트합니다.
    const updatedRelatedSite = await prisma.relatedSite.update({
      where: {
        id: relatedSiteId,
      },
      data: {
        name,
        url,
        description,
        // 'order' 필드가 제공된 경우 정수로 변환하여 업데이트하고, 그렇지 않으면 null을 유지합니다.
        order: order !== undefined ? parseInt(order) : null,
      },
    });
    // 업데이트된 관련 사이트 객체를 반환합니다。
    return updatedRelatedSite;
  } catch (error) {
    // 관련 사이트 업데이트 중 오류 발생 시 로깅하고 500 Internal Server Error를 반환합니다。
    handleApiError(error, 'Failed to update related site.', 500);
  }
}); 