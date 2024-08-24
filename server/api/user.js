import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import * as jose from 'jose'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { type } = query

  if (type === 'login') {
    return handleLogin(event)
  } else if (type === 'logout') {
    return handleLogout(event)
  } else {
    return createError({
      statusCode: 400,
      statusMessage: '잘못된 요청입니다.',
    })
  }
})

async function handleLogin(event) {
  const body = await readBody(event)
  const { username, password } = body

  if (!username || !password) {
    return createError({
      statusCode: 400,
      statusMessage: '사용자 이름과 비밀번호를 모두 입력해주세요.',
    })
  }

  const user = await prisma.user.findUnique({
    where: { username: username },
  })

  if (!user) {
    return createError({
      statusCode: 401,
      statusMessage: '사용자를 찾을 수 없습니다.',
    })
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    return createError({
      statusCode: 401,
      statusMessage: '비밀번호가 일치하지 않습니다.',
    })
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET)
  const token = await new jose.SignJWT({ userId: user.id, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(secret)

  // 쿠키에 토큰 저장
  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60, // 1시간
    path: '/'
  })

  return { message: '로그인 성공', user: { id: user.id, username: user.username, role: user.role } }
}

function handleLogout(event) {
  // 쿠키에서 토큰 제거
  deleteCookie(event, 'auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  })

  return { message: '로그아웃 성공' }
}

// Create test user
async function createTestUser() {
  const hashedPassword = await bcrypt.hash('15234', 10)
  
  try {
    const user = await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com',
        role: 'ADMIN',
      },
    })
    console.log('Test user created:', user)
  } catch (error) {
    console.error('Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// createTestUser()