import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  // GET 요청 처리
  if (method === 'GET') {
    const { id, page = 1, limit = 10 } = getQuery(event)
    
    if (id) {
      const post = await prisma.humorPost.findUnique({
        where: { id: parseInt(id) }
      })
      return post || createError({ statusCode: 404, statusMessage: '유머 게시글을 찾을 수 없습니다' })
    } else {
      const skip = (page - 1) * limit
      const [posts, totalCount] = await Promise.all([
        prisma.humorPost.findMany({
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit),
          skip: skip
        }),
        prisma.humorPost.count()
      ])
      return {
        posts,
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    }
  }

  // POST 요청 처리
  if (method === 'POST') {
    const { title, content, author } = await readBody(event)
    try {
      const result = await prisma.humorPost.create({
        data: { title, content, author }
      })
      return { success: true, id: result.id }
    } catch (error) {
      console.error('유머 게시글 생성 중 오류:', error)
      throw createError({ statusCode: 500, statusMessage: '유머 게시글 생성 실패' })
    }
  }

  // PUT 요청 처리 (좋아요 기능)
  if (method === 'PUT') {
    const { id } = await readBody(event)
    try {
      const updatedPost = await prisma.humorPost.update({
        where: { id: parseInt(id) },
        data: { likes: { increment: 1 } }
      })
      return { success: true, likes: updatedPost.likes }
    } catch (error) {
      console.error('좋아요 업데이트 중 오류:', error)
      throw createError({ statusCode: 500, statusMessage: '좋아요 업데이트 실패' })
    }
  }

  // DELETE 요청 처리
  if (method === 'DELETE') {
    const { id } = await readBody(event)
    try {
      await prisma.humorPost.delete({
        where: { id: parseInt(id) }
      })
      return { success: true }
    } catch (error) {
      console.error('유머 게시글 삭제 중 오류:', error)
      throw createError({ statusCode: 500, statusMessage: '유머 게시글 삭제 실패' })
    }
  }

  // 지원하지 않는 메소드에 대한 처리
  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
})