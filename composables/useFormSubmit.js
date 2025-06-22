import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useModal } from '~/composables/useModal'

/**
 * 폼 제출(생성 또는 수정) 로직을 처리하는 범용 컴포저블입니다.
 * @param {object} formData - 제출할 폼 데이터 ref.
 * @param {string} apiEndpoint - API 엔드포인트 URL.
 * @param {string} successRedirectPath - 성공 시 리다이렉트할 경로.
 * @param {boolean} isEditing - 수정 모드인지 여부 ref.
 * @param {string} itemId - 현재 항목의 ID (수정 모드일 경우).
 * @param {Array<object>} fields - 유효성 검사에 필요한 필드 정의 (name, required 속성 포함).
 * @param {string} successMessageCreate - 생성 성공 시 표시할 메시지.
 * @param {string} successMessageUpdate - 수정 성공 시 표시할 메시지.
 * @param {string} errorMessageCreate - 생성 실패 시 표시할 메시지.
 * @param {string} errorMessageUpdate - 수정 실패 시 표시할 메시지.
 */
export function useFormSubmit(
  formData,
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

  /**
   * 필수 필드의 유효성을 검사합니다.
   * @param {object} data - 검사할 데이터.
   * @param {Array} formFields - 필드 정의 배열.
   * @returns {boolean} 모든 필수 필드가 채워졌으면 true, 아니면 false.
   */
  function validateRequiredFields(data, formFields) {
    const requiredNames = formFields.filter(field => field.required).map(field => field.name)
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
    if (!validateRequiredFields(formData.value, fields)) {
      return
    }

    const url = isEditing.value ? `${apiEndpoint}?id=${itemId.value}` : apiEndpoint
    const method = isEditing.value ? 'PUT' : 'POST'

    try {
      await $fetch(url, {
        method,
        body: formData.value
      })

      const successMessage = isEditing.value ? successMessageUpdate : successMessageCreate
      openModal('성공', successMessage, () => {
        router.push(isEditing.value ? `${successRedirectPath}/view?id=${itemId.value}` : successRedirectPath)
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      const errorMessage = isEditing.value ? errorMessageUpdate : errorMessageCreate
      openModal('오류', errorMessage)
    }
  }

  return { submitForm, validateRequiredFields }
} 