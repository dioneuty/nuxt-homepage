import prisma from '~/server/utils/prisma'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

/**
 * @file 사용자 이름 중복 확인 API
 * @description 새로운 사용자 회원가입 시 사용자 이름의 중복 여부를 확인하는 기능을 제공합니다.
 */
export default defineEventHandler(async (event) => {
  // 1. 쿼리 파라미터에서 'username'을 추출합니다.
  const query = getQuery(event)
  const { username } = query

  // 2. 'username'이 제공되지 않은 경우 400 Bad Request 오류를 반환합니다.
  if (!username) {
    return handleApiError(event, 400, '사용자 이름을 입력해주세요.')
  }

  try {
    // 3. Prisma를 사용하여 데이터베이스에서 해당 사용자 이름이 존재하는지 조회합니다.
    const user = await prisma.user.findUnique({
      where: { username: username },
    })

    // 4. 조회 결과에 따라 사용자 이름의 가용 여부를 반환합니다.
    if (user) {
      // 사용자가 존재하는 경우: 중복이므로 사용 불가능
      return {
        available: false,
        message: '이미 사용 중인 사용자 이름입니다.',
      }
    } else {
      // 사용자가 존재하지 않는 경우: 사용 가능
      return {
        available: true,
        message: '사용 가능한 사용자 이름입니다.',
      }
    }
  } catch (error) {
    // 5. 데이터베이스 조회 중 오류 발생 시 로깅하고 500 Internal Server Error를 반환합니다.
    handleApiError(event, 500, '사용자 이름 중복 확인 중 서버 오류가 발생했습니다.', error)
  }
}) 