import prisma from '~/server/utils/prisma'
import bcrypt from 'bcrypt'
import * as jose from 'jose'

export default defineEventHandler(async (event) => {
  // 인증 확인
  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: '인증이 필요합니다.'
    })
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)
    
    if (payload.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        statusMessage: '관리자 권한이 필요합니다.'
      })
    }
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: '유효하지 않은 토큰입니다.'
    })
  }

  const userId = parseInt(getRouterParam(event, 'id'))
  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: '유효하지 않은 사용자 ID입니다.'
    })
  }

  const body = await readBody(event)
  const { username, email, password, role, isActive } = body

  // 필수 필드 검증
  if (!username || !email) {
    throw createError({
      statusCode: 400,
      statusMessage: '사용자명과 이메일은 필수입니다.'
    })
  }

  // 역할 검증
  if (role && !['USER', 'ADMIN'].includes(role)) {
    throw createError({
      statusCode: 400,
      statusMessage: '유효하지 않은 역할입니다.'
    })
  }

  try {
    // 사용자 존재 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      throw createError({
        statusCode: 404,
        statusMessage: '사용자를 찾을 수 없습니다.'
      })
    }

    // 중복 사용자명/이메일 확인 (자신 제외)
    const duplicateUser = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: userId } },
          {
            OR: [
              { username },
              { email }
            ]
          }
        ]
      }
    })

    if (duplicateUser) {
      throw createError({
        statusCode: 409,
        statusMessage: '이미 존재하는 사용자명 또는 이메일입니다.'
      })
    }

    // 업데이트할 데이터 준비
    const updateData = {
      username,
      email,
      role: role || existingUser.role,
      isActive: isActive !== undefined ? isActive : existingUser.isActive
    }

    // 비밀번호가 제공된 경우에만 해싱하여 업데이트
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return {
      success: true,
      message: '사용자 정보가 성공적으로 업데이트되었습니다.',
      user: updatedUser
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('사용자 업데이트 오류:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '사용자 정보 업데이트 중 오류가 발생했습니다.'
    })
  }
}) 