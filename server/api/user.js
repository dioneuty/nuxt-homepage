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
  } else if (type === 'check') {
    return handleCheck(event)
  } else if (type === 'register') {
    return handleRegister(event)
  } else if (type === 'update') {
    return handleUpdate(event)
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

async function handleCheck(event) {
  const token = getCookie(event, 'auth_token')
  
  if (!token) {
    return { isLoggedIn: false, user: null }
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, username: true, role: true, email: true}
    })

    if (!user) {
      return { isLoggedIn: false, user: null }
    }

    return { isLoggedIn: true, user }
  } catch (error) {
    console.error('Token verification error:', error)
    return { isLoggedIn: false, user: null }
  }
}

async function handleRegister(event) {
  const body = await readBody(event)
  const { username, email, password } = body

  if (!username || !email || !password) {
    return createError({
      statusCode: 400,
      statusMessage: '모든 필드를 입력해주세요.',
    })
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'USER',
      },
    })

    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const token = await new jose.SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h')
      .sign(secret)

    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60, // 1시간
      path: '/'
    })

    return { message: '회원가입 성공', user: { id: user.id, username: user.username, role: user.role } }
  } catch (error) {
    console.error('Register error:', error)
    return createError({
      statusCode: 500,
      statusMessage: '회원가입 중 오류가 발생했습니다.',
    })
  }
}

async function handleUpdate(event) {
  const token = getCookie(event, 'auth_token')
  
  if (!token) {
    return createError({
      statusCode: 401,
      statusMessage: '인증되지 않은 사용자입니다.',
    })
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)
    
    const body = await readBody(event)
    const { username, email, password } = body

    const hashedPassword = await bcrypt.hash(password, 10)

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        username,
        email,
        password: hashedPassword
      },
      select: { id: true, username: true, email: true, role: true }
    })

    return { success: true, user: updatedUser }
  } catch (error) {
    console.error('User update error:', error)
    return createError({
      statusCode: 500,
      statusMessage: '사용자 정보 업데이트 중 오류가 발생했습니다.',
    })
  }
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