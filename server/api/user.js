import prisma from '~/server/utils/prisma'
import bcrypt from 'bcrypt'
import * as jose from 'jose'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

/**
 * @file 사용자 관련 API 엔드포인트
 * @description 로그인, 로그아웃, 인증 확인, 회원가입, 사용자 정보 업데이트 등 사용자 관련 모든 API 요청을 처리합니다.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { type } = query

  // 'type' 쿼리 파라미터에 따라 적절한 핸들러 함수를 호출합니다.
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
    // 유효하지 않은 'type'이거나 'type'이 없는 경우 400 Bad Request 오류를 반환합니다.
    return handleApiError(400, '잘못된 요청입니다.')
  }
})

/**
 * @function handleLogin
 * @description 사용자 로그인 요청을 처리합니다. 사용자 이름과 비밀번호를 검증하고, 유효한 경우 JWT를 발급하여 쿠키에 설정합니다.
 * @param {object} event - Nuxt.js 이벤트 객체
 * @returns {object} 로그인 성공 메시지와 사용자 정보 (id, username, role)
 * @throws {Error} 유효성 검사 실패, 사용자 없음, 비밀번호 불일치, 서버 오류 시 오류 반환
 */
async function handleLogin(event) {
  const body = await readBody(event)
  const { username, password } = body

  // 필수 필드 검증
  if (!username || !password) {
    return handleApiError(400, '사용자 이름과 비밀번호를 모두 입력해주세요.')
  }

  // 사용자 이름으로 사용자 조회
  const user = await prisma.user.findUnique({
    where: { username: username },
  })

  // 사용자가 없는 경우 오류 반환
  if (!user) {
    return handleApiError(401, '사용자를 찾을 수 없습니다.')
  }

  // 비밀번호 검증
  const isPasswordValid = await bcrypt.compare(password, user.password)

  // 비밀번호가 일치하지 않는 경우 오류 반환
  if (!isPasswordValid) {
    return handleApiError(401, '비밀번호가 일치하지 않습니다.')
  }

  // JWT Secret 가져오기 및 토큰 생성
  const secret = new TextEncoder().encode(process.env.JWT_SECRET)
  const token = await new jose.SignJWT({ userId: user.id, role: user.role, username: user.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h') // 토큰 유효 기간 1시간
    .sign(secret)

  // HTTP Only 및 Secure 속성을 가진 쿠키에 토큰 저장
  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // production 환경에서만 secure 설정
    maxAge: 60 * 60, // 쿠키 유효 기간 1시간 (초 단위)
    path: '/' // 모든 경로에서 쿠키 접근 가능
  })

  // 로그인 성공 응답
  return { message: '로그인 성공', user: { id: user.id, username: user.username, role: user.role } }
}

/**
 * @function handleLogout
 * @description 사용자 로그아웃 요청을 처리합니다. 쿠키에서 JWT 토큰을 제거합니다.
 * @param {object} event - Nuxt.js 이벤트 객체
 * @returns {object} 로그아웃 성공 메시지
 */
function handleLogout(event) {
  // 쿠키에서 인증 토큰 제거
  deleteCookie(event, 'auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  })

  // 로그아웃 성공 응답
  return { message: '로그아웃 성공' }
}

/**
 * @function handleCheck
 * @description 현재 사용자의 인증 상태를 확인합니다. 쿠키의 JWT 토큰을 검증하고 사용자 정보를 반환합니다.
 * @param {object} event - Nuxt.js 이벤트 객체
 * @returns {object} isLoggedIn 상태와 사용자 정보 (인증되지 않은 경우 null)
 */
async function handleCheck(event) {
  const token = getCookie(event, 'auth_token')
  
  // 토큰이 없는 경우 인증되지 않음으로 처리
  if (!token) {
    return { isLoggedIn: false, user: null }
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)
    
    // 토큰 페이로드의 userId로 사용자 정보 조회 (비밀번호 제외)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, username: true, role: true, email: true}
    })

    // 사용자 정보가 없거나 유효하지 않은 경우 인증되지 않음으로 처리
    if (!user) {
      return { isLoggedIn: false, user: null }
    }

    // 인증 성공 및 사용자 정보 반환
    return { isLoggedIn: true, user }
  } catch (error) {
    // 토큰 검증 실패 시 오류 로깅 및 인증되지 않음으로 처리
    console.error('Token verification error:', error)
    return { isLoggedIn: false, user: null }
  }
}

