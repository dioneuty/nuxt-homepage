import prisma from '~/server/utils/prisma'
import bcrypt from 'bcrypt'
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

  const body = await readBody(event)
  const { newPassword } = body

  if (!newPassword) {
    return handleApiError(event, 400, '새 비밀번호를 입력해주세요.')
  }

  if (newPassword.length < 4) {
    return handleApiError(event, 400, '비밀번호는 최소 4자 이상이어야 합니다.')
  }

  try {
    // 사용자 존재 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true }
    })

    if (!existingUser) {
      return handleApiError(event, 404, '사용자를 찾을 수 없습니다.')
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 비밀번호 업데이트
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    return {
      success: true,
      message: `사용자 '${existingUser.username}'의 비밀번호가 성공적으로 재설정되었습니다.`
    }
  } catch (error) {
    handleApiError(event, 500, '비밀번호 재설정 중 오류가 발생했습니다.', error)
  }
}) 