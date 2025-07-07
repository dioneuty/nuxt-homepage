import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useModal } from '~/composables/useModal'

/**
 * 폼 제출(생성 또는 수정) 로직을 처리하는 범용 컴포저블입니다.
 * 기존 매개변수 방식과 새로운 설정 객체 방식을 모두 지원합니다.
 * 
 * @param {object|object} formDataOrConfig - 폼 데이터 ref 또는 설정 객체
 * @param {string} apiEndpoint - API 엔드포인트 URL (설정 객체 사용 시 무시됨)
 * @param {string} successRedirectPath - 성공 시 리다이렉트할 경로 (설정 객체 사용 시 무시됨)
 * @param {boolean} isEditing - 수정 모드인지 여부 ref (설정 객체 사용 시 무시됨)
 * @param {string} itemId - 현재 항목의 ID (설정 객체 사용 시 무시됨)
 * @param {Array<object>} fields - 유효성 검사에 필요한 필드 정의 (설정 객체 사용 시 무시됨)
 * @param {string} successMessageCreate - 생성 성공 시 표시할 메시지 (설정 객체 사용 시 무시됨)
 * @param {string} successMessageUpdate - 수정 성공 시 표시할 메시지 (설정 객체 사용 시 무시됨)
 * @param {string} errorMessageCreate - 생성 실패 시 표시할 메시지 (설정 객체 사용 시 무시됨)
 * @param {string} errorMessageUpdate - 수정 실패 시 표시할 메시지 (설정 객체 사용 시 무시됨)
 * 
 * 설정 객체 형식:
 * @param {object} config.formData - 제출할 폼 데이터 ref
 * @param {string} config.apiEndpoint - API 엔드포인트 URL
 * @param {string} config.successRedirectPath - 성공 시 리다이렉트할 경로
 * @param {boolean} config.isEditing - 수정 모드인지 여부 ref
 * @param {string} config.itemId - 현재 항목의 ID (수정 모드일 경우)
 * @param {Array<object>} config.fields - 유효성 검사에 필요한 필드 정의
 * @param {string} config.successMessageCreate - 생성 성공 시 표시할 메시지
 * @param {string} config.successMessageUpdate - 수정 성공 시 표시할 메시지
 * @param {string} config.errorMessageCreate - 생성 실패 시 표시할 메시지
 * @param {string} config.errorMessageUpdate - 수정 실패 시 표시할 메시지
 * @param {function} config.customValidation - 사용자 정의 유효성 검사 함수
 * @param {function} config.onSuccess - 성공 시 호출할 콜백 함수
 * @param {function} config.onError - 오류 시 호출할 콜백 함수
 * @param {string} config.contentType - 콘텐츠 타입 (예: '블로그 글', '게시물' 등)
 */
