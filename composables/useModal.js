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
  // 모달 열기
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

  function confirmModal() {
    if (modalCallback.value) {
      modalCallback.value(true)
    }
    closeModal()
  }

  function cancelModal() {
    if (modalCallback.value && isConfirm.value) {
      modalCallback.value(false)
    }
    closeModal()
  }

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