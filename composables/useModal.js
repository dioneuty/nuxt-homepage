import { ref } from 'vue'

const isModalOpen = ref(false) // 모달의 열림/닫힘 상태
const modalTitle = ref('') // 현재 모달의 제목
const modalContent = ref('') // 현재 모달의 내용
const isConfirm = ref(false) // 현재 모달이 확인 모달인지 여부
const modalCallback = ref(null) // 모달 확인 시 실행할 함수 (선택 사항)

/**
 * 모달 컴포넌트의 상태와 동작을 관리하는 컴포저블 함수입니다.
 * 일반 알림 모달 또는 확인/취소 기능이 있는 모달을 제어할 수 있습니다.
 * @returns {Object} 모달 관련 속성 및 함수
 * @property {Ref<boolean>} isModalOpen - 모달의 열림/닫힘 상태
 * @property {Ref<string>} modalTitle - 현재 모달의 제목
 * @property {Ref<string>} modalContent - 현재 모달의 내용
 * @property {Ref<boolean>} isConfirm - 현재 모달이 확인 모달인지 여부
 * @property {function(string, string, function|null, boolean): void} openModal - 모달을 여는 함수
 * @property {function(): void} closeModal - 모달을 닫는 함수
 * @property {function(): void} confirmModal - 확인 모달에서 '확인' 버튼을 클릭했을 때 호출되는 함수
 * @property {function(): void} cancelModal - 확인 모달에서 '취소' 버튼을 클릭했을 때 호출되는 함수
 */
export function useModal() {
  /**
   * 모달을 엽니다.
   * @param {string} title - 모달 제목
   * @param {string} content - 모달 내용
   * @param {function|null} callback - 모달 확인 시 실행할 함수 (선택 사항)
   * @param {boolean} [confirm=false] - 확인/취소 버튼을 표시할지 여부 (기본값: false)
   */
  function openModal(title, content, callback, confirm = false) {
    modalTitle.value = title
    modalContent.value = content
    modalCallback.value = callback
    isConfirm.value = confirm
    isModalOpen.value = true
  }

  /**
   * 모달을 닫고 상태를 초기화합니다.
   */
  function closeModal() {
    isModalOpen.value = false
    resetModal()
  }

  /**
   * 확인 모달에서 '확인' 버튼을 클릭했을 때 호출됩니다.
   * 콜백 함수가 있으면 true를 인자로 호출합니다.
   */
  function confirmModal() {
    if (modalCallback.value) {
      modalCallback.value(true)
    }
    closeModal()
  }

  /**
   * 확인 모달에서 '취소' 버튼을 클릭했을 때 호출됩니다.
   * 확인 모달인 경우에만 콜백 함수가 있으면 false를 인자로 호출합니다.
   */
  function cancelModal() {
    if (modalCallback.value && isConfirm.value) {
      modalCallback.value(false)
    }
    closeModal()
  }

  /**
   * 모달의 모든 상태를 초기화합니다.
   */
  function resetModal() {
    modalTitle.value = ''
    modalContent.value = ''
    modalCallback.value = null
    isConfirm.value = false
  }

  return {
    // 1. 모달 관련 상태
    isModalOpen, // 모달의 열림/닫힘 상태
    modalTitle, // 현재 모달의 제목
    modalContent, // 현재 모달의 내용
    isConfirm, // 현재 모달이 확인 모달인지 여부

    // 2. 모달 관련 함수
    openModal, // 모달을 여는 함수
    closeModal, // 모달을 닫는 함수
    confirmModal, // 확인 모달에서 '확인' 버튼을 클릭했을 때 호출되는 함수
    cancelModal, // 확인 모달에서 '취소' 버튼을 클릭했을 때 호출되는 함수
  }
}