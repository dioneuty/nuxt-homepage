import prisma from '~/server/utils/prisma'
import bcrypt from 'bcrypt'
import * as jose from 'jose'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

// 사용자 관련 API 엔드포인트
export default defineEventHandler(async (event) => {
  const { type } = getQuery(event)

  if (type === 'login') return handleLogin(event)
  if (type === 'logout') return handleLogout(event)
  if (type === 'check') return handleCheck(event)
  if (type === 'register') return handleRegister(event)
  if (type === 'update') return handleUpdate(event)
  
  return handleApiError(event, 400, '잘못된 요청입니다.')
})

// 로그인 처리
async function handleLogin(event) {
  const { username, password } = await readBody(event)

  if (!username || !password) {
    return handleApiError(event, 400, '사용자 이름과 비밀번호를 모두 입력해주세요.')
  }

  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) {
    return handleApiError(event, 401, '사용자를 찾을 수 없습니다.')
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    return handleApiError(event, 401, '비밀번호가 일치하지 않습니다.')
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET)
  const token = await new jose.SignJWT({ userId: user.id, role: user.role, username: user.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(secret)

  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60,
    path: '/'
  })

  return { message: '로그인 성공', user: { id: user.id, username: user.username, role: user.role } }
}

// 로그아웃 처리
function handleLogout(event) {
  deleteCookie(event, 'auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  })

  return { message: '로그아웃 성공' }
}

// 인증 상태 확인
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

    return user ? { isLoggedIn: true, user } : { isLoggedIn: false, user: null }
  } catch (error) {
    console.error('Token verification error:', error)
    return { isLoggedIn: false, user: null }
  }
}

// 회원가입 처리
async function handleRegister(event) {
  const { username, email, password } = await readBody(event)

  if (!username || !email || !password) {
    return handleApiError(event, 400, '모든 필드를 입력해주세요.')
  }

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] }
  })

  if (existingUser) {
    const field = existingUser.username === username ? '사용자 이름' : '이메일'
    return handleApiError(event, 409, `이미 사용 중인 ${field}입니다.`)
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword, role: 'USER', updatedAt: new Date() } // updatedAt 필드 추가
    })

    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const token = await new jose.SignJWT({ userId: user.id, role: user.role, username: user.username })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h')
      .sign(secret)

    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60,
      path: '/'
    })

    return { message: '회원가입 성공', user: { id: user.id, username: user.username, role: user.role } }
  } catch (error) {
    console.error('Registration error:', error)
    return handleApiError(event, 500, '회원가입 중 오류가 발생했습니다.')
  }
}

// 사용자 정보 업데이트
async function handleUpdate(event) {
  const token = getCookie(event, 'auth_token')
  
  if (!token) {
    return handleApiError(event, 401, '로그인이 필요합니다.')
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)
    
    const { username, email, password, currentPassword } = await readBody(event)

    if (!username && !email && !password) {
      return handleApiError(event, 400, '업데이트할 정보를 입력해주세요.')
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) {
      return handleApiError(event, 404, '사용자를 찾을 수 없습니다.')
    }

    if (password && !currentPassword) {
      return handleApiError(event, 400, '현재 비밀번호를 입력해주세요.')
    }

    if (password) {
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isCurrentPasswordValid) {
        return handleApiError(event, 401, '현재 비밀번호가 일치하지 않습니다.')
      }
    }

    const updateData = {}
    if (username && username !== user.username) {
      const existingUser = await prisma.user.findUnique({ where: { username } })
      if (existingUser) {
        return handleApiError(event, 409, '이미 사용 중인 사용자 이름입니다.')
      }
      updateData.username = username
    }

    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        return handleApiError(event, 409, '이미 사용 중인 이메일입니다.')
      }
      updateData.email = email
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    if (Object.keys(updateData).length === 0) {
      return handleApiError(event, 400, '변경할 정보가 없습니다.')
    }

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: updateData,
      select: { id: true, username: true, email: true, role: true }
    })

    return { message: '사용자 정보 업데이트 성공', user: updatedUser }
  } catch (error) {
    console.error('Update error:', error)
    return handleApiError(event, 500, '사용자 정보 업데이트 중 오류가 발생했습니다.')
  }
}