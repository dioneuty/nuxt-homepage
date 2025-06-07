import { useRequestHeaders } from 'nuxt/app'
import * as jose from 'jose'

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.server) {
    const headers = useRequestHeaders(['cookie'])
    const token = headers.cookie?.split(';').find(c => c.trim().startsWith('auth_token='))?.split('=')[1]

    if (!token) {
      // 토큰이 없으면 권한 없음 페이지로 리다이렉트
      return navigateTo('/error-unauthorized?reason=no-token')
    }

    try {
      const jwtSecret = process.env.JWT_SECRET
      if (!jwtSecret) {
        throw new Error('JWT_SECRET이 정의되지 않았습니다.')
      }
      const secretKey = new TextEncoder().encode(jwtSecret)
      const { payload } = await jose.jwtVerify(token, secretKey)

      // 역할(role)을 소문자로 변환하여 'admin'과 비교
      if (payload.role?.toLowerCase() !== 'admin') {
        return navigateTo('/error-unauthorized?reason=not-admin')
      }
      
      // 관리자일 경우, 요청에 사용자 정보를 추가하여 페이지에서 활용할 수 있도록 함
      to.meta.user = payload

    } catch (error) {
      console.error('Admin auth error:', error)
      // 토큰이 유효하지 않은 경우도 권한 없음 페이지로 리다이렉트
      return navigateTo('/error-unauthorized?reason=invalid-token')
    }
  }
}) 