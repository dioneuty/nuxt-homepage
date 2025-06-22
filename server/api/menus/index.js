import prisma from '~/server/utils/prisma';
import { handleApiError } from '~/server/utils/apiErrorHandlers';

/**
 * @file 메뉴 목록 관리 API
 * @description 웹사이트 메뉴의 목록을 조회하거나 새로운 메뉴를 생성하는 작업을 처리합니다.
 *              메뉴는 계층 구조(부모-자식 관계)로 조회됩니다.
 */
export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  try {
    // GET 요청 처리: 모든 메뉴를 계층 구조로 조회합니다.
    if (method === 'GET') {
      const menus = await prisma.menu.findMany({
        where: { parentId: null }, // 최상위 메뉴만 선택합니다.
        orderBy: { order: 'asc' }, // 'order' 필드를 기준으로 오름차순 정렬합니다.
        include: {
          children: { // 1단계 하위 메뉴 포함
            orderBy: { order: 'asc' },
            include: {
              children: { // 2단계 하위 메뉴까지 포함 (필요시 더 깊게 중첩할 수 있습니다)
                orderBy: { order: 'asc' }
              }
            }
          }
        }
      });
      return menus;
    }

    // POST 요청 처리: 새로운 메뉴를 생성합니다.
    if (method === 'POST') {
      const body = await readBody(event);
      const { name, path, icon, role, parentId, order } = body;

      if (!name || !path) {
        return handleApiError(event, 400, '메뉴 이름과 경로는 필수 입력 사항입니다.');
      }

      const newMenu = await prisma.menu.create({
        data: {
          name,
          path,
          icon,
          role,
          parentId,
          order: order || 0, // 'order'가 제공되지 않으면 기본값 0을 사용합니다.
        }
      });
      return newMenu;
    }

    handleApiError(event, 405, 'Method Not Allowed');
  } catch (error) {
    handleApiError(event, 500, '메뉴 처리 중 오류 발생', error);
  }
}); 