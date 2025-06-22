import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useModal } from '~/composables/useModal'

/**
 * 블로그 게시글 제출(생성 또는 수정) 로직을 처리하는 컴포저블입니다.
 * @param {object} post - 제출할 게시글 데이터 ref.
 * @param {string} apiEndpoint - API 엔드포인트 URL.
 * @param {string} listPath - 목록 페이지 경로.
 * @param {boolean} isEditing - 수정 모드인지 여부 ref.
 * @param {string} postId - 현재 게시글의 ID (수정 모드일 경우).
 * @param {Array<object>} fields - 유효성 검사에 필요한 필드 정의.
 */
export function useBlogSubmit(post, apiEndpoint, listPath, isEditing, postId, fields) {
  const router = useRouter()
  const { openModal } = useModal()

  /**
   * 블로그 게시글을 제출(생성 또는 수정)하는 함수입니다.
   * 필수 필드가 비어있는지 확인하고, 유효성 검사 실패 시 경고 모달을 표시합니다.
   * API를 호출하여 게시글을 저장하고,
   * 성공 시 성공 모달을 띄우고 게시글 상세 또는 목록 페이지로 이동하며,
   * 실패 시 오류 모달을 띄웁니다.
   */
  async function submitPost() {
    const requiredFields = fields.filter(field => field.required).map(field => field.name)
    const missingFields = requiredFields.filter(field => !post.value[field])

    if (missingFields.length > 0) {
      openModal('경고', `다음 필드를 입력해주세요: ${missingFields.join(', ')}`)
      return
    }

    const url = isEditing.value ? `${apiEndpoint}?id=${postId.value}` : apiEndpoint
    const method = isEditing.value ? 'PUT' : 'POST'

    try {
      await $fetch(url, {
        method,
        body: post.value
      })

      openModal('성공', `블로그 글이 성공적으로 ${isEditing.value ? '수정' : '작성'}되었습니다.`, () => {
        router.push(isEditing.value ? `${listPath}/view?id=${postId.value}` : listPath)
      })
    } catch (error) {
      console.error('Error submitting post:', error)
      openModal('오류', `블로그 글 ${isEditing.value ? '수정' : '작성'}에 실패했습니다.`)
    }
  }

  return { submitPost }
} 