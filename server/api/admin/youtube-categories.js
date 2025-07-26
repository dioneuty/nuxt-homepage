import prisma from '~/server/utils/prisma'
import { handleApiError } from '~/server/utils/apiErrorHandlers'
import { verifyAuthToken } from '~/server/utils/auth'

// YouTube 카테고리 관리 API
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

  if (method === 'PUT') {
    const { categories, deletedCategories } = await readBody(event)
    try {
      await prisma.$transaction(async (prisma) => {
        let defaultCategory = await prisma.youTubeVideoCategory.findFirst({
          where: { slug: 'uncategorized' }
        })
        if (!defaultCategory) {
          defaultCategory = await prisma.youTubeVideoCategory.upsert({
            where: { slug: 'uncategorized' },
            update: {},
            create: { 
              name: '미분류', 
              slug: 'uncategorized',
              order: 999
            }
          })
        }

        // 삭제된 카테고리 처리
        for (const deletedCategoryId of deletedCategories) {
          // 해당 카테고리의 비디오들을 기본 카테고리로 이동
          await prisma.youTubeVideo.updateMany({
            where: { categoryId: parseInt(deletedCategoryId) },
            data: { categoryId: defaultCategory.id }
          })
          // 카테고리 삭제
          await prisma.youTubeVideoCategory.delete({
            where: { id: parseInt(deletedCategoryId) }
          })
        }

        // 카테고리 업데이트/생성
        for (let i = 0; i < categories.length; i++) {
          const category = categories[i]
          const slug = category.slug || category.name.toLowerCase()
            .replace(/[^a-z0-9가-힣\s-]/g, '')
            .replace(/\s+/g, '-')
            .trim()
          
          if (category.id && category.id !== 'all') {
            await prisma.youTubeVideoCategory.update({
              where: { id: parseInt(category.id) },
              data: { 
                name: category.name, 
                slug,
                order: i
              }
            })
          } else if (category.id !== 'all') {
            await prisma.youTubeVideoCategory.create({
              data: { 
                name: category.name, 
                slug,
                order: i
              }
            })
          }
        }
      })

      return { success: true }
    } catch (error) {
      return handleApiError(event, 500, 'YouTube 카테고리 업데이트 실패', error);
    }
  }

  return handleApiError(event, 405, 'Method Not Allowed');
})