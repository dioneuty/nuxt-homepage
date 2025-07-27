/**
 * API 호출을 위한 공통 유틸리티 함수
 * 반복되는 패턴(로딩, 에러처리, 토스트)을 단순화
 */

import { useToast } from '@/composables/useToast'

/**
 * 표준화된 API 호출 래퍼 함수
 * @param {Object} options - 설정 옵션
 * @param {Function} options.apiCall - 실행할 API 호출 함수
 * @param {Object} options.loadingState - 로딩 상태 객체 (reactive)
 * @param {string} options.loadingKey - 로딩 상태 키 (예: 'adding', 'saving')
 * @param {string} options.successMessage - 성공 시 토스트 메시지
 * @param {string} options.errorMessage - 에러 시 토스트 메시지 (기본값 사용 시 null)
 * @param {Function} options.onSuccess - 성공 시 콜백 함수
 * @param {Function} options.onError - 에러 시 콜백 함수
 * @param {Function} options.beforeCall - API 호출 전 실행할 함수
 * @param {Function} options.afterCall - API 호출 후 항상 실행할 함수
 * @returns {Promise<any>} API 응답 또는 에러
 */
export const useApiCall = async (options) => {
  const { showToast } = useToast()
  
  const {
    apiCall,
    loadingState = null,
    loadingKey = null,
    successMessage = null,
    errorMessage = null,
    onSuccess = null,
    onError = null,
    beforeCall = null,
    afterCall = null
  } = options

  try {
    // 로딩 상태 설정
    if (loadingState && loadingKey) {
      loadingState[loadingKey] = true
    }

    // API 호출 전 실행
    if (beforeCall) {
      await beforeCall()
    }

    // API 호출
    const result = await apiCall()

    // 성공 시 토스트 메시지
    if (successMessage) {
      showToast(successMessage, 'success')
    }

    // 성공 콜백 실행
    if (onSuccess) {
      await onSuccess(result)
    }

    return result

  } catch (error) {
    console.error('API 호출 실패:', error)
    
    // 에러 시 토스트 메시지
    const finalErrorMessage = errorMessage || `작업에 실패했습니다: ${error.message || '알 수 없는 오류'}`
    showToast(finalErrorMessage, 'error')

    // 에러 콜백 실행
    if (onError) {
      await onError(error)
    }

    throw error

  } finally {
    // 로딩 상태 해제
    if (loadingState && loadingKey) {
      loadingState[loadingKey] = false
    }

    // 항상 실행할 콜백
    if (afterCall) {
      await afterCall()
    }
  }
}

/**
 * 간단한 CRUD 작업을 위한 헬퍼 함수들
 */

/**
 * 생성 작업을 위한 헬퍼
 */
export const useApiCreate = (options) => {
  return useApiCall({
    successMessage: '성공적으로 생성되었습니다.',
    ...options
  })
}

/**
 * 업데이트 작업을 위한 헬퍼
 */
export const useApiUpdate = (options) => {
  return useApiCall({
    successMessage: '성공적으로 수정되었습니다.',
    ...options
  })
}

/**
 * 삭제 작업을 위한 헬퍼
 */
export const useApiDelete = (options) => {
  return useApiCall({
    successMessage: '성공적으로 삭제되었습니다.',
    ...options
  })
}