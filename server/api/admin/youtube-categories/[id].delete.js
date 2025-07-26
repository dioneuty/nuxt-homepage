import prisma from '~/server/utils/prisma'
import { handleApiError } from '~/server/utils/apiErrorHandlers'
import { verifyAuthToken } from '~/server/utils/auth'

// 개별 YouTube 카테고리 삭제 API
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

  if (!categoryId) {
    return handleApiError(event, 400, '카테고리 ID가 필요합니다.');
  }

  try {
    // 삭제할 카테고리 조회
    const categoryToDelete = await prisma.youTubeVideoCategory.findUnique({
      where: { id: parseInt(categoryId) },
      include: {
        _count: { select: { videos: true } }
      }
    })

    if (!categoryToDelete) {
      return handleApiError(event, 404, '카테고리를 찾을 수 없습니다.');
    }

    // 미분류 카테고리는 삭제 불가
    if (categoryToDelete.slug === 'uncategorized') {
      return handleApiError(event, 400, '미분류 카테고리는 삭제할 수 없습니다.');
    }

    await prisma.$transaction(async (prisma) => {
      // 해당 카테고리의 비디오들을 미분류(categoryId = null)로 이동
      if (categoryToDelete._count.videos > 0) {
        await prisma.youTubeVideo.updateMany({
          where: { categoryId: parseInt(categoryId) },
          data: { categoryId: null }
        })
        console.log(`YouTube Category DELETE API: ${categoryToDelete._count.videos}개 비디오를 미분류로 이동`)
      }

      // 카테고리 삭제
      await prisma.youTubeVideoCategory.delete({
        where: { id: parseInt(categoryId) }
      })
    })

    console.log('YouTube Category DELETE API: 카테고리 삭제 완료:', categoryToDelete.name)
    return { 
      success: true, 
      deletedCategory: categoryToDelete,
      movedVideos: categoryToDelete._count.videos
    }
  } catch (error) {
    return handleApiError(event, 500, '카테고리 삭제 실패', error);
  }
})