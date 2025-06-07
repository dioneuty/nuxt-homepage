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

  const body = await readBody(event)
  const { username, email, password, role, isActive } = body

  // 필수 필드 검증
  if (!username || !email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: '사용자명, 이메일, 비밀번호는 필수입니다.'
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
    // 중복 사용자명/이메일 확인
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    })

    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: '이미 존재하는 사용자명 또는 이메일입니다.'
      })
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10)

    // 새 사용자 생성
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: role || 'USER',
        isActive: isActive !== undefined ? isActive : true
      },
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
      message: '사용자가 성공적으로 생성되었습니다.',
      user: newUser
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('사용자 생성 오류:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '사용자 생성 중 오류가 발생했습니다.'
    })
  }
}) 