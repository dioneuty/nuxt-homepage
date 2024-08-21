import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  // GET 요청 처리
  if (method === 'GET') {
    const { id, page = 1, itemsPerPage = 10, type, text, sortColumn, sortOrder } = getQuery(event)

    if (id) {
      const contact = await prisma.contact.findUnique({
        where: { id: parseInt(id) }
      })
      return contact || createError({
        statusCode: 404,
        statusMessage: '연락처를 찾을 수 없습니다'
      })
    } else {
      const skip = (page - 1) * itemsPerPage
      let whereClause = {}

      if (text) {
        if (type === 'author') {
          whereClause.author = { contains: text }
        } else if (type === 'title') {
          whereClause.title = { contains: text }
        } else if (type === 'content') {
          whereClause.content = { contains: text }
        }
      }

      let orderBy = {}
      if (sortColumn && sortOrder) {
        orderBy[sortColumn] = sortOrder.toLowerCase()
      } else {
        orderBy = { id: 'desc' } // 기본 정렬
      }

      const [posts, totalCount] = await Promise.all([
        prisma.contact.findMany({
          where: whereClause,
          orderBy: orderBy,
          take: parseInt(itemsPerPage),
          skip: skip
        }),
        prisma.contact.count({ where: whereClause })
      ])

      return {
        posts,
        total: totalCount,
        page: parseInt(page),
        itemsPerPage: parseInt(itemsPerPage)
      }
    }
  }

  // POST 요청 처리
  if (method === 'POST') {
    const body = await readBody(event)
    const { author, title, content, email, type, id } = body
    console.log(body)

    try {
      if (type === 'reply') {
        // 답변 생성 로직
        const originalPost = await prisma.contact.findUnique({
          where: { id: parseInt(id) }
        })

        if (!originalPost) {
          throw createError({
            statusCode: 404,
            statusMessage: '원본 문의를 찾을 수 없습니다'
          })
        }

        // 로그인한 사용자 정보 가져오기 (실제 구현에 맞게 수정 필요)
        const loggedInUser = await getLoggedInUser(event)

        const result = await prisma.contact.create({
          data: {
            title: `Re: ${originalPost.title}`,
            author: loggedInUser.name,
            email: loggedInUser.email,
            content,
          }
        })

        return { success: true, id: result.id }
      } else {
        // 기존 문의 생성 로직
        const result = await prisma.contact.create({
          data: { author, title, content, email }
        })
        return { success: true, id: result.id }
      }
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

// 로그인한 사용자 정보를 가져오는 함수 (실제 구현에 맞게 수정 필요)
async function getLoggedInUser(event) {
  // 여기에 실제 로그인한 사용자 정보를 가져오는 로직 구현
  // 예: JWT 토큰 확인, 세션 확인 등
  return {
    name: '관리자',
    email: 'admin@example.com'
  }
}