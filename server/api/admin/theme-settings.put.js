import { PrismaClient } from '@prisma/client';
import { handleApiError } from '~/server/utils/apiErrorHandlers';

const prisma = new PrismaClient();

/**
 * @file 관리자 테마 설정 업데이트 API
 * @description 웹사이트의 라이트/다크 모드 헤더, 푸터, 배경 색상 설정을 업데이트합니다.
 *              기존 설정이 없으면 새로 생성하고, 있으면 기존 설정을 업데이트합니다.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  // 요청 본문에서 다양한 색상 설정 값을 추출합니다.
  const { lightHeaderColor, darkHeaderColor, lightFooterColor, darkFooterColor, lightBackgroundColor, darkBackgroundColor, siteTitle, siteLogoUrl, siteLogoIcon, showSiteTitle, showSiteLogoUrl, showSiteLogoIcon } = body;

  // 제공된 색상 데이터가 하나도 없는 경우 400 Bad Request 오류를 반환합니다.
  if (!lightHeaderColor && !darkHeaderColor && !lightFooterColor && !darkFooterColor && !lightBackgroundColor && !darkBackgroundColor && !siteTitle && !siteLogoUrl && !siteLogoIcon && !showSiteTitle && !showSiteLogoUrl && !showSiteLogoIcon) {
    handleApiError(null, 'No data provided for update', 400);
  }

  try {
    // 데이터베이스에서 기존 사이트 설정(siteConfig)을 조회합니다.
    let config = await prisma.siteConfig.findFirst();

    // 기존 설정이 없는 경우, 기본값을 포함하여 새로운 설정을 생성합니다.
    if (!config) {
      config = await prisma.siteConfig.create({
        data: {
          lightHeaderColor: lightHeaderColor || '#FFFFFF',
          darkHeaderColor: darkHeaderColor || '#1A202C',
          lightFooterColor: lightFooterColor || '#F7FAFC',
          darkFooterColor: darkFooterColor || '#1A202C',
          lightBackgroundColor: lightBackgroundColor || '#FFFFFF',
          darkBackgroundColor: darkBackgroundColor || '#1A202C',
          siteTitle: siteTitle || 'My Website',
          siteLogoUrl: siteLogoUrl || '/images/logo.png',
          siteLogoIcon: siteLogoIcon || null,
          showSiteTitle: showSiteTitle === undefined ? true : showSiteTitle,
          showSiteLogoUrl: showSiteLogoUrl === undefined ? true : showSiteLogoUrl,
          showSiteLogoIcon: showSiteLogoIcon === undefined ? true : showSiteLogoIcon,
          updatedAt: new Date(), // updatedAt 필드 추가
        },
      });
    } else {
      // 기존 설정이 있는 경우, 제공된 값으로 설정을 업데이트합니다.
      // 제공되지 않은 색상 값은 기존 값으로 유지됩니다.
      config = await prisma.siteConfig.update({
        where: { id: config.id },
        data: {
          lightHeaderColor: lightHeaderColor || config.lightHeaderColor,
          darkHeaderColor: darkHeaderColor || config.darkHeaderColor,
          lightFooterColor: lightFooterColor || config.lightFooterColor,
          darkFooterColor: darkFooterColor || config.darkFooterColor,
          lightBackgroundColor: lightBackgroundColor || config.lightBackgroundColor,
          darkBackgroundColor: darkBackgroundColor || config.darkBackgroundColor,
          siteTitle: siteTitle || config.siteTitle,
          siteLogoUrl: siteLogoUrl || config.siteLogoUrl,
          siteLogoIcon: siteLogoIcon === undefined ? config.siteLogoIcon : siteLogoIcon,
          showSiteTitle: showSiteTitle === undefined ? config.showSiteTitle : showSiteTitle,
          showSiteLogoUrl: showSiteLogoUrl === undefined ? config.showSiteLogoUrl : showSiteLogoUrl,
          showSiteLogoIcon: showSiteLogoIcon === undefined ? config.showSiteLogoIcon : showSiteLogoIcon,
        },
      });
    }
    // 업데이트되거나 새로 생성된 설정 객체를 반환합니다.
    return config;
  } catch (error) {
    // 설정 업데이트 중 오류 발생 시 로깅하고 500 Internal Server Error를 반환합니다.
    handleApiError(error, 'Failed to update site configuration', 500);
  }
}); 