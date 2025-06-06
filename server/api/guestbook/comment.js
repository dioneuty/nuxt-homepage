import prisma from '~/server/utils/prisma'

// 댓글 작성
export const POST = defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { guestbookId, content, author, password } = body

  try {
    const comment = await prisma.guestbookComment.create({
      data: {
        content,
        author,
        password,
        guestbookId: Number(guestbookId)
      }
    })

    return comment
  } catch (error) {
    console.error('댓글 작성 중 오류:', error)
    throw createError({
      statusCode: 500,
      message: '댓글 작성에 실패했습니다.'
    })
  }
})

// 댓글 수정
export const PUT = defineEventHandler(async (event) => {
  const { id } = getQuery(event)
  const body = await readBody(event)
  const { content, password } = body

  try {
    // 비밀번호 확인
    const comment = await prisma.guestbookComment.findUnique({
      where: { id: Number(id) }
    })

    if (!comment) {
      throw createError({
        statusCode: 404,
        message: '댓글을 찾을 수 없습니다.'
      })
    }

    if (comment.password && comment.password !== password) {
      throw createError({
        statusCode: 401,
        message: '비밀번호가 일치하지 않습니다.'
      })
    }

    const updatedComment = await prisma.guestbookComment.update({
      where: { id: Number(id) },
      data: { content }
    })

    return updatedComment
  } catch (error) {
    console.error('댓글 수정 중 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '댓글 수정에 실패했습니다.'
    })
  }
})

// 댓글 삭제
export const DELETE = defineEventHandler(async (event) => {
  const { id } = getQuery(event)
  const { password } = await readBody(event)

  try {
    // 비밀번호 확인
    const comment = await prisma.guestbookComment.findUnique({
      where: { id: Number(id) }
    })

    if (!comment) {
      throw createError({
        statusCode: 404,
        message: '댓글을 찾을 수 없습니다.'
      })
    }

    if (comment.password && comment.password !== password) {
      throw createError({
        statusCode: 401,
        message: '비밀번호가 일치하지 않습니다.'
      })
    }

    await prisma.guestbookComment.delete({
      where: { id: Number(id) }
    })

    return { success: true }
  } catch (error) {
    console.error('댓글 삭제 중 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '댓글 삭제에 실패했습니다.'
    })
  }
}) 