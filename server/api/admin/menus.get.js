import { handleApiError } from '~/server/utils/apiErrorHandlers';

/**
 * @file 관리자 메뉴 목록 조회 API
 * @description 관리자 페이지에서 사용할 메뉴 목록을 조회합니다.
 *              현재는 더미 데이터를 반환하며, 향후 데이터베이스 또는 설정 파일에서 실제 메뉴 데이터를 가져오도록 구현해야 합니다.
 */
export default defineEventHandler(async (event) => {
  try {
    // Note: Using dummy data - implement database integration for production
    const dummyMenus = [
      { id: 1, name: '소개', path: '/about', order: 1 },
      { id: 2, name: '게시판', path: '/board', order: 2 },
      { id: 3, name: '갤러리', path: '/gallery', order: 3 },
    ];
    return { menus: dummyMenus };
  } catch (error) {
    handleApiError(error, '관리자 메뉴 조회 중 오류', 500);
  }
}); 