import prisma from '~/server/utils/prisma';

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const menuId = parseInt(event.context.params.id, 10);
  
  if (isNaN(menuId)) {
    return createError({ statusCode: 400, statusMessage: '잘못된 메뉴 ID입니다.' });
  }

  if (method === 'PUT') {
    // 메뉴 정보 수정
    const body = await readBody(event);
    const { name, path, icon, role, parentId } = body;
    const updatedMenu = await prisma.menu.update({
      where: { id: menuId },
      data: { name, path, icon, role, parentId },
    });
    return updatedMenu;
  }

  if (method === 'PATCH') {
    // 메뉴 순서 또는 부모 변경
    const body = await readBody(event);
    const { order, parentId } = body;

    const dataToUpdate = {};
    if (order !== undefined) {
      dataToUpdate.order = order;
    }
    if (parentId !== undefined) {
      dataToUpdate.parentId = parentId;
    }

    const updatedMenu = await prisma.menu.update({
      where: { id: menuId },
      data: dataToUpdate,
    });
    return updatedMenu;
  }

  if (method === 'DELETE') {
    // 메뉴 삭제
    await prisma.menu.delete({
      where: { id: menuId },
    });
    return { success: true, message: '메뉴가 삭제되었습니다.' };
  }
  
  return createError({ statusCode: 405, statusMessage: '허용되지 않은 메소드입니다.' });
}); 