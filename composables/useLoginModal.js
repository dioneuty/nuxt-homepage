import { ref } from 'vue'

const isLoginModalOpen = ref(false)

export function useLoginModal() {
  const openModal = () => {
    isLoginModalOpen.value = true
  }

  const closeModal = () => {
    isLoginModalOpen.value = false
  }

  return {
    isOpen: isLoginModalOpen,
    openModal,
    closeModal
  }
}