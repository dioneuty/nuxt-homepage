import prisma from '~/server/utils/prisma'
import { handleApiError } from '~/server/utils/apiErrorHandlers'
import { verifyAuthToken } from '~/server/utils/auth'

// 개별 YouTube 카테고리 수정 API
export default defineEventHandler(async (event) => {
  try {
    // 관리자 권한 확인
    await verifyAuthToken(event);
    const userId = event.context.user.id;
    if (!userId || event.context.user.role !== 'ADMIN') {
      return handleApiError(event, 403, '접근 권한이 없습니다.');
    }
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    return handleApiError(event, 401, '인증 실패', error);
  }

  const categoryId = getRouterParam(event, 'id')
  const { name } = await readBody(event)

  if (!categoryId) {
    return handleApiError(event, 400, '카테고리 ID가 필요합니다.');
  }

  if (!name || !name.trim()) {
    return handleApiError(event, 400, '카테고리 이름이 필요합니다.');
  }

  try {
    // 미분류 카테고리는 수정 불가
    const existingCategory = await prisma.youTubeVideoCategory.findUnique({
      where: { id: parseInt(categoryId) }
    })

    if (!existingCategory) {
      return handleApiError(event, 404, '카테고리를 찾을 수 없습니다.');
    }

    if (existingCategory.slug === 'uncategorized') {
      return handleApiError(event, 400, '미분류 카테고리는 수정할 수 없습니다.');
    }

    // slug 생성
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    const updatedCategory = await prisma.youTubeVideoCategory.update({
      where: { id: parseInt(categoryId) },
      data: {
        name: name.trim(),
        slug
      }
    })

    console.log('YouTube Category UPDATE API: 카테고리 수정 완료:', updatedCategory)
    return updatedCategory
  } catch (error) {
    return handleApiError(event, 500, '카테고리 수정 실패', error);
  }
})