/**
 * @function handleRegister
 * @description 새로운 사용자 회원가입 요청을 처리합니다. 사용자 이름과 이메일 중복을 확인하고, 비밀번호를 해싱하여 새 사용자를 생성합니다.
 * @param {object} event - Nuxt.js 이벤트 객체
 * @returns {object} 회원가입 성공 메시지와 사용자 정보 (id, username, role)
 * @throws {Error} 필수 필드 누락, 사용자 이름/이메일 중복, 서버 오류 시 오류 반환
 */
async function handleRegister(event) {
  const body = await readBody(event)
  const { username, email, password } = body

  // 필수 필드 검증
  if (!username || !email || !password) {
    return handleApiError(400, '모든 필드를 입력해주세요.')
  }

  // 사용자 이름 중복 확인
  const existingUserByUsername = await prisma.user.findUnique({
    where: { username: username },
  })
  if (existingUserByUsername) {
    return handleApiError(409, '이미 사용 중인 사용자 이름입니다.')
  }

  // 이메일 중복 확인
  const existingUserByEmail = await prisma.user.findUnique({
    where: { email: email },
  })
  if (existingUserByEmail) {
    return handleApiError(409, '이미 사용 중인 이메일입니다.')
  }

  try {
    // 비밀번호 해싱 및 사용자 생성
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'USER', // 기본 역할은 'USER'
      },
    })

    // JWT Secret 가져오기 및 토큰 생성
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const token = await new jose.SignJWT({ userId: user.id, role: user.role, username: user.username })
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

    // 회원가입 성공 응답
    return { message: '회원가입 성공', user: { id: user.id, username: user.username, role: user.role } }
  } catch (error) {
    console.error('Register error:', error)
    return handleApiError(500, '회원가입 중 오류가 발생했습니다.')
  }
}

/**
 * @function handleUpdate
 * @description 로그인된 사용자의 정보를 업데이트합니다 (이메일, 비밀번호). 사용자 이름은 수정할 수 없습니다.
 * @param {object} event - Nuxt.js 이벤트 객체
 * @returns {object} 업데이트 성공 메시지와 업데이트된 사용자 정보
 * @throws {Error} 인증되지 않은 사용자, 필수 필드 누락, 서버 오류 시 오류 반환
 */
async function handleUpdate(event) {
  const token = getCookie(event, 'auth_token')
  
  // 토큰이 없는 경우 인증되지 않음 오류 반환
  if (!token) {
    return handleApiError(401, '인증되지 않은 사용자입니다.')
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)
    
    const body = await readBody(event)
    const { email, password } = body // username은 수정 불가능

    const dataToUpdate = {
      email,
    };

    // 비밀번호가 제공된 경우 해싱하여 업데이트 데이터에 추가
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      dataToUpdate.password = hashedPassword;
    }

    // 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: dataToUpdate,
      select: { id: true, username: true, email: true, role: true } // 업데이트된 사용자 정보 반환 (비밀번호 제외)
    })

    return { success: true, user: updatedUser }
  } catch (error) {
    console.error('User update error:', error)
    return handleApiError(500, '사용자 정보 업데이트 중 오류가 발생했습니다.')
  }
}

// 이 함수는 초기 시딩에 사용되며, API 로직의 일부가 아니므로 주석 처리하거나 seed.js로 옮기는 것이 좋습니다.
// 현재 seed.js에 이미 통합되어 있으므로, 이 파일에서는 제거합니다.
// async function createTestUser() {
//   const hashedPassword = await bcrypt.hash('15234', 10)
//   
//   try {
//     const user = await prisma.user.create({
//       data: {
//         username: 'admin',
//         password: hashedPassword,
//         email: 'admin@example.com',
//         role: 'ADMIN',
//       },
//     })
//     console.log('Test user created:', user)
//   } catch (error) {
//     console.error('Error creating test user:', error)
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// createTestUser()