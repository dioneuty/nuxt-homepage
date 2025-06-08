import prisma from '~/server/utils/prisma';

/**
 * @file 메뉴 목록 관리 API
 * @description 웹사이트 메뉴의 목록을 조회하거나 새로운 메뉴를 생성하는 작업을 처리합니다.
 *              메뉴는 계층 구조(부모-자식 관계)로 조회됩니다.
 */
export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  // GET 요청 처리: 모든 메뉴를 계층 구조로 조회합니다.
  if (method === 'GET') {
    // Prisma를 사용하여 최상위 메뉴(parentId가 null인 메뉴)를 조회하고,
    // 자식 메뉴들을 재귀적으로 포함하여 계층 구조를 만듭니다.
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
    // 조회된 계층적 메뉴 목록을 반환합니다.
    return menus;
  }

  // POST 요청 처리: 새로운 메뉴를 생성합니다.
  if (method === 'POST') {
    const body = await readBody(event);
    const { name, path, icon, role, parentId, order } = body;

    // Prisma를 사용하여 제공된 데이터로 새로운 메뉴 레코드를 생성합니다.
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
    // 생성된 새 메뉴 객체를 반환합니다.
    return newMenu;
  }

  // 참고: 메뉴 수정(PUT), 순서 변경(PATCH), 삭제(DELETE)는 ID가 필요하므로
  // RESTful 원칙에 따라 'server/api/menus/[id].js' 파일에서 처리됩니다.
  // 현재 파일에서는 해당 로직을 포함하지 않습니다.
  
  // 허용되지 않는 HTTP 메소드에 대한 명시적인 오류 처리 (선택적: 필요에 따라 추가 가능)
  // throw createError({ statusCode: 405, statusMessage: '허용되지 않은 메소드입니다.' });
}); 