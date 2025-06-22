import prisma from '~/server/utils/prisma';
import { handleApiError } from '~/server/utils/apiErrorHandlers';

/**
 * @file 개별 메뉴 관리 API
 * @description 특정 ID의 메뉴 항목에 대한 업데이트 (PUT), 순서/부모 변경 (PATCH), 삭제 (DELETE) 작업을 처리합니다.
 */
export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  // URL 파라미터에서 메뉴 ID를 추출하고 정수로 변환합니다.
  const menuId = parseInt(event.context.params.id, 10);
  
  // 유효하지 않은 메뉴 ID인 경우 400 Bad Request 오류를 반환합니다.
  if (isNaN(menuId)) {
    return handleApiError(event, 400, '잘못된 메뉴 ID입니다.');
  }

  try {
    // PUT 요청 처리: 메뉴의 이름, 경로, 아이콘, 역할, 부모 ID를 수정합니다.
    if (method === 'PUT') {
      const body = await readBody(event);
      const { name, path, icon, role, parentId } = body;

      if (!name || !path) {
        return handleApiError(event, 400, '메뉴 이름과 경로는 필수 입력 사항입니다.');
      }

      // Prisma를 사용하여 해당 ID의 메뉴 레코드를 업데이트합니다.
      const updatedMenu = await prisma.menu.update({
        where: { id: menuId },
        data: { name, path, icon, role, parentId },
      });
      // 업데이트된 메뉴 객체를 반환합니다.
      return updatedMenu;
    }

    // PATCH 요청 처리: 메뉴의 순서(order) 또는 부모 메뉴(parentId)를 변경합니다.
    // 이는 부분 업데이트를 위한 것으로, 모든 필드를 변경할 필요는 없습니다.
    if (method === 'PATCH') {
      const body = await readBody(event);
      const { order, parentId } = body;

      const dataToUpdate = {};
      // 'order' 필드가 제공된 경우 업데이트 데이터에 추가합니다.
      if (order !== undefined) {
        dataToUpdate.order = order;
      }
      // 'parentId' 필드가 제공된 경우 업데이트 데이터에 추가합니다。
      if (parentId !== undefined) {
        dataToUpdate.parentId = parentId;
      }

      // Prisma를 사용하여 해당 ID의 메뉴 레코드를 부분적으로 업데이트합니다.
      const updatedMenu = await prisma.menu.update({
        where: { id: menuId },
        data: dataToUpdate,
      });
      // 업데이트된 메뉴 객체를 반환합니다.
      return updatedMenu;
    }

    // DELETE 요청 처리: 특정 ID의 메뉴를 삭제합니다.
    if (method === 'DELETE') {
      // Prisma를 사용하여 해당 ID의 메뉴 레코드를 삭제합니다.
      await prisma.menu.delete({
        where: { id: menuId },
      });
      // 삭제 성공 메시지를 반환합니다.
      return { success: true, message: '메뉴가 삭제되었습니다.' };
    }
    
    // 지원하지 않는 HTTP 메소드에 대한 처리: 405 Method Not Allowed 반환
    return handleApiError(event, 405, '허용되지 않은 메소드입니다.');
  } catch (error) {
    handleApiError(event, 500, '메뉴 처리 중 오류 발생', error);
  }
}); 