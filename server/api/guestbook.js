import { prisma } from '~/server/db/init.js'

// 방명록 목록 조회
export default defineEventHandler(async (event) => {
  const { page = 1, limit = 10 } = getQuery(event)
  const skip = (page - 1) * limit

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
      totalPages: Math.ceil(totalCount / limit)
    }
  } catch (error) {
    console.error('방명록 조회 중 오류:', error)
    throw createError({
      statusCode: 500,
      message: '방명록을 불러오는데 실패했습니다.'
    })
  }
})

// 방명록 작성
export const POST = defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { title, content, author, password } = body

  try {
    const post = await prisma.guestbook.create({
      data: {
        title,
        content,
        author,
        password
      }
    })

    return post
  } catch (error) {
    console.error('방명록 작성 중 오류:', error)
    throw createError({
      statusCode: 500,
      message: '방명록 작성에 실패했습니다.'
    })
  }
})

// 방명록 수정
export const PUT = defineEventHandler(async (event) => {
  const { id } = getQuery(event)
  const body = await readBody(event)
  const { title, content, password } = body

  try {
    // 비밀번호 확인
    const post = await prisma.guestbook.findUnique({
      where: { id: Number(id) }
    })

    if (!post) {
      throw createError({
        statusCode: 404,
        message: '방명록을 찾을 수 없습니다.'
      })
    }

    if (post.password && post.password !== password) {
      throw createError({
        statusCode: 401,
        message: '비밀번호가 일치하지 않습니다.'
      })
    }

    const updatedPost = await prisma.guestbook.update({
      where: { id: Number(id) },
      data: {
        title,
        content
      }
    })

    return updatedPost
  } catch (error) {
    console.error('방명록 수정 중 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '방명록 수정에 실패했습니다.'
    })
  }
})

// 방명록 삭제
export const DELETE = defineEventHandler(async (event) => {
  const { id } = getQuery(event)
  const { password } = await readBody(event)

  try {
    // 비밀번호 확인
    const post = await prisma.guestbook.findUnique({
      where: { id: Number(id) }
    })

    if (!post) {
      throw createError({
        statusCode: 404,
        message: '방명록을 찾을 수 없습니다.'
      })
    }

    if (post.password && post.password !== password) {
      throw createError({
        statusCode: 401,
        message: '비밀번호가 일치하지 않습니다.'
      })
    }

    await prisma.guestbook.delete({
      where: { id: Number(id) }
    })

    return { success: true }
  } catch (error) {
    console.error('방명록 삭제 중 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '방명록 삭제에 실패했습니다.'
    })
  }
}) 