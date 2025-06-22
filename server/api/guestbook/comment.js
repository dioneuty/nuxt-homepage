import prisma from '~/server/utils/prisma'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

/**
 * 방명록 댓글을 작성합니다.
 * HTTP POST 요청을 처리합니다.
 */
export const POST = defineEventHandler(async (event) => {
  // 요청 본문(body)에서 guestbookId, content, author, password를 읽어옵니다.
  const body = await readBody(event)
  const { guestbookId, content, author, password } = body

  try {
    // Prisma를 사용하여 guestbookComment 테이블에 새 댓글을 생성합니다.
    const comment = await prisma.guestbookComment.create({
      data: {
        content,      // 댓글 내용
        author,       // 작성자
        password,     // 비밀번호 (선택 사항)
        guestbookId: Number(guestbookId) // 연결된 방명록 게시물의 ID
      }
    })

    // 생성된 댓글 객체를 반환합니다.
    return comment
  } catch (error) {
    // 댓글 작성 중 오류가 발생하면 콘솔에 로그를 기록합니다.
    handleApiError(error, '댓글 작성에 실패했습니다.', 500);
  }
})

/**
 * 방명록 댓글을 수정합니다.
 * HTTP PUT 요청을 처리합니다.
 */
export const PUT = defineEventHandler(async (event) => {
  // 요청 쿼리(query)에서 댓글 ID를 가져옵니다.
  const { id } = getQuery(event)
  // 요청 본문(body)에서 수정할 내용(content)과 비밀번호(password)를 읽어옵니다.
  const body = await readBody(event)
  const { content, password } = body

  try {
    // 수정하려는 댓글의 비밀번호를 확인하기 위해 댓글을 조회합니다.
    const comment = await prisma.guestbookComment.findUnique({
      where: { id: Number(id) } // 댓글 ID로 조회
    })

    // 댓글이 존재하지 않는 경우 오류를 반환합니다.
    if (!comment) {
      handleApiError(null, '댓글을 찾을 수 없습니다.', 404);
    }

    // 댓글에 비밀번호가 설정되어 있고, 제공된 비밀번호와 일치하지 않는 경우 오류를 반환합니다.
    if (comment.password && comment.password !== password) {
      handleApiError(null, '비밀번호가 일치하지 않습니다.', 401);
    }

    // 비밀번호 확인이 완료되면 Prisma를 사용하여 댓글을 업데이트합니다.
    const updatedComment = await prisma.guestbookComment.update({
      where: { id: Number(id) }, // 댓글 ID로 업데이트할 댓글 지정
      data: { content } // 업데이트할 데이터 (내용)
    })

    // 업데이트된 댓글 객체를 반환합니다.
    return updatedComment
  } catch (error) {
    // 댓글 수정 중 오류가 발생하면 콘솔에 로그를 기록합니다。
    handleApiError(error, error.message || '댓글 수정에 실패했습니다.', error.statusCode || 500);
  }
})

/**
 * 방명록 댓글을 삭제합니다.
 * HTTP DELETE 요청을 처리합니다.
 */
export const DELETE = defineEventHandler(async (event) => {
  // 요청 쿼리(query)에서 댓글 ID를 가져옵니다.
  const { id } = getQuery(event)
  // 요청 본문(body)에서 비밀번호(password)를 읽어옵니다.
  const { password } = await readBody(event)

  try {
    // 삭제하려는 댓글의 비밀번호를 확인하기 위해 댓글을 조회합니다.
    const comment = await prisma.guestbookComment.findUnique({
      where: { id: Number(id) } // 댓글 ID로 조회
    })

    // 댓글이 존재하지 않는 경우 오류를 반환합니다.
    if (!comment) {
      handleApiError(null, '댓글을 찾을 수 없습니다.', 404);
    }

    // 댓글에 비밀번호가 설정되어 있고, 제공된 비밀번호와 일치하지 않는 경우 오류를 반환합니다.
    if (comment.password && comment.password !== password) {
      handleApiError(null, '비밀번호가 일치하지 않습니다.', 401);
    }

    // 비밀번호 확인이 완료되면 Prisma를 사용하여 댓글을 삭제합니다.
    await prisma.guestbookComment.delete({
      where: { id: Number(id) } // 댓글 ID로 삭제할 댓글 지정
    })

    // 삭제 성공 메시지를 반환합니다.
    return { success: true }
  } catch (error) {
    // 댓글 삭제 중 오류가 발생하면 콘솔에 로그를 기록합니다.
    handleApiError(error, error.message || '댓글 삭제에 실패했습니다.', error.statusCode || 500);
  }
}) 