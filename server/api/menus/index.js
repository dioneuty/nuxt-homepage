import prisma from '~/server/utils/prisma';

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  if (method === 'GET') {
    // 모든 메뉴를 계층 구조로 조회
    const menus = await prisma.menu.findMany({
      where: { parentId: null }, // 최상위 메뉴만 선택
      orderBy: { order: 'asc' },
      include: {
        children: {
          orderBy: { order: 'asc' },
          include: {
            children: { // 2단계 하위 메뉴까지 포함 (필요시 더 늘릴 수 있음)
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });
    return menus;
  }

  if (method === 'POST') {
    // 새 메뉴 생성
    const body = await readBody(event);
    const { name, path, icon, role, parentId, order } = body;

    const newMenu = await prisma.menu.create({
      data: {
        name,
        path,
        icon,
        role,
        parentId,
        order: order || 0,
      }
    });
    return newMenu;
  }

  // 메뉴 수정, 순서 변경, 삭제는 ID가 필요하므로 별도 파일([id].js)에서 처리하는 것이 RESTful 원칙에 더 적합합니다.
  // 하지만 편의를 위해 여기서 쿼리 파라미터로 처리하겠습니다.
  
  // 예: PUT /api/menus?id=1, PATCH /api/menus?id=1&action=order, DELETE /api/menus?id=1
  // 더 나은 방법: /api/menus/[id].js 파일 생성
}); 