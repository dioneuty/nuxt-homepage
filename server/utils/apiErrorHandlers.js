import { createError } from 'h3';

/**
 * API 요청 처리 중 발생한 오류를 로깅하고 적절한 HTTP 오류 응답을 생성합니다.
 * 이 함수는 Nuxt의 `createError`를 래핑하여 사용하며, 일관된 오류 처리를 제공합니다.
 * 
 * @param {Error | null} error - 발생한 원본 오류 객체. (선택 사항)
 * @param {string} defaultMessage - 사용자에게 표시할 기본 오류 메시지.
 * @param {number} statusCode - HTTP 상태 코드 (기본값: 500).
 * @returns {never} 이 함수는 항상 오류를 발생시키므로 반환되지 않습니다.
 */
export function handleApiError(error, defaultMessage, statusCode = 500) {
  if (error) {
    console.error(`API 오류 발생 (${statusCode}): ${defaultMessage}`, error);
  } else {
    console.error(`API 오류 발생 (${statusCode}): ${defaultMessage}`);
  }
  throw createError({
    statusCode: statusCode,
    statusMessage: defaultMessage,
  });
} 