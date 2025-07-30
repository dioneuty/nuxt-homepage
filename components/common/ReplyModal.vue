<template>
    <Teleport to="body">
      <div v-if="isReplyModalOpen" class="modal-overlay">
        <div class="modal-container w-full max-w-lg">
          <h2 class="subsection-title mb-4">{{ replyModalTitle }}</h2>
          <input
            v-model="replyAuthor"
            type="text"
            class="input mb-4"
            placeholder="작성자"
          />
          <textarea
            v-model="replyContent"
            class="textarea h-32 mb-4"
            placeholder="답변을 입력하세요"
          ></textarea>
          <div class="modal-footer">
            <button @click="cancelReply" class="btn btn-danger">
              취소
            </button>
            <button @click="confirmReply" class="btn btn-primary">
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