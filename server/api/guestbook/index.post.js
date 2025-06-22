import prisma from '~/server/utils/prisma'

/**
 * 새로운 방명록 게시물을 작성하는 핸들러입니다.
 * HTTP POST 요청을 처리합니다.
 *
 * @param {object} event - Nuxt.js 이벤트 객체. 요청 본문(body)을 포함합니다.
 * @returns {object} 생성된 방명록 게시물 객체.
 * @throws {Error} 방명록 작성 중 오류가 발생하면 500 상태 코드와 오류 메시지를 반환합니다.
 */
export default defineEventHandler(async (event) => {
  // 요청 본문(body)에서 title, content, author, password를 읽어옵니다.
  const body = await readBody(event)
  const { title, content, author, password } = body

  // 요청 수신 및 본문 내용을 콘솔에 로깅하여 디버깅에 도움을 줍니다.
  console.log('백엔드: 방명록 POST 요청 수신. 본문:', body);

  try {
    // Prisma를 사용하여 guestbook 테이블에 새 게시물을 생성합니다.
    const post = await prisma.guestbook.create({
      data: {
        title,    // 게시물 제목
        content,  // 게시물 내용
        author,   // 작성자
        password  // 비밀번호 (선택 사항)
      }
    })
    // 게시물 데이터베이스 저장 성공 시 콘솔에 결과를 로깅합니다.
    console.log('백엔드: 방명록 데이터베이스 저장 성공. 결과:', post);

    // 생성된 게시물 객체를 반환합니다.
    return post
  } catch (error) {
    // 방명록 작성 중 오류가 발생하면 콘솔에 로그를 기록합니다.
    console.error('백엔드: 방명록 작성 중 오류:', error)
    // 클라이언트에게 오류 응답을 반환합니다.
    throw createError({
      statusCode: 500, // HTTP 상태 코드 500 (Internal Server Error)
      message: '방명록 작성에 실패했습니다.' // 사용자에게 표시될 오류 메시지
    })
  }
})
