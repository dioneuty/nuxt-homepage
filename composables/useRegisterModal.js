import { ref } from 'vue'

const isRegisterModalOpen = ref(false)

export function useRegisterModal() {
  function openModal() {
    isRegisterModalOpen.value = true
  }

  function closeModal() {
    isRegisterModalOpen.value = false
  }

  return {
    isOpen: isRegisterModalOpen,
    openModal,
    closeModal
  }
}