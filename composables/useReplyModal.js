import { ref } from 'vue'

const isReplyModalOpen = ref(false)
const replyModalTitle = ref('')
const replyCallback = ref(null)

export const useReplyModal = () => {
  const openReplyModal = (title, callback) => {
    replyModalTitle.value = title
    replyCallback.value = callback
    isReplyModalOpen.value = true
  }

  const closeReplyModal = () => {
    isReplyModalOpen.value = false
    resetReplyModal()
  }

  const confirmReplyModal = (content) => {
    if (replyCallback.value) {
      replyCallback.value(content)
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
    cancelReplyModal
  }
}