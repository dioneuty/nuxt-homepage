import prisma from '~/server/utils/prisma'

// 방명록 작성 (POST 요청)
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { title, content, author, password } = body

  console.log('백엔드: 방명록 POST 요청 수신. 본문:', body);

  try {
    const post = await prisma.guestbook.create({
      data: {
        title,
        content,
        author,
        password
      }
    })
    console.log('백엔드: 방명록 데이터베이스 저장 성공. 결과:', post);

    return post
  } catch (error) {
    console.error('백엔드: 방명록 작성 중 오류:', error)
    throw createError({
      statusCode: 500,
      message: '방명록 작성에 실패했습니다.'
    })
  }
})
