import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useModal } from '~/composables/useModal'

/**
 * 간소화된 폼 제출 컴포저블
 * @param {object} config - 설정 객체
 */
export function useFormSubmit(config) {
  const router = useRouter()
  const { openModal } = useModal()

  const {
    formData,
    apiEndpoint,
    successRedirectPath,
    isEditing,
    itemId,
    fields = [],
    onSuccess,
    onError
  } = config

  const submitForm = async () => {
    // 필수 필드 검증
    const missing = fields.filter(f => f.required && !formData.value[f.name]).map(f => f.name)
    if (missing.length) {
      openModal('경고', `다음 필드를 입력해주세요: ${missing.join(', ')}`)
      return
    }

    const url = isEditing.value ? `${apiEndpoint}?id=${itemId.value}` : apiEndpoint

    try {
      await $fetch(url, { 
        method: isEditing.value ? 'PUT' : 'POST', 
        body: formData.value 
      })
      
      const action = isEditing.value ? '수정' : '작성'
      
      onSuccess?.() || openModal('성공', `성공적으로 ${action}되었습니다.`, () => {
        router.push(isEditing.value ? `${successRedirectPath}/view?id=${itemId.value}` : successRedirectPath)
      })
    } catch (error) {
      onError?.(error) || openModal('오류', `${isEditing.value ? '수정' : '작성'}에 실패했습니다.`)
    }
  }

  return { submitForm }
}

// 블로그 제출을 위한 간소화된 헬퍼 (하위 호환성 유지)
export function useBlogSubmit(formData, apiEndpoint, successRedirectPath, isEditing, itemId, fields) {
  const { submitForm } = useFormSubmit({
    formData,
    apiEndpoint,
    successRedirectPath,
    isEditing,
    itemId,
    fields
  })

  return { submitPost: submitForm }
} 