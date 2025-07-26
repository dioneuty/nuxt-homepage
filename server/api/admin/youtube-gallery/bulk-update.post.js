import prisma from '~/server/utils/prisma'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { videoIds, categoryId } = body

    // 입력 검증
    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return handleApiError(event, 400, '비디오 ID 목록이 필요합니다.')
    }

    if (videoIds.length > 100) {
      return handleApiError(event, 400, '한 번에 최대 100개까지만 처리할 수 있습니다.')
    }

    // categoryId가 'uncategorized' 또는 빈 문자열이면 null로 처리
    const finalCategoryId = categoryId === 'uncategorized' || categoryId === '' ? null : categoryId

    // 카테고리 ID가 null이 아닌 경우 카테고리 존재 여부 확인
    if (finalCategoryId !== null) {
      const categoryExists = await prisma.youTubeVideoCategory.findUnique({
        where: { id: finalCategoryId }
      })

      if (!categoryExists) {
        return handleApiError(event, 404, '존재하지 않는 카테고리입니다.')
      }
    }

    // 트랜잭션으로 대량 업데이트 수행
    const result = await prisma.$transaction(async (tx) => {
      // 먼저 해당 비디오들이 존재하는지 확인
      const existingVideos = await tx.youTubeVideo.findMany({
        where: {
          id: {
            in: videoIds
          }
        },
        select: { id: true, title: true }
      })

      if (existingVideos.length !== videoIds.length) {
        throw new Error('일부 비디오를 찾을 수 없습니다.')
      }

      // 대량 업데이트 수행
      const updateResult = await tx.youTubeVideo.updateMany({
        where: {
          id: {
            in: videoIds
          }
        },
        data: {
          categoryId: finalCategoryId,
          updatedAt: new Date()
        }
      })

      return {
        updatedCount: updateResult.count,
        videoIds: videoIds,
        categoryId: finalCategoryId
      }
    })

    console.log(`YouTube 비디오 대량 카테고리 업데이트 완료: ${result.updatedCount}개 비디오, 카테고리 ID: ${finalCategoryId || '미분류'}`)

    return {
      success: true,
      updatedCount: result.updatedCount,
      message: `${result.updatedCount}개 비디오의 카테고리가 성공적으로 변경되었습니다.`
    }

  } catch (error) {
    return handleApiError(event, 500, '대량 카테고리 업데이트 실패', error)
  }
})