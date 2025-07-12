import prisma from '~/server/utils/prisma'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

// 사용자 이름 중복 확인 API
export default defineEventHandler(async (event) => {
  const { username } = getQuery(event)

  if (!username) {
    return handleApiError(event, 400, '사용자 이름을 입력해주세요.')
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } })
    
    return user 
      ? { available: false, message: '이미 사용 중인 사용자 이름입니다.' }
      : { available: true, message: '사용 가능한 사용자 이름입니다.' }
  } catch (error) {
    handleApiError(event, 500, '사용자 이름 중복 확인 중 서버 오류가 발생했습니다.', error)
  }
}) 