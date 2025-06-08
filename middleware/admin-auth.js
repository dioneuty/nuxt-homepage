import { useRequestHeaders } from 'nuxt/app'
import * as jose from 'jose'
import { useAuth } from '~/composables/useAuth';
import { navigateTo } from '#app';

export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = useAuth();

  // 클라이언트 측에서 사용자 정보가 로드되지 않았다면 checkAuth 호출하여 기다림
  if (process.client && !auth.user.value) {
    await auth.checkAuth();
  }

  // 서버 측 로직 (기존 로직 유지)
  if (process.server) {
    const headers = useRequestHeaders(['cookie'])
    const token = headers.cookie?.split(';').find(c => c.trim().startsWith('auth_token='))?.split('=')[1]

    if (!token) {
      return navigateTo('/error-unauthorized?reason=no-token', { redirectCode: 302 })
    }

    try {
      const jwtSecret = process.env.JWT_SECRET
      if (!jwtSecret) {
        throw new Error('JWT_SECRET이 정의되지 않았습니다.')
      }
      const secretKey = new TextEncoder().encode(jwtSecret)
      const { payload } = await jose.jwtVerify(token, secretKey)

      if (payload.role?.toLowerCase() !== 'admin') {
        return navigateTo('/error-unauthorized?reason=not-admin', { redirectCode: 302 })
      }

      auth.setAuth(true, { id: payload.userId, username: payload.username, role: payload.role });

    } catch (error) {
      console.error('[AuthMiddleware] Server-side: Admin auth error:', error);
      return navigateTo('/error-unauthorized?reason=invalid-token', { redirectCode: 302 })
    }
  }

  // 최종적으로 isAdmin 값을 확인하여 리다이렉트
  if (!auth.isAdmin.value) {
    return navigateTo('/error-unauthorized?reason=not-admin-middleware', { redirectCode: 302 });
  }
}) 