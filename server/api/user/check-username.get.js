import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { username } = query

  if (!username) {
    return createError({
      statusCode: 400,
      statusMessage: '사용자 이름을 입력해주세요.',
    })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
    })

    if (user) {
      return {
        available: false,
        message: '이미 사용 중인 사용자 이름입니다.',
      }
    } else {
      return {
        available: true,
        message: '사용 가능한 사용자 이름입니다.',
      }
    }
  } catch (error) {
    console.error('Error checking username duplication:', error)
    return createError({
      statusCode: 500,
      statusMessage: '사용자 이름 중복 확인 중 서버 오류가 발생했습니다.',
    })
  }
}) 