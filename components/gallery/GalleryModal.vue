<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <!-- 이전 버튼 -->
      <button v-if="!isFirstItem" @click="$emit('previous')" class="gallery-nav-btn-left">
        <Icon icon="mdi:chevron-left" class="gallery-nav-icon" />
      </button>
      
      <!-- 다음 버튼 -->
      <button v-if="!isLastItem" @click="$emit('next')" class="gallery-nav-btn-right">
        <Icon icon="mdi:chevron-right" class="gallery-nav-icon" />
      </button>

      <!-- 고정 헤더 -->
      <div class="gallery-modal-header-wrapper">
        <div class="flex justify-between items-center mb-4">
          <h2 class="gallery-modal-title">{{ item.title }}</h2>
          <button @click="$emit('close')" class="modal-close-btn">
            <Icon icon="mdi:close" class="gallery-modal-close" />
          </button>
        </div>
      </div>
      
      <!-- 스크롤 가능 콘텐츠 영역 -->
      <div class="gallery-modal-scrollable">
        <SafeHtml 
          :content="item.content" 
          type="gallery" 
          container-class="w-full mb-4 rounded-lg overflow-hidden"
        />
        <p class="gallery-modal-description">{{ item.description }}</p>
        <div class="flex flex-wrap gap-2 mb-4">
          <span v-for="tag in item.tags" :key="tag" class="badge-gray">
            <Icon icon="mdi:tag" class="icon-small mr-1" />
            {{ tag }}
          </span>
        </div>
        <div class="gallery-modal-actions">
          <div class="gallery-modal-actions-left">
            <button @click="editGalleryItem" class="btn-primary btn-icon mr-2">
              <Icon icon="mdi:pencil" class="icon-small mr-2" />
              수정
            </button>
            <button v-if="!isAdminGallery" @click="shareLink" class="btn-success btn-icon">
              <Icon icon="mdi:share-variant" class="icon-small mr-2" />
              공유
            </button>
          </div>
          <button @click="deleteGalleryItem" class="btn-danger btn-icon">
            <Icon icon="mdi:delete" class="icon-small mr-2" />
            삭제
          </button>
        </div>
        <div v-if="showComments" class="gallery-comment-section">
          <h3 class="gallery-comment-title">댓글</h3>
          
          <div v-for="comment in comments" :key="comment.id" class="gallery-comment-item">
            <div v-if="editingComment && editingComment.id === comment.id">
              <input v-model="editingComment.title" placeholder="제목" class="input mb-2">
              <input v-model="editingComment.author" placeholder="글쓴이" class="input mb-2">
              <textarea v-model="editingComment.content" placeholder="내용" class="textarea mb-2"></textarea>
              <div class="flex justify-end">
                <button @click="cancelEditComment" class="btn-secondary mr-2">
                  취소
                </button>
                <button @click="updateComment" class="btn-primary">
                  수정 완료
                </button>
              </div>
            </div>
            <div v-else>
              <p class="gallery-comment-content">{{ comment.title }} - {{ comment.content }}</p>
              <div class="gallery-comment-meta">
                <span>{{ comment.author?.name }} - {{ formatDate(comment.createdAt) }}</span>
                <div class="gallery-comment-actions">
                  <button @click="editComment(comment)" class="gallery-comment-edit-btn">
                    <Icon icon="mdi:pencil" />
                  </button>
                  <button @click="deleteComment(comment.id)" class="gallery-comment-delete-btn">
                    <Icon icon="mdi:delete" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <form @submit.prevent="addComment" class="gallery-comment-form">
            <div class="mb-2">
              <input v-model="newCommentTitle" placeholder="제목" class="input">
            </div>
            <div class="mb-2">
              <input v-model="newCommentAuthor" placeholder="글쓴이" class="input">
            </div>
            <div class="mb-2">
              <textarea v-model="newCommentContent" placeholder="내용" class="textarea"></textarea>
            </div>
            <button type="submit" class="btn-success btn-icon mt-2">
              <Icon icon="mdi:send" class="icon-small mr-2" />
              댓글 작성
            </button>
          </form>
        </div>
      </div>
      
      <!-- 확인 모달 -->
      <div v-if="showConfirmModal" class="modal-overlay" style="z-index: 60;">
          <div class="card-padded max-w-md w-full">
            <h3 class="text-xl font-bold mb-4 dark:text-white">삭제 확인</h3>
            <p class="mb-6 dark:text-gray-300">정말로 이 갤러리 항목을 삭제하시겠습니까?</p>
            <div class="flex justify-end">
              <button @click="cancelDelete" class="btn-secondary mr-2">
                취소
              </button>
              <button @click="confirmDelete" class="btn-danger">
                삭제
              </button>
            </div>
          </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useModal } from '~/composables/useModal'
