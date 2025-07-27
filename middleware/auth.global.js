import { defineNuxtRouteMiddleware } from '#app'
import { useRequestHeaders } from 'nuxt/app'
import * as jose from 'jose'

/**
 * 전역 인증 미들웨어입니다. 모든 라우트 요청에 대해 실행됩니다.
 * 주로 서버 사이드에서 JWT 토큰을 확인하여 사용자 인증 상태를 검증합니다.
 * 클라이언트 측에서는 사용자 세션 관리에 다른 메커니즘이 사용될 수 있습니다.
 * @param {object} to - 대상 라우트 객체
 * @param {object} from - 출발 라우트 객체 (이 미들웨어에서는 사용되지 않음)
 * @returns {Promise<void>} 토큰 검증 후 추가적인 동작 없이 흐름을 계속 진행
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  // 서버 사이드에서만 실행
  if (process.server) {
    const headers = useRequestHeaders(['authorization'])
    const token = headers['authorization']?.split(' ')[1]

    if (!token) {
      // 토큰이 없는 경우 처리
      // 예: 로그인 페이지로 리다이렉트 (여기서는 별도 처리 없이 미들웨어 종료)
      return
    }

    try {
      const jwtSecret = process.env.JWT_SECRET
      if (!jwtSecret) {
        throw new Error('JWT_SECRET이 정의되지 않았습니다.')
      }
      const secretKey = new TextEncoder().encode(jwtSecret)
      const { payload } = await jose.jwtVerify(token, secretKey)
      
      // 여기서 payload를 사용하여 추가적인 권한 체크 등을 수행할 수 있습니다.
      // 예: if (payload.role !== 'admin') { ... }
    } catch (error) {
      // 토큰이 유효하지 않은 경우 처리
      // 개발 환경에서만 상세 에러 로깅
      if (process.dev) {
        console.error('Token validation failed:', error)
      }
    }
  }
})