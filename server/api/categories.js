import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  // GET 요청 처리
  if (method === 'GET') {
    try {
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: { blogPosts: true }
          }
        }
      })
      
      const categoriesWithCount = categories.map(category => ({
        ...category,
        post_count: category._count.blogPosts
      }))

      // 전체 게시물 수 계산
      const totalPosts = categoriesWithCount.reduce((sum, category) => sum + category.post_count, 0)

      // "전체" 카테고리 추가
      const allCategory = {
        id: 'all',
        name: '전체',
        post_count: totalPosts
      }

      return [allCategory, ...categoriesWithCount]
    } catch (error) {
      console.error('카테고리 조회 중 오류:', error)
      throw createError({
        statusCode: 500,
        statusMessage: '카테고리 조회 실패'
      })
    }
  }

  // PUT 요청 처리 (카테고리 업데이트)
  if (method === 'PUT') {
    const { categories, deletedCategories } = await readBody(event)
    try {
      await prisma.$transaction(async (prisma) => {
        // 기본 카테고리 확인 또는 생성
        let defaultCategory = await prisma.category.findFirst({
          where: { slug: 'default-category' }
        })
        if (!defaultCategory) {
          defaultCategory = await prisma.category.upsert({
            where: { slug: 'default-category' },
            update: {},
            create: { 
              name: '기본 카테고리', 
              slug: 'default-category'
            }
          })
        }

        // 삭제된 카테고리 처리
        for (const deletedCategoryId of deletedCategories) {
          // 해당 카테고리의 블로그 포스트를 기본 카테고리로 이동
          await prisma.blogPost.updateMany({
            where: { categoryId: parseInt(deletedCategoryId) },
            data: { categoryId: defaultCategory.id }
          })

          // 카테고리 삭제
          await prisma.category.delete({
            where: { id: parseInt(deletedCategoryId) }
          })
        }

        // 나머지 카테고리 업데이트 또는 생성
        for (const category of categories) {
          const slug = category.slug || category.name.toLowerCase().replace(/ /g, '-')
          if (category.id) {
            await prisma.category.update({
              where: { id: parseInt(category.id) },
              data: {
                name: category.name,
                slug: slug
              }
            })
          } else {
            await prisma.category.create({
              data: {
                name: category.name,
                slug: slug
              }
            })
          }
        }
      })

      return { success: true }
    } catch (error) {
      console.error('카테고리 업데이트 중 오류:', error)
      throw createError({
        statusCode: 500,
        statusMessage: '카테고리 업데이트 실패'
      })
    }
  }

  // 지원하지 않는 메소드에 대한 처리
  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
})