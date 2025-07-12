import prisma from '~/server/utils/prisma'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

// 카테고리 관리 API
export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  if (method === 'GET') {
    try {
      const categories = await prisma.category.findMany({
        include: {
          _count: { select: { blogPosts: true } }
        }
      })
      
      const categoriesWithCount = categories.map(category => ({
        ...category,
        post_count: category._count.blogPosts
      }))

      const totalPosts = categoriesWithCount.reduce((sum, category) => sum + category.post_count, 0)
      const allCategory = { id: 'all', name: '전체', post_count: totalPosts }

      return [allCategory, ...categoriesWithCount]
    } catch (error) {
      handleApiError(event, 500, '카테고리 조회 실패', error);
    }
  }

  if (method === 'PUT') {
    const { categories, deletedCategories } = await readBody(event)
    try {
      await prisma.$transaction(async (prisma) => {
        let defaultCategory = await prisma.category.findFirst({
          where: { slug: 'default-category' }
        })
        if (!defaultCategory) {
          defaultCategory = await prisma.category.upsert({
            where: { slug: 'default-category' },
            update: {},
            create: { name: '기본 카테고리', slug: 'default-category' }
          })
        }

        // 삭제된 카테고리 처리
        for (const deletedCategoryId of deletedCategories) {
          await prisma.blogPost.updateMany({
            where: { categoryId: parseInt(deletedCategoryId) },
            data: { categoryId: defaultCategory.id }
          })
          await prisma.category.delete({
            where: { id: parseInt(deletedCategoryId) }
          })
        }

        // 카테고리 업데이트/생성
        for (const category of categories) {
          const slug = category.slug || category.name.toLowerCase().replace(/ /g, '-')
          if (category.id) {
            await prisma.category.update({
              where: { id: parseInt(category.id) },
              data: { name: category.name, slug }
            })
          } else {
            await prisma.category.create({
              data: { name: category.name, slug }
            })
          }
        }
      })

      return { success: true }
    } catch (error) {
      handleApiError(event, 500, '카테고리 업데이트 실패', error);
    }
  }

  handleApiError(event, 405, 'Method Not Allowed');
})