import { useApiCall, useApiCreate, useApiUpdate, useApiDelete } from '@/composables/useApiCall'
import { formatDate } from '~/utils/dateFormatter'
import SafeHtml from '~/components/common/SafeHtml.vue'

const { openModal } = useModal()

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  apiEndpoint: {
    type: String,
    required: true
  },
  showComments: {
    type: Boolean,
    default: true
  },
  isFirstItem: {
    type: Boolean,
    required: true
  },
  isLastItem: {
    type: Boolean,
    required: true
  },
  isAdminGallery: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'update', 'delete', 'edit', 'previous', 'next'])

const newCommentTitle = ref('')
const newCommentAuthor = ref('')
const newCommentContent = ref('')
const editingComment = ref(null)
const comments = ref([])
const showConfirmModal = ref(false)

/**
 * 새로운 댓글을 추가하는 비동기 함수입니다.
 * API를 호출하여 댓글을 서버에 저장하고, 성공 시 댓글 목록을 업데이트하며 입력 필드를 초기화합니다.
 * 댓글 추가 후 `update` 이벤트를 발생시켜 부모 컴포넌트에 변경 사항을 알립니다.
 */
async function addComment() {
  await useApiCreate({
    apiCall: () => $fetch(`${props.apiEndpoint}?action=comment`, {
      method: 'POST',
      body: {
        galleryItemId: props.item.id,
        title: newCommentTitle.value,
        author: newCommentAuthor.value,
        content: newCommentContent.value
      }
    }),
    successMessage: '댓글이 성공적으로 작성되었습니다.',
    errorMessage: '댓글 작성에 실패했습니다.',
    onSuccess: (response) => {
      comments.value.unshift(response)
      newCommentTitle.value = ''
      newCommentAuthor.value = ''
      newCommentContent.value = ''
      emit('update')
    }
  })
}

/**
 * 댓글 수정을 위해 `editingComment` 상태를 설정하는 함수입니다.
 * @param {object} comment - 수정할 댓글 객체.
 */
function editComment(comment) {
  editingComment.value = { ...comment }
}

/**
 * 댓글 수정을 취소하고 `editingComment` 상태를 초기화하는 함수입니다.
 */
function cancelEditComment() {
  editingComment.value = null
}

/**
 * 댓글을 업데이트하는 비동기 함수입니다.
 * API를 호출하여 댓글을 서버에 업데이트하고, 성공 시 댓글 목록을 갱신하고 `editingComment` 상태를 초기화합니다.
 * 업데이트 후 `update` 이벤트를 발생시켜 부모 컴포넌트에 변경 사항을 알립니다.
 */
async function updateComment() {
  await useApiUpdate({
    apiCall: () => $fetch(`${props.apiEndpoint}?action=comment&id=${editingComment.value.id}`, {
      method: 'PUT',
      body: editingComment.value
    }),
    successMessage: '댓글이 성공적으로 수정되었습니다.',
    errorMessage: '댓글 수정에 실패했습니다.',
    onSuccess: (response) => {
      const index = comments.value.findIndex(c => c.id === editingComment.value.id)
      comments.value.splice(index, 1, response)
      editingComment.value = null
      emit('update')
    }
  })
}

