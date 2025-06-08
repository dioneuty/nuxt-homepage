import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @file 공개 테마 설정 조회 API
 * @description 웹사이트의 라이트/다크 모드 헤더 및 푸터 색상 설정을 데이터베이스에서 조회합니다.
 *              설정된 값이 없는 경우 기본값을 반환합니다.
 */
export default defineEventHandler(async () => {
  try {
    // Prisma를 사용하여 데이터베이스에서 첫 번째 siteConfig 레코드를 조회합니다.
    // siteConfig 모델은 웹사이트의 전반적인 테마 설정을 저장합니다.
    const config = await prisma.siteConfig.findFirst();
    
    // 설정이 존재하는 경우 해당 설정을 반환하고, 없는 경우 기본 색상값을 반환합니다.
    return config || {
      lightHeaderColor: '#FFFFFF',
      darkHeaderColor: '#1A202C',
      lightFooterColor: '#F7FAFC',
      darkFooterColor: '#1A202C',
    };
  } catch (error) {
    // 데이터 조회 중 오류 발생 시 서버 콘솔에 오류를 로깅하고 500 Internal Server Error를 반환합니다.
    console.error('Error fetching public site config:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch site configuration',
    });
  }
}); 