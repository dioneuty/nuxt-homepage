import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  // GET 요청 처리
  if (method === 'GET') {
    const { id, page = 1, limit = 10, searchType, searchText } = getQuery(event)

    if (id) {
      const contact = await prisma.contact.findUnique({
        where: { id: parseInt(id) }
      })
      return contact || createError({
        statusCode: 404,
        statusMessage: '연락처를 찾을 수 없습니다'
      })
    } else {
      const skip = (page - 1) * limit
      let whereClause = {}

      if (searchText) {
        if (searchType === 'name') {
          whereClause.name = { contains: searchText }
        } else if (searchType === 'email') {
          whereClause.email = { contains: searchText }
        } else if (searchType === 'message') {
          whereClause.message = { contains: searchText }
        }
      }

      const [contacts, totalCount] = await Promise.all([
        prisma.contact.findMany({
          where: whereClause,
          orderBy: { id: 'desc' },
          take: parseInt(limit),
          skip: skip
        }),
        prisma.contact.count({ where: whereClause })
      ])

      return {
        contacts,
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    }
  }

  // POST 요청 처리
  if (method === 'POST') {
    const { name, email, message } = await readBody(event)
    try {
      const result = await prisma.contact.create({
        data: { name, email, message }
      })
      return { success: true, id: result.id }
    } catch (error) {
      console.error('연락처 생성 중 오류:', error)
      throw createError({
        statusCode: 500,
        statusMessage: '연락처 생성 실패'
      })
    }
  }

  // DELETE 요청 처리
  if (method === 'DELETE') {
    const { id } = await readBody(event)
    try {
      await prisma.contact.delete({
        where: { id: parseInt(id) }
      })
      return { success: true }
    } catch (error) {
      console.error('연락처 삭제 중 오류:', error)
      throw createError({
        statusCode: 500,
        statusMessage: '연락처 삭제 실패'
      })
    }
  }

  // 지원하지 않는 메소드에 대한 처리
  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed'
  })
})