import { ref } from 'vue'

const isLoginModalOpen = ref(false)

/**
 * 로그인 모달의 상태를 관리하는 컴포저블 함수입니다.
 * 모달의 열림/닫힘 상태를 제공하고, 모달을 열거나 닫는 함수를 제공합니다.
 * @returns {Object} 로그인 모달 관련 속성 및 함수
 * @property {Ref<boolean>} isOpen - 로그인 모달의 열림/닫힘 상태
 * @property {function(): void} openModal - 로그인 모달을 여는 함수
 * @property {function(): void} closeModal - 로그인 모달을 닫는 함수
 */
export function useLoginModal() {
  /**
   * 로그인 모달을 엽니다.
   */
  function openModal() {
    isLoginModalOpen.value = true;
  }

  /**
   * 로그인 모달을 닫습니다.
   */
  function closeModal() {
    isLoginModalOpen.value = false;
  }

  return {
    isOpen: isLoginModalOpen,
    
    openModal,
    closeModal
  }
}