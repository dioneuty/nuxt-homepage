import { ref } from 'vue'

const isLoginModalOpen = ref(false)

export function useLoginModal() {
  function openModal() {
    isLoginModalOpen.value = true
  }

  function closeModal() {
    isLoginModalOpen.value = false
  }

  return {
    isOpen: isLoginModalOpen,
    openModal,
    closeModal
  }
}