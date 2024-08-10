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

      return categoriesWithCount
    } catch (error) {
      console.error('카테고리 조회 중 오류:', error)
      throw createError({
        statusCode: 500,
        statusMessage: '카테고리 조회 실패'
      })
    }
  }

  // POST 요청 처리
  if (method === 'POST') {
    const { name, slug } = await readBody(event)
    try {
      const result = await prisma.category.create({
        data: { name, slug }
      })
      return { success: true, id: result.id }
    } catch (error) {
      console.error('카테고리 추가 중 오류:', error)
      throw createError({
        statusCode: 500,
        statusMessage: '카테고리 추가 실패'
      })
    }
  }

  // PUT 요청 처리
  if (method === 'PUT') {
    const categories = await readBody(event)
    try {
      await prisma.$transaction(async (prisma) => {
        for (const category of categories) {
          if (category.id) {
            await prisma.category.update({
              where: { id: category.id },
              data: { name: category.name, slug: category.slug }
            })
          } else {
            await prisma.category.create({
              data: { name: category.name, slug: category.slug }
            })
          }
        }

        const categoryIds = categories.map(cat => cat.id).filter(id => id !== undefined)
        await prisma.category.deleteMany({
          where: {
            id: { notIn: categoryIds }
          }
        })

        await prisma.blogPost.updateMany({
          where: {
            categoryId: { notIn: categoryIds }
          },
          data: { categoryId: 0 }
        })
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

  // DELETE 요청 처리
  if (method === 'DELETE') {
    const { id } = await readBody(event)
    try {
      await prisma.$transaction(async (prisma) => {
        await prisma.blogPost.updateMany({
          where: { categoryId: parseInt(id) },
          data: { categoryId: 0 }
        })
        await prisma.category.delete({
          where: { id: parseInt(id) }
        })
      })
      return { success: true }
    } catch (error) {
      console.error('카테고리 삭제 중 오류:', error)
      throw createError({
        statusCode: 500,
        statusMessage: '카테고리 삭제 실패'
      })
    }
  }

  // 지원하지 않는 메소드에 대한 처리
  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed'
  })
})