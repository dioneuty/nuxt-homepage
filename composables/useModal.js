import { ref } from 'vue'

const isModalOpen = ref(false)
const modalTitle = ref('')
const modalContent = ref('')
const isConfirm = ref(false)
const modalCallback = ref(null)

/**
 * @description 모달 컴포넌트를 사용하기 위한 컴포넌트
 * @returns {Object} 모달 컴포넌트를 사용하기 위한 컴포넌트
 */
export function useModal() {
  /**
   * 모달 열기
   * @param {string} title - 모달 제목
   * @param {string} content - 모달 내용
   * @param {function} callback - 모달 확인 시 실행할 함수
   * @param {boolean} confirm - 모달 확인 시 실행할 함수
   */
  function openModal(title, content, callback, confirm = false) {
    modalTitle.value = title
    modalContent.value = content
    modalCallback.value = callback
    isConfirm.value = confirm
    isModalOpen.value = true
  }

  // 모달 닫기
  function closeModal() {
    isModalOpen.value = false
    resetModal()
  }

  // 모달 확인
  function confirmModal() {
    if (modalCallback.value) {
      modalCallback.value(true)
    }
    closeModal()
  }

  // 모달 취소
  function cancelModal() {
    if (modalCallback.value && isConfirm.value) {
      modalCallback.value(false)
    }
    closeModal()
  }

  // 모달 초기화
  function resetModal() {
    modalTitle.value = ''
    modalContent.value = ''
    modalCallback.value = null
    isConfirm.value = false
  }

  return {
    isModalOpen,
    modalTitle,
    modalContent,
    isConfirm,
    openModal,
    closeModal,
    confirmModal,
    cancelModal
  }
}