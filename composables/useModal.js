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
export const useModal = () => {
  // 모달 열기
  const openModal = (title, content, callback, confirm = false) => {
    modalTitle.value = title
    modalContent.value = content
    modalCallback.value = callback
    isConfirm.value = confirm
    isModalOpen.value = true
  }

  // 모달 닫기
  const closeModal = () => {
    isModalOpen.value = false
    resetModal()
  }

  const confirmModal = () => {
    if (modalCallback.value) {
      modalCallback.value(true)
    }
    closeModal()
  }

  const cancelModal = () => {
    if (modalCallback.value && isConfirm.value) {
      modalCallback.value(false)
    }
    closeModal()
  }

  const resetModal = () => {
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