export function useFormSubmit(
  formDataOrConfig,
  apiEndpoint,
  successRedirectPath,
  isEditing,
  itemId,
  fields,
  successMessageCreate = '성공적으로 작성되었습니다.',
  successMessageUpdate = '성공적으로 수정되었습니다.',
  errorMessageCreate = '작성에 실패했습니다.',
  errorMessageUpdate = '수정에 실패했습니다.'
) {
  const router = useRouter()
  const { openModal } = useModal()

  // 설정 객체 방식인지 확인 (첫 번째 매개변수가 객체이고 formData 속성을 가지는 경우)
  const isConfigObject = formDataOrConfig && typeof formDataOrConfig === 'object' && 'formData' in formDataOrConfig

  // 설정 값들을 추출 (기존 매개변수 방식과 새로운 설정 객체 방식 모두 지원)
  const config = isConfigObject ? formDataOrConfig : {
    formData: formDataOrConfig,
    apiEndpoint,
    successRedirectPath,
    isEditing,
    itemId,
    fields,
    successMessageCreate,
    successMessageUpdate,
    errorMessageCreate,
    errorMessageUpdate
  }

  const {
    formData,
    apiEndpoint: endpoint,
    successRedirectPath: redirectPath,
    isEditing: editing,
    itemId: id,
    fields: formFields,
    successMessageCreate: createSuccessMsg = '성공적으로 작성되었습니다.',
    successMessageUpdate: updateSuccessMsg = '성공적으로 수정되었습니다.',
    errorMessageCreate: createErrorMsg = '작성에 실패했습니다.',
    errorMessageUpdate: updateErrorMsg = '수정에 실패했습니다.',
    customValidation,
    onSuccess,
    onError,
    contentType = '항목'
  } = config

  /**
   * 필수 필드의 유효성을 검사합니다.
   * @param {object} data - 검사할 데이터.
   * @param {Array} fields - 필드 정의 배열.
   * @returns {boolean} 모든 필수 필드가 채워졌으면 true, 아니면 false.
   */
  function validateRequiredFields(data, fields) {
    if (!fields || !Array.isArray(fields)) return true
    
    const requiredNames = fields.filter(field => field.required).map(field => field.name)
    const missingFields = requiredNames.filter(name => !data[name])

    if (missingFields.length > 0) {
      openModal('경고', `다음 필드를 입력해주세요: ${missingFields.join(', ')}`)
      return false
    }
    return true
  }

  /**
   * 폼을 제출(생성 또는 수정)하는 함수입니다.
   */
  async function submitForm() {
    // 사용자 정의 유효성 검사
    if (customValidation && !customValidation(formData.value)) {
      return
    }

    // 필수 필드 유효성 검사
    if (!validateRequiredFields(formData.value, formFields)) {
      return
    }

    const url = editing.value ? `${endpoint}?id=${id.value}` : endpoint
    const method = editing.value ? 'PUT' : 'POST'

    try {
      await $fetch(url, {
        method,
        body: formData.value
      })

      // 성공 시 사용자 정의 콜백 호출 또는 기본 처리
      if (onSuccess) {
        onSuccess()
      } else {
        const successMessage = editing.value ? updateSuccessMsg : createSuccessMsg
        // contentType이 제공된 경우 메시지 커스터마이징
        const customSuccessMessage = contentType !== '항목' 
          ? `${contentType}이 성공적으로 ${editing.value ? '수정' : '작성'}되었습니다.`
          : successMessage

        openModal('성공', customSuccessMessage, () => {
          router.push(editing.value ? `${redirectPath}/view?id=${id.value}` : redirectPath)
        })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      
      // 오류 시 사용자 정의 콜백 호출 또는 기본 처리
      if (onError) {
        onError(error)
      } else {
        const errorMessage = editing.value ? updateErrorMsg : createErrorMsg
        // contentType이 제공된 경우 메시지 커스터마이징
        const customErrorMessage = contentType !== '항목'
          ? `${contentType} ${editing.value ? '수정' : '작성'}에 실패했습니다.`
          : errorMessage

        openModal('오류', customErrorMessage)
      }
    }
  }

  return { submitForm, validateRequiredFields }
}

/**
 * 블로그 게시글 제출을 위한 헬퍼 함수입니다.
 * useBlogSubmit.js와 동일한 인터페이스를 제공하여 하위 호환성을 보장합니다.
 * @param {object} post - 제출할 게시글 데이터 ref
 * @param {string} apiEndpoint - API 엔드포인트 URL
 * @param {string} listPath - 목록 페이지 경로
 * @param {boolean} isEditing - 수정 모드인지 여부 ref
 * @param {string} postId - 현재 게시글의 ID (수정 모드일 경우)
 * @param {Array<object>} fields - 유효성 검사에 필요한 필드 정의
 * @returns {object} submitPost 함수를 포함한 객체
 */
export function useBlogSubmit(post, apiEndpoint, listPath, isEditing, postId, fields) {
  const { submitForm } = useFormSubmit({
    formData: post,
    apiEndpoint,
    successRedirectPath: listPath,
    isEditing,
    itemId: postId,
    fields,
    contentType: '블로그 글'
  })

  return { 
    submitPost: submitForm 
  }
} 