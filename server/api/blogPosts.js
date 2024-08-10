import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  // GET 요청 처리
  if (method === 'GET') {
    const { id, category } = getQuery(event)
    
    if (id) {
      const post = await prisma.blogPost.findUnique({
        where: { id: parseInt(id) }
      })
      return post || createError({ statusCode: 404, statusMessage: '블로그 포스트를 찾을 수 없습니다' })
    } else {
      let whereClause = {}
      if (category && category !== '-1') {
        whereClause.categoryId = parseInt(category)
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
        data: { title, content, categoryId: parseInt(categoryId) }
      })
      return { success: true, id: result.id }
    } catch (error) {
      console.error('블로그 포스트 생성 중 오류:', error)
      throw createError({ statusCode: 500, statusMessage: '블로그 포스트 생성 실패' })
    }
  }

  // PUT 요청 처리
  if (method === 'PUT') {
    const { id, title, content, categoryId } = await readBody(event)
    try {
      await prisma.blogPost.update({
        where: { id: parseInt(id) },
        data: { title, content, categoryId: parseInt(categoryId) }
      })
      return { success: true }
    } catch (error) {
      console.error('블로그 포스트 업데이트 중 오류:', error)
      throw createError({ statusCode: 500, statusMessage: '블로그 포스트 업데이트 실패' })
    }
  }

  // DELETE 요청 처리
  if (method === 'DELETE') {
    const { id } = await readBody(event)
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