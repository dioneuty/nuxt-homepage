import prisma from '~/server/utils/prisma'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

// YouTube 카테고리 조회 API (공용)
export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  if (method === 'GET') {
    try {
      const categories = await prisma.youTubeVideoCategory.findMany({
        include: {
          _count: { select: { videos: true } }
        },
        orderBy: { order: 'asc' }
      })
      
      const categoriesWithCount = categories.map(category => ({
        ...category,
        video_count: category._count.videos
      }))

      const totalVideos = categoriesWithCount.reduce((sum, category) => sum + category.video_count, 0)
      const allCategory = { id: 'all', name: '전체', video_count: totalVideos, order: -1 }

      return [allCategory, ...categoriesWithCount]
    } catch (error) {
      return handleApiError(event, 500, 'YouTube 카테고리 조회 실패', error);
    }
  }

  return handleApiError(event, 405, 'Method Not Allowed');
})