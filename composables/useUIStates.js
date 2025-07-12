import { ref, computed } from 'vue'

/**
 * 간단한 UI 상태 관리 컴포저블
 * 복잡한 옵션들을 제거하고 핵심 기능만 제공
 */
export function useUIStates() {
  // 기본 상태들
  const loading = ref(false)
  const error = ref(null)
  const success = ref(false)
  const isEmpty = ref(false)

  // 메시지
  const message = ref('')

  // 계산된 속성들
  const hasError = computed(() => !!error.value)
  const hasSuccess = computed(() => success.value)
  const isLoading = computed(() => loading.value)

  // 기본 액션들
  const setLoading = (state) => { loading.value = state }
  const setError = (err) => { 
    error.value = err
    message.value = typeof err === 'string' ? err : err?.message || '오류가 발생했습니다'
  }
  const setSuccess = (msg = '성공했습니다') => { 
    success.value = true
    message.value = msg
  }
  const setEmpty = (state) => { isEmpty.value = state }

  // 상태 초기화
  const reset = () => {
    loading.value = false
    error.value = null
    success.value = false
    isEmpty.value = false
    message.value = ''
  }

  // 비동기 작업 래퍼
  const withLoading = async (fn) => {
    try {
      setLoading(true)
      const result = await fn()
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    // 상태
    loading: isLoading,
    error: hasError,
    success: hasSuccess,
    isEmpty,
    message,
    
    // 액션
    setLoading,
    setError,
    setSuccess,
    setEmpty,
    reset,
    withLoading
  }
} 