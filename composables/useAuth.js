import { useState } from '#app'
import { computed } from 'vue'

/**
 * 사용자 인증 상태 및 관련 기능을 제공하는 컴포저블 함수입니다.
 * 로그인 상태, 사용자 정보, 관리자 여부를 확인할 수 있으며,
 * 인증 상태를 설정하고 확인할 수 있는 함수를 제공합니다.
 * @returns {Object} 인증 관련 속성 및 함수
 * @property {ComputedRef<boolean>} isLoggedIn - 사용자의 로그인 여부
 * @property {ComputedRef<object|null>} user - 로그인된 사용자 객체 (id, username, role 포함)
 * @property {ComputedRef<boolean>} isAdmin - 사용자가 관리자인지 여부
 * @property {function(boolean, object|null): void} setAuth - 인증 상태를 수동으로 설정하는 함수
 * @property {function(): Promise<void>} checkAuth - 서버에 인증 상태를 확인하고 업데이트하는 함수
 */
export function useAuth() {
  /**
   * 인증 상태를 저장하는 반응형 상태입니다.
   * @type {Ref<{isLoggedIn: boolean, user: object|null}>}
   */
  const authState = useState('auth', () => ({
    isLoggedIn: false,
    user: null,
  }))

  /**
   * 인증 상태를 설정합니다.
   * @param {boolean} isLoggedIn - 로그인 여부
   * @param {object|null} user - 사용자 정보 객체 또는 null
   */
  function setAuth(isLoggedIn, user) {
    authState.value = { isLoggedIn, user }
  }

  /**
   * 서버에 현재 인증 상태를 확인하고 `authState`를 업데이트합니다.
   * API 요청 중 오류가 발생하면 `isLoggedIn`을 false로 설정합니다.
   * @async
   * @returns {Promise<void>}
   */
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
    isLoggedIn: computed(() => authState.value?.isLoggedIn),
    user: computed(() => authState.value?.user),
    isAdmin: computed(() => !!(authState.value.isLoggedIn && authState.value.user?.role?.toLowerCase() === 'admin')),
    setAuth,
    checkAuth,
  }
}