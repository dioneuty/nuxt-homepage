import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  // GET 요청 처리
  if (method === 'GET') {
    const { id, page = 1, limit = 10, searchType, searchText } = getQuery(event)
    try {
      if (id && id !== '-1') {
        const post = await prisma.boardPost.findUnique({
          where: { id: parseInt(id) }
        })
        if (post) {
          return post
        } else {
          throw createError({
            statusCode: 404,
            statusMessage: '게시글을 찾을 수 없습니다'
          })
        }
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

        const [posts, totalCount] = await Promise.all([
          prisma.boardPost.findMany({
            where: whereClause,
            orderBy: { id: 'desc' },
            take: parseInt(limit),
            skip: skip
          }),
          prisma.boardPost.count({ where: whereClause })
        ])

        return {
          posts,
          total: totalCount,
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    } catch (error) {
      console.error('게시글 조회 중 오류:', error)
      throw createError({
        statusCode: 500,
        statusMessage: '서버 오류'
      })
    }
  }

  // POST 요청 처리
  if (method === 'POST') {
    const { title, author, content } = await readBody(event)
    try {
      const result = await prisma.boardPost.create({
        data: { title, author, content }
      })
      return { success: true, id: result.id }
    } catch (error) {
      console.error('게시글 생성 중 오류:', error)
      throw createError({
        statusCode: 500,
        statusMessage: '게시글 생성 실패'
      })
    }
  }

  // PUT 요청 처리
  if (method === 'PUT') {
    const { title, content, id, author } = await readBody(event)
    try {
      await prisma.boardPost.update({
        where: { id: parseInt(id) },
        data: { title, content, author }
      })
      return { success: true }
    } catch (error) {
      console.error('게시글 업데이트 중 오류:', error)
      throw createError({
        statusCode: 500,
        statusMessage: '게시글 업데이트 실패'
      })
    }
  }

  // DELETE 요청 처리
  if (method === 'DELETE') {
    const { id } = await readBody(event)
    try {
      await prisma.boardPost.delete({
        where: { id: parseInt(id) }
      })
      return { success: true }
    } catch (error) {
      console.error('게시글 삭제 중 오류:', error)
      throw createError({
        statusCode: 500,
        statusMessage: '게시글 삭제 실패'
      })
    }
  }

  // 지원하지 않는 메소드에 대한 처리
  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed'
  })
})