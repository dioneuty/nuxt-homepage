import { ref } from 'vue'

const isRegisterModalOpen = ref(false)

/**
 * 회원가입 모달의 상태를 관리하는 컴포저블 함수입니다.
 * 모달의 열림/닫힘 상태를 제공하고, 모달을 열거나 닫는 함수를 제공합니다.
 * @returns {Object} 회원가입 모달 관련 속성 및 함수
 * @property {Ref<boolean>} isOpen - 회원가입 모달의 열림/닫힘 상태
 * @property {function(): void} openModal - 회원가입 모달을 여는 함수
 * @property {function(): void} closeModal - 회원가입 모달을 닫는 함수
 */
export function useRegisterModal() {
  /**
   * 회원가입 모달을 엽니다.
   */
  function openModal() {
    isRegisterModalOpen.value = true;
  }

  /**
   * 회원가입 모달을 닫습니다.
   */
  function closeModal() {
    isRegisterModalOpen.value = false;
  }

  return {
    isOpen: isRegisterModalOpen,
    openModal,
    closeModal
  }
}