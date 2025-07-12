import prisma from '~/server/utils/prisma';
import { handleApiError } from '~/server/utils/apiErrorHandlers';

// 메뉴 목록 관리 API
export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  try {
    if (method === 'GET') {
      const menus = await prisma.menu.findMany({
        where: { parentId: null },
        orderBy: { order: 'asc' },
        include: {
          children: {
            orderBy: { order: 'asc' },
            include: {
              children: { orderBy: { order: 'asc' } }
            }
          }
        }
      });
      return menus;
    }

    if (method === 'POST') {
      const { name, path, icon, role, parentId, order } = await readBody(event);

      if (!name || !path) {
        return handleApiError(event, 400, '메뉴 이름과 경로는 필수 입력 사항입니다.');
      }

      const newMenu = await prisma.menu.create({
        data: { name, path, icon, role, parentId, order: order || 0 }
      });
      return newMenu;
    }

    handleApiError(event, 405, 'Method Not Allowed');
  } catch (error) {
    handleApiError(event, 500, '메뉴 처리 중 오류 발생', error);
  }
}); 