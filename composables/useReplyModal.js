import { ref } from 'vue'

const isReplyModalOpen = ref(false)
const replyModalTitle = ref('')
const replyCallback = ref(null)

export function useReplyModal() {
  function openReplyModal(title, callback) {
    replyModalTitle.value = title
    replyCallback.value = callback
    isReplyModalOpen.value = true
  }

  function closeReplyModal() {
    isReplyModalOpen.value = false
    resetReplyModal()
  }

  function confirmReplyModal(data) {
    if (replyCallback.value) {
      replyCallback.value(data)
    }
    closeReplyModal()
  }

  function cancelReplyModal() {
    closeReplyModal()
  }

  function resetReplyModal() {
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