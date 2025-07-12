import prisma from '~/server/utils/prisma'
import { handleApiError } from '~/server/utils/apiErrorHandlers'
import { executePaginatedQuery } from '~/server/utils/pagination'
import { buildBoardSpecificWhere, buildOrderBy } from '~/server/utils/queryBuilder'

// QnA (질문과 답변) API
export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  if (method === 'GET') {
    const { id, page = 1, itemsPerPage = 10, type, text } = getQuery(event)
    
    if (id) {
      const qna = await prisma.qnA.findUnique({ where: { id: parseInt(id) } })
      if (!qna) handleApiError(event, 404, 'QnA를 찾을 수 없습니다')
      return qna;
    }

    const searchParams = { type, text }
    const whereClause = buildBoardSpecificWhere('qna', searchParams)
    const orderBy = buildOrderBy(null, null, { id: 'desc' })

    const result = await executePaginatedQuery(prisma.qnA, {
      where: whereClause,
      orderBy,
      page,
      limit: itemsPerPage
    })

    return {
      qnas: result.posts,
      total: result.total,
      page: result.page,
      itemsPerPage: result.itemsPerPage
    }
  }

  if (method === 'POST') {
    const { questionTitle, questionContent, author } = await readBody(event)
    try {
      const result = await prisma.qnA.create({ data: { questionTitle, questionContent, author } })
      return { success: true, id: result.id }
    } catch (error) {
      handleApiError(event, 500, 'QnA 생성 실패', error)
    }
  }

  if (method === 'PUT') {
    const { id, questionTitle, questionContent, answerContent, answerer } = await readBody(event)
    try {
      await prisma.qnA.update({
        where: { id: parseInt(id) },
        data: { questionTitle, questionContent, answerContent, answerer }
      })
      return { success: true }
    } catch (error) {
      handleApiError(event, 500, 'QnA 업데이트 실패', error)
    }
  }

  if (method === 'DELETE') {
    const { id } = await readBody(event)
    try {
      await prisma.qnA.delete({ where: { id: parseInt(id) } })
      return { success: true }
    } catch (error) {
      handleApiError(event, 500, 'QnA 삭제 실패', error)
    }
  }

  handleApiError(event, 405, 'Method Not Allowed')
})