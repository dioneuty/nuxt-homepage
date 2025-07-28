import prisma from '~/server/utils/prisma'
import bcrypt from 'bcrypt'
import * as jose from 'jose'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

/**
 * @file 관리자 사용자 생성 API
 * @description 관리자 권한으로 새로운 사용자를 생성합니다. 사용자명, 이메일, 비밀번호, 역할, 활성화 상태를 설정할 수 있습니다.
 *              이 API는 JWT 토큰을 통한 인증 및 관리자 권한 확인이 필수적입니다.
 */
export default defineEventHandler(async (event) => {
  // 1. 인증 확인: 쿠키에서 JWT 토큰을 가져옵니다.
  const token = getCookie(event, 'auth_token')
  if (!token) {
    return handleApiError(event, 401, '인증이 필요합니다.')
  }

  try {
    // 2. 토큰 검증 및 페이로드 추출: JWT Secret을 사용하여 토큰의 유효성을 검증하고 사용자 정보를 추출합니다.
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)
    
    // 3. 권한 확인: 추출된 사용자 페이로드에서 역할(role)이 'ADMIN'인지 확인합니다.
    // 관리자가 아닌 경우 403 Forbidden 오류를 반환합니다.
    if (payload.role !== 'ADMIN') {
      return handleApiError(event, 403, '관리자 권한이 필요합니다.')
    }
  } catch (error) {
    // 토큰 검증 실패 시 (만료, 변조 등) 401 Unauthorized 오류를 반환합니다.
    return handleApiError(event, 401, '유효하지 않은 토큰입니다.', error)
  }

  // 4. 요청 본문 파싱: 사용자 생성에 필요한 데이터를 추출합니다.
  const body = await readBody(event)
  const { username, email, password, role, isActive } = body

  // 5. 필수 필드 검증
  if (!username || !email || !password) {
    return handleApiError(event, 400, '사용자명, 이메일, 비밀번호는 필수입니다.')
  }

  // 6. 역할 유효성 검증: 제공된 역할이 유효한 값('USER' 또는 'ADMIN')인지 확인합니다.
  if (role && !['USER', 'ADMIN'].includes(role)) {
    return handleApiError(event, 400, '유효하지 않은 역할입니다.')
  }

  try {
    // 7. 중복 사용자명/이메일 확인: 이미 존재하는 사용자명 또는 이메일인지 확인합니다.
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    })

    if (existingUser) {
      // 중복되는 경우 409 Conflict 오류를 반환합니다.
      return handleApiError(event, 409, '이미 존재하는 사용자명 또는 이메일입니다.')
    }

    // 8. 비밀번호 해싱: 보안을 위해 비밀번호를 해싱합니다.
    const hashedPassword = await bcrypt.hash(password, 10)

    // 9. 새 사용자 생성: Prisma를 사용하여 데이터베이스에 새로운 사용자 레코드를 생성합니다.
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: role || 'USER', // 역할이 제공되지 않으면 기본값으로 'USER'를 사용합니다.
        isActive: isActive !== undefined ? isActive : true, // isActive가 제공되지 않으면 기본값으로 true를 사용합니다.
        updatedAt: new Date(), // updatedAt 필드 추가
      },
      select: { // 보안을 위해 비밀번호 등 민감한 정보는 제외하고 필요한 필드만 선택합니다.
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // 10. 성공 응답 반환: 성공 메시지와 생성된 사용자 정보를 반환합니다.
    return {
      success: true,
      message: '사용자가 성공적으로 생성되었습니다.',
      user: newUser
    }
  } catch (error) {
    // Prisma 오류 또는 기타 서버 오류 처리
    handleApiError(event, 500, '사용자 생성 중 오류가 발생했습니다.', error)
  }
}) 