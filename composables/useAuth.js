import { useState } from '#app'
import { computed } from 'vue'

// 사용자 인증 상태 및 관련 기능 제공 컴포저블
export function useAuth() {
  const authState = useState('auth', () => ({
    isLoggedIn: false,
    user: null,
  }))

  const setAuth = (isLoggedIn, user) => {
    authState.value = { isLoggedIn, user }
  }

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/user?type=check')
      if (response.ok) {
        const data = await response.json()
        setAuth(true, data.user)
      } else {
        setAuth(false, null)
      }
    } catch (error) {
      console.error('인증 확인 중 오류 발생:', error)
      setAuth(false, null)
    }
  }

  return {
    isLoggedIn: computed(() => authState.value?.isLoggedIn),
    user: computed(() => authState.value?.user),
    isAdmin: computed(() => !!(authState.value.isLoggedIn && authState.value.user?.role?.toLowerCase() === 'admin')),
    setAuth,
    checkAuth,
  }
}