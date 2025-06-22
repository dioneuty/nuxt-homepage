import { ref } from 'vue'

const isReplyModalOpen = ref(false)
const replyModalTitle = ref('')
const replyCallback = ref(null)

/**
 * 답글 모달의 상태와 동작을 관리하는 컴포저블 함수입니다.
 * 답글 작성 또는 수정 시 사용되는 모달의 열림/닫힘, 제목, 콜백 함수 등을 제어합니다.
 * @returns {Object} 답글 모달 관련 속성 및 함수
 * @property {Ref<boolean>} isReplyModalOpen - 답글 모달의 열림/닫힘 상태
 * @property {Ref<string>} replyModalTitle - 현재 답글 모달의 제목
 * @property {function(string, function): void} openReplyModal - 답글 모달을 열고 제목 및 콜백 함수를 설정하는 함수
 * @property {function(): void} closeReplyModal - 답글 모달을 닫고 상태를 초기화하는 함수
 * @property {function(any): void} confirmReplyModal - 답글 모달에서 '확인' 버튼을 클릭했을 때 호출되며, 데이터를 콜백 함수에 전달하는 함수
 * @property {function(): void} cancelReplyModal - 답글 모달에서 '취소' 버튼을 클릭했을 때 호출되며, 모달을 닫는 함수
 */
export function useReplyModal() {
  /**
   * 답글 모달을 엽니다.
   * @param {string} title - 모달 제목
   * @param {function} callback - 답글 작성/수정 완료 시 호출될 콜백 함수
   */
  function openReplyModal(title, callback) {
    replyModalTitle.value = title
    replyCallback.value = callback
    isReplyModalOpen.value = true
  }

  /**
   * 답글 모달을 닫고 상태를 초기화합니다.
   */
  function closeReplyModal() {
    isReplyModalOpen.value = false
    resetReplyModal()
  }

  /**
   * 답글 모달에서 '확인' 버튼을 클릭했을 때 호출됩니다.
   * 콜백 함수가 있으면 입력된 데이터를 인자로 호출합니다.
   * @param {any} data - 답글 모달을 통해 전달할 데이터
   */
  function confirmReplyModal(data) {
    if (replyCallback.value) {
      replyCallback.value(data)
    }
    closeReplyModal()
  }

  /**
   * 답글 모달에서 '취소' 버튼을 클릭했을 때 호출됩니다.
   * 모달을 닫습니다.
   */
  function cancelReplyModal() {
    closeReplyModal()
  }

  /**
   * 답글 모달의 모든 상태를 초기화합니다.
   */
  function resetReplyModal() {
    replyModalTitle.value = ''
    replyCallback.value = null
  }

  return {
    // 1. 답글 모달 관련 상태
    isReplyModalOpen, // 답글 모달의 열림/닫힘 상태
    replyModalTitle, // 현재 답글 모달의 제목

    // 2. 답글 모달 관련 함수
    openReplyModal, // 답글 모달을 열고 제목 및 콜백 함수를 설정하는 함수
    closeReplyModal, // 답글 모달을 닫고 상태를 초기화하는 함수
    confirmReplyModal, // 답글 모달에서 '확인' 버튼을 클릭했을 때 호출되며, 데이터를 콜백 함수에 전달하는 함수
    cancelReplyModal, // 답글 모달에서 '취소' 버튼을 클릭했을 때 호출되며, 모달을 닫는 함수
  }
}