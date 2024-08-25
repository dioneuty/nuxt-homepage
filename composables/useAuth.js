import { useState } from '#app'

export function useAuth() {
  const auth = useState('auth', () => ({
    isLoggedIn: false,
    user: null
  }))

  const setAuth = (isLoggedIn, user) => {
    auth.value = { isLoggedIn, user }
  }

  async function checkAuth() {
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
    auth,
    setAuth,
    checkAuth
  }
}