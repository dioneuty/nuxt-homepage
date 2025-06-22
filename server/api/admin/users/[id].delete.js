import prisma from '~/server/utils/prisma'
import * as jose from 'jose'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

export default defineEventHandler(async (event) => {
  // 인증 확인
  const token = getCookie(event, 'auth_token')
  if (!token) {
    return handleApiError(event, 401, '인증이 필요합니다.')
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)
    
    if (payload.role !== 'ADMIN') {
      return handleApiError(event, 403, '관리자 권한이 필요합니다.')
    }
  } catch (error) {
    return handleApiError(event, 401, '유효하지 않은 토큰입니다.', error)
  }

  const userId = parseInt(getRouterParam(event, 'id'))
  if (isNaN(userId)) {
    return handleApiError(event, 400, '유효하지 않은 사용자 ID입니다.')
  }

  try {
    // 사용자 존재 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, role: true }
    })

    if (!existingUser) {
      return handleApiError(event, 404, '사용자를 찾을 수 없습니다.')
    }

    // 자기 자신을 삭제하려는 경우 방지
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jose.jwtVerify(getCookie(event, 'auth_token'), secret)
    
    if (payload.userId === userId) {
      return handleApiError(event, 400, '자기 자신을 삭제할 수 없습니다.')
    }

    // 사용자 삭제
    await prisma.user.delete({
      where: { id: userId }
    })

    return {
      success: true,
      message: `사용자 '${existingUser.username}'이 성공적으로 삭제되었습니다.`
    }
  } catch (error) {
    handleApiError(event, 500, '사용자 삭제 중 오류가 발생했습니다.', error)
  }
}) 