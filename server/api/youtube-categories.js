import prisma from '~/server/utils/prisma'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

// YouTube 카테고리 조회 API (공용)
export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  if (method === 'GET') {
    try {
      console.log('YouTube Categories API: 카테고리 조회 시작')
      
      // 1. 실제 카테고리들과 그들의 비디오 수
      const categories = await prisma.youTubeVideoCategory.findMany({
        include: {
          _count: { select: { YouTubeVideo: true } }
        },
        orderBy: { order: 'asc' }
      })
      
      // 2. categoryId가 null인 비디오 수 (진짜 미분류)
      const uncategorizedVideoCount = await prisma.youTubeVideo.count({
        where: { categoryId: null }
      })
      
      console.log('YouTube Categories API: 원본 카테고리 데이터:', categories)
      console.log('YouTube Categories API: categoryId가 null인 비디오 수:', uncategorizedVideoCount)
      
      // 3. 카테고리 처리: "미분류" 카테고리는 실제 null 비디오 수로 설정
      const categoriesWithCount = categories.map(category => {
        if (category.slug === 'uncategorized') {
          // 데이터베이스의 "미분류" 카테고리는 categoryId가 null인 비디오 수로 설정
          return {
            ...category,
            video_count: uncategorizedVideoCount
          }
        } else {
          // 다른 카테고리들은 기존 로직 사용
          return {
            ...category,
            video_count: category._count.YouTubeVideo
          }
        }
      })

      console.log('YouTube Categories API: 처리된 카테고리:', categoriesWithCount)

      console.log('YouTube Categories API: 최종 결과:', categoriesWithCount)

      return categoriesWithCount
    } catch (error) {
      console.error('YouTube Categories API: 오류 발생:', error)
      return handleApiError(event, 500, 'YouTube 카테고리 조회 실패', error);
    }
  }

  return handleApiError(event, 405, 'Method Not Allowed');
})