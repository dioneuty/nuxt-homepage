import { defineNuxtRouteMiddleware } from '#app'
import { useRequestHeaders } from 'nuxt/app'
import * as jose from 'jose'

export default defineNuxtRouteMiddleware(async (to, from) => {
  // 서버 사이드에서만 실행
  if (process.server) {
    const headers = useRequestHeaders(['authorization'])
    const token = headers['authorization']?.split(' ')[1]

    if (!token) {
      // 토큰이 없는 경우 처리
      // 예: 로그인 페이지로 리다이렉트
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
      // 예: 로그인 페이지로 리다이렉트
      console.error('Invalid token:', error)
    }
  }
})