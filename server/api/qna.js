import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  // GET 요청 처리
  if (method === 'GET') {
    const { id, page = 1, limit = 10, searchType, searchText } = getQuery(event)
    
    if (id) {
      const qna = await prisma.qnA.findUnique({
        where: { id: parseInt(id) }
      })
      return qna || createError({ statusCode: 404, statusMessage: 'QnA를 찾을 수 없습니다' })
    } else {
      const skip = (page - 1) * limit
      let whereClause = {}

      if (searchText) {
        if (searchType === 'author') {
          whereClause.author = { contains: searchText }
        } else if (searchType === 'title') {
          whereClause.questionTitle = { contains: searchText }
        } else if (searchType === 'content') {
          whereClause.questionContent = { contains: searchText }
        }
      }

      const [qnas, totalCount] = await Promise.all([
        prisma.qnA.findMany({
          where: whereClause,
          orderBy: { id: 'desc' },
          take: parseInt(limit),
          skip: skip
        }),
        prisma.qnA.count({ where: whereClause })
      ])

      return {
        qnas,
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    }
  }

  // POST 요청 처리
  if (method === 'POST') {
    const { questionTitle, questionContent, author } = await readBody(event)
    try {
      const result = await prisma.qnA.create({
        data: { questionTitle, questionContent, author }
      })
      return { success: true, id: result.id }
    } catch (error) {
      console.error('QnA 생성 중 오류:', error)
      throw createError({ statusCode: 500, statusMessage: 'QnA 생성 실패' })
    }
  }

  // PUT 요청 처리
  if (method === 'PUT') {
    const { id, questionTitle, questionContent, answerContent, answerer } = await readBody(event)
    try {
      await prisma.qnA.update({
        where: { id: parseInt(id) },
        data: { questionTitle, questionContent, answerContent, answerer }
      })
      return { success: true }
    } catch (error) {
      console.error('QnA 업데이트 중 오류:', error)
      throw createError({ statusCode: 500, statusMessage: 'QnA 업데이트 실패' })
    }
  }

  // DELETE 요청 처리
  if (method === 'DELETE') {
    const { id } = await readBody(event)
    try {
      await prisma.qnA.delete({
        where: { id: parseInt(id) }
      })
      return { success: true }
    } catch (error) {
      console.error('QnA 삭제 중 오류:', error)
      throw createError({ statusCode: 500, statusMessage: 'QnA 삭제 실패' })
    }
  }
})