import { ref, computed, watch } from 'vue'

/**
 * 공통 UI 상태 관리 컴포저블 함수입니다.
 * 여러 컴포넌트에서 반복되는 로딩, 에러, 성공, 빈 상태 관리 로직을 통합합니다.
 * 실제 UI 표시(모달, 토스트)는 기존 컴포저블을 활용하고, 이 컴포저블은 상태 관리에만 집중합니다.
 * 
 * @param {Object} options - 설정 옵션
 * @param {boolean} options.autoReset - 성공/에러 상태 자동 리셋 여부 (기본: true)
 * @param {number} options.autoResetDelay - 자동 리셋 지연 시간(ms) (기본: 3000)
 * @param {boolean} options.logErrors - 에러 자동 로깅 여부 (기본: true)
 * @returns {Object} UI 상태 관리 관련 속성 및 함수들
 */
export function useUIStates(options = {}) {
  const {
    autoReset = true,
    autoResetDelay = 3000,
    logErrors = true
  } = options

  // 기본 UI 상태들
  const loading = ref(false)
  const error = ref(null)
  const success = ref(false)
  const isEmpty = ref(false)
  const pending = ref(false)

  // 성공/에러 메시지
  const successMessage = ref('')
  const errorMessage = ref('')

  // 자동 리셋 타이머
  let autoResetTimer = null

  /**
   * 로딩 상태를 시작합니다.
   * @param {boolean} isPending - pending 상태도 함께 설정할지 여부
   */
  function startLoading(isPending = false) {
    loading.value = true
    if (isPending) {
      pending.value = true
    }
    // 로딩 시작 시 이전 상태들 초기화
    clearStates()
  }

  /**
   * 로딩 상태를 종료합니다.
   * @param {boolean} isPending - pending 상태도 함께 해제할지 여부
   */
  function stopLoading(isPending = true) {
    loading.value = false
    if (isPending) {
      pending.value = false
    }
  }

  /**
   * 성공 상태를 설정합니다.
   * @param {string} message - 성공 메시지
   * @param {boolean} stopLoadingState - 로딩 상태도 함께 종료할지 여부
   */
  function setSuccess(message = '', stopLoadingState = true) {
    if (stopLoadingState) {
      stopLoading()
    }
    success.value = true
    successMessage.value = message
    error.value = null
    errorMessage.value = ''
    
    if (autoReset) {
      scheduleAutoReset()
    }
  }

  /**
   * 에러 상태를 설정합니다.
   * @param {string|Error} errorData - 에러 메시지 또는 에러 객체
   * @param {boolean} stopLoadingState - 로딩 상태도 함께 종료할지 여부
   */
  function setError(errorData, stopLoadingState = true) {
    if (stopLoadingState) {
      stopLoading()
    }
    
    let message = ''
    if (typeof errorData === 'string') {
      message = errorData
    } else if (errorData instanceof Error) {
      message = errorData.message
    } else if (errorData?.message) {
      message = errorData.message
    } else {
      message = '알 수 없는 오류가 발생했습니다.'
    }

    error.value = errorData
    errorMessage.value = message
    success.value = false
    successMessage.value = ''

    if (logErrors) {
      console.error('UI State Error:', errorData)
    }

    if (autoReset) {
      scheduleAutoReset()
    }
  }

  /**
   * 빈 상태를 설정합니다.
   * @param {boolean} empty - 빈 상태 여부
   * @param {boolean} stopLoadingState - 로딩 상태도 함께 종료할지 여부
   */
  function setEmpty(empty = true, stopLoadingState = true) {
    if (stopLoadingState) {
      stopLoading()
    }
    isEmpty.value = empty
    if (empty) {
      // 빈 상태일 때는 다른 상태들 초기화
      error.value = null
      errorMessage.value = ''
      success.value = false
      successMessage.value = ''
    }
  }

  /**
   * 모든 상태를 초기화합니다.
   */
  function clearStates() {
    error.value = null
    errorMessage.value = ''
    success.value = false
    successMessage.value = ''
    isEmpty.value = false
    
    if (autoResetTimer) {
      clearTimeout(autoResetTimer)
      autoResetTimer = null
    }
  }

  /**
   * 모든 상태를 완전히 리셋합니다.
   */
  function reset() {
    loading.value = false
    pending.value = false
    clearStates()
  }

  /**
   * 자동 리셋을 예약합니다.
   */
  function scheduleAutoReset() {
    if (autoResetTimer) {
      clearTimeout(autoResetTimer)
    }
    
    autoResetTimer = setTimeout(() => {
      clearStates()
    }, autoResetDelay)
  }

  /**
   * 데이터 배열이나 객체의 빈 상태를 체크하고 설정합니다.
   * @param {Array|Object|null|undefined} data - 체크할 데이터
   * @param {boolean} stopLoadingState - 로딩 상태도 함께 종료할지 여부
   */
  function checkAndSetEmpty(data, stopLoadingState = true) {
    const empty = !data || 
                  (Array.isArray(data) && data.length === 0) || 
                  (typeof data === 'object' && Object.keys(data).length === 0)
    
    setEmpty(empty, stopLoadingState)
    return empty
  }

  /**
   * 비동기 작업을 래핑하여 자동으로 로딩 상태를 관리합니다.
   * @param {Function} asyncFn - 실행할 비동기 함수
   * @param {Object} options - 옵션
   * @param {string} options.successMessage - 성공 메시지
   * @param {boolean} options.showSuccess - 성공 상태 표시 여부
   * @param {boolean} options.checkEmpty - 결과 데이터의 빈 상태 체크 여부
   * @returns {Promise} 비동기 함수의 결과
   */
  async function executeWithLoading(asyncFn, options = {}) {
    const {
      successMessage = '',
      showSuccess = false,
      checkEmpty = false
    } = options

    try {
      startLoading(true)
      const result = await asyncFn()
      
      if (checkEmpty) {
        checkAndSetEmpty(result)
      } else {
        stopLoading()
      }
      
      if (showSuccess) {
        setSuccess(successMessage, false)
      }
      
      return result
    } catch (err) {
      setError(err)
      throw err
    }
  }

  // 계산된 속성들
  const hasError = computed(() => error.value !== null)
  const hasSuccess = computed(() => success.value === true)
  const isLoading = computed(() => loading.value || pending.value)
  const isIdle = computed(() => !loading.value && !pending.value && !hasError.value && !hasSuccess.value)

  // 에러/성공 상태 변화 감지
  watch([hasError, hasSuccess], () => {
    if (autoReset && (hasError.value || hasSuccess.value)) {
      scheduleAutoReset()
    }
  })

  return {
    // 기본 상태
    loading,
    pending,
    error,
    success,
    isEmpty,
    
    // 메시지
    errorMessage,
    successMessage,
    
    // 계산된 속성
    hasError,
    hasSuccess,
    isLoading,
    isIdle,
    
    // 상태 관리 함수
    startLoading,
    stopLoading,
    setSuccess,
    setError,
    setEmpty,
    clearStates,
    reset,
    checkAndSetEmpty,
    executeWithLoading
  }
} 