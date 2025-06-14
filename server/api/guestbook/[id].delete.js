import prisma from '~/server/utils/prisma'

// 방명록 삭제 (DELETE 요청)
export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event) // id를 getRouterParams로 가져옴
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
