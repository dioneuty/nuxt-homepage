<template>
    <Teleport to="body">
      <div v-if="isReplyModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
          <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">{{ replyModalTitle }}</h2>
          <input
            v-model="replyAuthor"
            type="text"
            class="w-full p-2 mb-4 border rounded-md dark:bg-gray-700 dark:text-white"
            placeholder="작성자"
          />
          <textarea
            v-model="replyContent"
            class="w-full h-32 p-2 mb-4 border rounded-md resize-none dark:bg-gray-700 dark:text-white"
            placeholder="답변을 입력하세요"
          ></textarea>
          <div class="flex justify-end space-x-2">
            <button @click="cancelReply" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              취소
            </button>
            <button @click="confirmReply" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              확인
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useReplyModal } from '~/composables/useReplyModal'
  
  const { isReplyModalOpen, replyModalTitle, closeReplyModal, confirmReplyModal, cancelReplyModal } = useReplyModal()
  const replyContent = ref('')
  const replyAuthor = ref('')
  
  /**
   * 답변 확인 버튼 클릭 시 호출되는 함수입니다.
   * `confirmReplyModal` 함수를 호출하여 답변 내용과 작성자를 전달하고 모달을 닫습니다.
   * 입력 필드를 초기화합니다.
   */
  function confirmReply() {
    confirmReplyModal({ author: replyAuthor.value, content: replyContent.value })
    replyContent.value = ''
    replyAuthor.value = ''
  }
  
  /**
   * 답변 취소 버튼 클릭 시 호출되는 함수입니다.
   * `cancelReplyModal` 함수를 호출하여 모달을 닫고,
   * 입력 필드를 초기화합니다.
   */
  function cancelReply() {
    cancelReplyModal()
    replyContent.value = ''
    replyAuthor.value = ''
  }
  </script>