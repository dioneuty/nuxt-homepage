<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] relative flex flex-col">
      <!-- 이전 버튼 -->
      <button v-if="!isFirstItem" @click="$emit('previous')" class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 rounded-full p-2 shadow-md z-10 opacity-50 hover:opacity-100 transition-opacity">
        <Icon icon="mdi:chevron-left" class="w-6 h-6 text-gray-600 dark:text-gray-300" />
      </button>
      
      <!-- 다음 버튼 -->
      <button v-if="!isLastItem" @click="$emit('next')" class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 rounded-full p-2 shadow-md z-10 opacity-50 hover:opacity-100 transition-opacity">
        <Icon icon="mdi:chevron-right" class="w-6 h-6 text-gray-600 dark:text-gray-300" />
      </button>

      <!-- 고정 헤더 -->
      <div class="flex-shrink-0">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold dark:text-white">{{ item.title }}</h2>
          <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <Icon icon="mdi:close" class="w-6 h-6" />
          </button>
        </div>
      </div>
      
      <!-- 스크롤 가능 콘텐츠 영역 -->
      <div class="flex-1 min-h-0 overflow-y-auto">
        <div v-html="item.content" class="w-full mb-4 rounded-lg overflow-hidden"></div>
        <p class="text-gray-600 dark:text-gray-300 mb-4">{{ item.description }}</p>
        <div class="flex flex-wrap gap-2 mb-4">
          <span v-for="tag in item.tags" :key="tag" class="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs flex items-center">
            <Icon icon="mdi:tag" class="mr-1" />
            {{ tag }}
          </span>
        </div>
        <div class="flex justify-between mb-4">
          <div>
            <button @click="editGalleryItem" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">
              <Icon icon="mdi:pencil" class="mr-2" />
              수정
            </button>
            <button v-if="!isAdminGallery" @click="shareLink" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              <Icon icon="mdi:share-variant" class="mr-2" />
              공유
            </button>
          </div>
          <button @click="deleteGalleryItem" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            <Icon icon="mdi:delete" class="mr-2" />
            삭제
          </button>
        </div>
        <div v-if="showComments" class="border-t pt-4">
          <h3 class="text-xl font-bold mb-2 dark:text-white">댓글</h3>
          
          <div v-for="comment in comments" :key="comment.id" class="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
            <div v-if="editingComment && editingComment.id === comment.id">
              <input v-model="editingComment.title" placeholder="제목" class="w-full p-2 mb-2 border rounded dark:bg-gray-600 dark:text-white">
              <input v-model="editingComment.author" placeholder="글쓴이" class="w-full p-2 mb-2 border rounded dark:bg-gray-600 dark:text-white">
              <textarea v-model="editingComment.content" placeholder="내용" class="w-full p-2 mb-2 border rounded dark:bg-gray-600 dark:text-white"></textarea>
              <div class="flex justify-end">
                <button @click="cancelEditComment" class="mr-2 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                  취소
                </button>
                <button @click="updateComment" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  수정 완료
                </button>
              </div>
            </div>
            <div v-else>
              <p class="text-gray-800 dark:text-gray-200">{{ comment.title }} - {{ comment.content }}</p>
              <div class="text-sm text-gray-500 dark:text-gray-400 mt-1 flex justify-between items-center">
                <span>{{ comment.author?.name }} - {{ formatDate(comment.createdAt) }}</span>
                <div>
                  <button @click="editComment(comment)" class="text-blue-500 hover:text-blue-600 mr-2">
                    <Icon icon="mdi:pencil" />
                  </button>
                  <button @click="deleteComment(comment.id)" class="text-red-500 hover:text-red-600">
                    <Icon icon="mdi:delete" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <form @submit.prevent="addComment" class="mt-4">
            <div class="mb-2">
              <input v-model="newCommentTitle" placeholder="제목" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
            </div>
            <div class="mb-2">
              <input v-model="newCommentAuthor" placeholder="글쓴이" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
            </div>
            <div class="mb-2">
              <textarea v-model="newCommentContent" placeholder="내용" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"></textarea>
            </div>
            <button type="submit" class="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              <Icon icon="mdi:send" class="mr-2" />
              댓글 작성
            </button>
          </form>
        </div>
      </div>
      
      <!-- 확인 모달 -->
      <div v-if="showConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 class="text-xl font-bold mb-4 dark:text-white">삭제 확인</h3>
            <p class="mb-6 dark:text-gray-300">정말로 이 갤러리 항목을 삭제하시겠습니까?</p>
            <div class="flex justify-end">
              <button @click="cancelDelete" class="mr-2 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                취소
              </button>
              <button @click="confirmDelete" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
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
import { formatDate } from '~/utils/dateFormatter'

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
  const response = await $fetch(`${props.apiEndpoint}?action=comment`, {
    method: 'POST',
    body: {
      galleryItemId: props.item.id,
      title: newCommentTitle.value,
      author: newCommentAuthor.value,
      content: newCommentContent.value
    }
  })
  comments.value.unshift(response)
  newCommentTitle.value = ''
  newCommentAuthor.value = ''
  newCommentContent.value = ''
  emit('update')
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
 * 실패 시 콘솔에 오류를 기록합니다.
 */
async function updateComment() {
  try {
    const response = await $fetch(`${props.apiEndpoint}?action=comment&id=${editingComment.value.id}`, {
      method: 'PUT',
      body: editingComment.value
    })
    const index = comments.value.findIndex(c => c.id === editingComment.value.id)
    comments.value.splice(index, 1, response)
    editingComment.value = null
    emit('update')
  } catch (error) {
    console.error('댓글 수정 중 오류 발생:', error)
  }
}

/**
 * 댓글을 삭제하는 비동기 함수입니다.
 * API를 호출하여 댓글을 서버에서 삭제하고, 성공 시 댓글 목록에서 해당 댓글을 제거합니다.
 * 삭제 후 `update` 이벤트를 발생시켜 부모 컴포넌트에 변경 사항을 알립니다.
 * @param {number} commentId - 삭제할 댓글의 ID.
 */
async function deleteComment(commentId) {
  await $fetch(`${props.apiEndpoint}?action=comment&id=${commentId}`, {
    method: 'DELETE'
  })
  comments.value = comments.value.filter(c => c.id !== commentId)
  emit('update')
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
 * 실패 시 콘솔에 오류를 기록하고 사용자에게 알림을 제공합니다.
 * 마지막으로 확인 모달을 닫습니다.
 */
async function confirmDelete() {
  try {
    await $fetch(`${props.apiEndpoint}?action=delete&id=${props.item.id}`, { method: 'DELETE' })
    emit('delete', props.item.id)
    emit('close')
  } catch (error) {
    console.error('갤러리 항목 삭제 중 오류 발생:', error)
  } finally {
    showConfirmModal.value = false
  }
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
 * `showComments` prop이 true일 때만 작동하며, API 호출 중 발생하는 오류를 콘솔에 기록합니다.
 */
async function fetchComments() {
  if (!props.showComments) return
  try {
    const response = await $fetch(`${props.apiEndpoint}?id=${props.item.id}&action=comments`, {
      method: 'GET'
    })
    comments.value = response
  } catch (error) {
    console.error('댓글을 불러오는 데 실패했습니다:', error)
  }
}

onMounted(() => {
  if (props.showComments) {
    fetchComments()
  }
})
</script>