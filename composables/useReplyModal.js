import { ref } from 'vue'

const isReplyModalOpen = ref(false)
const replyModalTitle = ref('')
const replyCallback = ref(null)

// 답글 모달 상태와 동작 관리 컴포저블
export function useReplyModal() {
  const openReplyModal = (title, callback) => {
    replyModalTitle.value = title
    replyCallback.value = callback
    isReplyModalOpen.value = true
  }

  const closeReplyModal = () => {
    isReplyModalOpen.value = false
    resetReplyModal()
  }

  const confirmReplyModal = (data) => {
    if (replyCallback.value) {
      replyCallback.value(data)
    }
    closeReplyModal()
  }

  const cancelReplyModal = () => {
    closeReplyModal()
  }

  const resetReplyModal = () => {
    replyModalTitle.value = ''
    replyCallback.value = null
  }

  return {
    isReplyModalOpen,
    replyModalTitle,
    openReplyModal,
    closeReplyModal,
    confirmReplyModal,
    cancelReplyModal,
  }
}