/**
 * 댓글을 삭제하는 비동기 함수입니다.
 * API를 호출하여 댓글을 서버에서 삭제하고, 성공 시 댓글 목록에서 해당 댓글을 제거합니다.
 * 삭제 후 `update` 이벤트를 발생시켜 부모 컴포넌트에 변경 사항을 알립니다.
 * @param {number} commentId - 삭제할 댓글의 ID.
 */
async function deleteComment(commentId) {
  await useApiDelete({
    apiCall: () => $fetch(`${props.apiEndpoint}?action=comment&id=${commentId}`, {
      method: 'DELETE'
    }),
    successMessage: '댓글이 성공적으로 삭제되었습니다.',
    errorMessage: '댓글 삭제에 실패했습니다.',
    onSuccess: () => {
      comments.value = comments.value.filter(c => c.id !== commentId)
      emit('update')
    }
  })
}

/**
 * 갤러리 항목 편집 모달을 여는 함수입니다.
 * 부모 컴포넌트에 `edit` 이벤트를 발생시켜 현재 갤러리 항목을 전달합니다.
 */
function editGalleryItem() {
  emit('edit', props.item)
}

/**
 * 갤러리 항목 삭제 확인 모달을 표시하는 함수입니다.
 */
function deleteGalleryItem() {
  showConfirmModal.value = true
}

/**
 * 갤러리 항목 삭제 확인 모달을 취소하고 숨기는 함수입니다.
 */
function cancelDelete() {
  showConfirmModal.value = false
}

/**
 * 갤러리 항목 삭제를 최종 확인하고 처리하는 비동기 함수입니다.
 * API를 호출하여 갤러리 항목을 서버에서 삭제하고,
 * 성공 시 `delete` 이벤트와 `close` 이벤트를 발생시킵니다.
 * 마지막으로 확인 모달을 닫습니다.
 */
async function confirmDelete() {
  await useApiDelete({
    apiCall: () => $fetch(`${props.apiEndpoint}?action=delete&id=${props.item.id}`, { method: 'DELETE' }),
    successMessage: '갤러리 항목이 성공적으로 삭제되었습니다.',
    errorMessage: '갤러리 항목 삭제에 실패했습니다.',
    onSuccess: () => {
      emit('delete', props.item.id)
      emit('close')
    },
    onFinally: () => {
      showConfirmModal.value = false
    }
  })
}

/**
 * 현재 갤러리 항목의 링크를 클립보드에 복사하는 함수입니다.
 * 성공 시 사용자에게 알림 메시지를 표시하고, 실패 시 콘솔에 오류를 기록하고 수동 복사 방법을 안내합니다.
 */
function shareLink() {
  const url = `${window.location.origin}/gallery?id=${props.item.id}`
  navigator.clipboard.writeText(url).then(() => {
    alert('링크가 클립보드에 복사되었습니다.')
  }, (err) => {
    console.error('링크 복사 중 오류 발생:', err)
    alert('링크 복사에 실패했습니다. 수동으로 복사해주세요: ' + url)
  })
}

/**
 * 갤러리 항목에 대한 댓글 목록을 비동기적으로 가져오는 함수입니다.
 * `showComments` prop이 true일 때만 작동합니다.
 */
async function fetchComments() {
  if (!props.showComments) return
  
  await useApiCall({
    apiCall: () => $fetch(`${props.apiEndpoint}?id=${props.item.id}&action=comments`, {
      method: 'GET'
    }),
    errorMessage: '댓글을 불러오는데 실패했습니다.',
    onSuccess: (response) => {
      comments.value = response
    }
  })
}

onMounted(() => {
  if (props.showComments) {
    fetchComments()
  }
})
</script>