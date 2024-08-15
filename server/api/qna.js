import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  // GET 요청 처리
  if (method === 'GET') {
    const { id, page = 1, itemsPerPage = 10, type, text } = getQuery(event)
    
    if (id) {
      const qna = await prisma.qnA.findUnique({
        where: { id: parseInt(id) }
      })
      return qna || createError({ statusCode: 404, statusMessage: 'QnA를 찾을 수 없습니다' })
    } else {
      const skip = (parseInt(page) - 1) * parseInt(itemsPerPage)
      let whereClause = {}

      if (text) {
        if (type === 'author') {
          whereClause.author = { contains: text }
        } else if (type === 'title') {
          whereClause.questionTitle = { contains: text }
        } else if (type === 'content') {
          whereClause.questionContent = { contains: text }
        } else {
          // 타입이 지정되지 않은 경우 모든 필드에서 검색
          whereClause.OR = [
            { author: { contains: text } },
            { questionTitle: { contains: text } },
            { questionContent: { contains: text } }
          ]
        }
      }

      const [qnas, totalCount] = await Promise.all([
        prisma.qnA.findMany({
          where: whereClause,
          orderBy: { id: 'desc' },
          take: parseInt(itemsPerPage),
          skip: skip
        }),
        prisma.qnA.count({ where: whereClause })
      ])

      return {
        qnas,
        total: totalCount,
        page: parseInt(page),
        itemsPerPage: parseInt(itemsPerPage)
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