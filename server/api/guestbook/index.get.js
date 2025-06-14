import prisma from '~/server/utils/prisma'

// 방명록 목록 조회 (GET 요청)
export default defineEventHandler(async (event) => {
  const { page = 1, limit = 10 } = getQuery(event)
  const skip = (page - 1) * Number(limit) // limit을 숫자로 변환

  try {
    const [posts, totalCount] = await Promise.all([
      prisma.guestbook.findMany({
        skip,
        take: Number(limit),
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          comments: {
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      }),
      prisma.guestbook.count()
    ])

    return {
      posts,
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)) // limit을 숫자로 변환
    }
  } catch (error) {
    console.error('방명록 조회 중 오류:', error)
    throw createError({
      statusCode: 500,
      message: '방명록을 불러오는데 실패했습니다.'
    })
  }
})
