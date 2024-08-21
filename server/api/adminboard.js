import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  // GET 요청 처리
  if (method === 'GET') {
    const { id, page = 1, limit = 10, searchType, searchText, sortColumn, sortOrder } = getQuery(event)
    
    if (id && id !== '-1') {
      const post = await prisma.adminBoard.findUnique({
        where: { id: parseInt(id) }
      })
      return post || createError({ statusCode: 404, statusMessage: '관리자 게시글을 찾을 수 없습니다' })
    } else {
      const skip = (page - 1) * limit
      let whereClause = {}

      if (searchText) {
        if (searchType === 'author') {
          whereClause.author = { contains: searchText }
        } else if (searchType === 'title') {
          whereClause.title = { contains: searchText }
        } else if (searchType === 'content') {
          whereClause.content = { contains: searchText }
        }
      }

      let orderBy = {}
      if (sortColumn && sortOrder) {
        orderBy[sortColumn] = sortOrder.toLowerCase()
      } else {
        orderBy = { id: 'desc' } // 기본 정렬
      }

      const [posts, totalCount] = await Promise.all([
        prisma.adminBoard.findMany({
          where: whereClause,
          orderBy: orderBy,
          take: parseInt(limit),
          skip: skip
        }),
        prisma.adminBoard.count({ where: whereClause })
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
    const { title, content } = await readBody(event)
    try {
      const result = await prisma.adminBoard.create({
        data: { title, content }
      })
      return { success: true, id: result.id }
    } catch (error) {
      console.error('관리자 게시글 생성 중 오류:', error)
      throw createError({ statusCode: 500, statusMessage: '관리자 게시글 생성 실패' })
    }
  }

  // PUT 요청 처리
  if (method === 'PUT') {
    const { id, title, content } = await readBody(event)
    try {
      await prisma.adminBoard.update({
        where: { id: parseInt(id) },
        data: { title, content }
      })
      return { success: true }
    } catch (error) {
      console.error('관리자 게시글 업데이트 중 오류:', error)
      throw createError({ statusCode: 500, statusMessage: '관리자 게시글 업데이트 실패' })
    }
  }

  // DELETE 요청 처리
  if (method === 'DELETE') {
    const { id } = await readBody(event)
    try {
      await prisma.adminBoard.delete({
        where: { id: parseInt(id) }
      })
      return { success: true }
    } catch (error) {
      console.error('관리자 게시글 삭제 중 오류:', error)
      throw createError({ statusCode: 500, statusMessage: '관리자 게시글 삭제 실패' })
    }
  }

  // 지원하지 않는 메소드에 대한 처리
  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
})