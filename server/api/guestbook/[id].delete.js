import prisma from '~/server/utils/prisma'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

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
      handleApiError(null, '방명록을 찾을 수 없습니다.', 404);
    }

    if (post.password && post.password !== password) {
      handleApiError(null, '비밀번호가 일치하지 않습니다.', 401);
    }

    await prisma.guestbook.delete({
      where: { id: Number(id) }
    })

    return { success: true }
  } catch (error) {
    handleApiError(error, error.message || '방명록 삭제에 실패했습니다.', error.statusCode || 500);
  }
})
