import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @file 관리자 테마 설정 조회 API
 * @description 웹사이트의 라이트/다크 모드 헤더, 푸터, 배경 색상 설정을 데이터베이스에서 조회합니다.
 *              설정된 값이 없는 경우 기본값을 생성하여 반환합니다.
 */
export default defineEventHandler(async () => {
  try {
    // Prisma를 사용하여 데이터베이스에서 첫 번째 siteConfig 레코드를 조회합니다.
    let config = await prisma.siteConfig.findFirst();
    
    // 기존 설정이 없는 경우, 기본 색상값을 사용하여 새로운 설정을 생성합니다.
    if (!config) {
      config = await prisma.siteConfig.create({
        data: {
          lightHeaderColor: '#FFFFFF', // 기본 라이트 모드 헤더 색상 (흰색)
          darkHeaderColor: '#1A202C', // 기본 다크 모드 헤더 색상 (짙은 회색-900)
          lightFooterColor: '#F7FAFC', // 기본 라이트 모드 푸터 색상 (회색-100)
          darkFooterColor: '#1A202C', // 기본 다크 모드 푸터 색상 (짙은 회색-900)
          lightBackgroundColor: '#FFFFFF', // 기본 라이트 모드 배경 색상 (흰색)
          darkBackgroundColor: '#1A202C', // 기본 다크 모드 배경 색상 (짙은 회색-900)
        },
      });
    }
    // 조회되거나 새로 생성된 설정 객체를 반환합니다.
    return config;
  } catch (error) {
    // 설정 조회 중 오류 발생 시 서버 콘솔에 오류를 로깅하고 500 Internal Server Error를 반환합니다.
    console.error('Error fetching site config:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch site configuration',
    });
  }
}); 