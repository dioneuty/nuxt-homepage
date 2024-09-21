import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const { id, category, type } = getQuery(event)

  // GET 요청 처리
  if (method === 'GET') {
    // 네비게이션 요청 처리
    if (type === 'navigation') {
      if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'ID가 필요합니다' })
      }

      const currentPost = await prisma.blogPost.findUnique({
        where: { id: parseInt(id) },
        select: { id: true, categoryId: true }
      })

      if (!currentPost) {
        throw createError({ statusCode: 404, statusMessage: '블로그 포스트를 찾을 수 없습니다' })
      }

      const [prev, next] = await Promise.all([
        prisma.blogPost.findFirst({
          where: {
            id: { lt: currentPost.id },
            categoryId: currentPost.categoryId
          },
          orderBy: { id: 'desc' },
          select: { id: true, title: true }
        }),
        prisma.blogPost.findFirst({
          where: {
            id: { gt: currentPost.id },
            categoryId: currentPost.categoryId
          },
          orderBy: { id: 'asc' },
          select: { id: true, title: true }
        })
      ])

      return { prev, next }
    }
    
    // 기존의 GET 요청 처리 로직
    if (id) {
      const post = await prisma.blogPost.findUnique({
        where: { id: parseInt(id) },
        include: { category: true }
      })
      return post || createError({ statusCode: 404, statusMessage: '블로그 포스트를 찾을 수 없습니다' })
    } else {
      let whereClause = {}
      if (category && category !== '-1') {
        const categoryId = parseInt(category)
        if (!isNaN(categoryId)) {
          whereClause.categoryId = categoryId
        }
      }

      const posts = await prisma.blogPost.findMany({
        where: whereClause,
        orderBy: { id: 'desc' },
        include: { category: true }
      })
      return posts
    }
  }

  // POST 요청 처리
  if (method === 'POST') {
    const { title, content, categoryId } = await readBody(event)
    try {
      const result = await prisma.blogPost.create({
        data: { 
          title, 
          content, 
          categoryId: categoryId ? parseInt(categoryId) : undefined 
        },
        include: { category: true }
      })
      return { success: true, post: result }
    } catch (error) {
      console.error('블로그 포스트 생성 중 오류:', error)
      throw createError({ statusCode: 500, statusMessage: '블로그 포스트 생성 실패' })
    }
  }

  // PUT 요청 처리
  if (method === 'PUT') {
    const { id, title, content, categoryId } = await readBody(event)
    try {
      const updatedPost = await prisma.blogPost.update({
        where: { id: parseInt(id) },
        data: { 
          title, 
          content, 
          categoryId: categoryId ? parseInt(categoryId) : undefined 
        },
        include: { category: true }
      })
      return { success: true, post: updatedPost }
    } catch (error) {
      console.error('블로그 포스트 업데이트 중 오류:', error)
      throw createError({ statusCode: 500, statusMessage: '블로그 포스트 업데이트 실패' })
    }
  }

  // DELETE 요청 처리
  if (method === 'DELETE') {
    const { id } = getQuery(event)
    try {
      await prisma.blogPost.delete({
        where: { id: parseInt(id) }
      })
      return { success: true }
    } catch (error) {
      console.error('블로그 포스트 삭제 중 오류:', error)
      throw createError({ statusCode: 500, statusMessage: '블로그 포스트 삭제 실패' })
    }
  }

  // 지원하지 않는 메소드에 대한 처리
  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
})