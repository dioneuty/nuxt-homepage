<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8 text-center text-heading">방명록</h1>
    
    <!-- 방명록 작성 폼 -->
    <div class="card-base mb-8">
      <h2 class="text-xl font-semibold mb-4 text-heading">방명록 작성</h2>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-body mb-1">제목</label>
            <input v-model="form.title" type="text" required class="form-input">
          </div>
          <div>
            <label class="block text-sm font-medium text-body mb-1">작성자</label>
            <input v-model="form.author" type="text" required class="form-input">
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-body mb-1">내용</label>
          <textarea v-model="form.content" required class="form-input" rows="4"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-body mb-1">비밀번호</label>
          <input v-model="form.password" type="password" required class="form-input">
        </div>
        <button type="submit" class="btn-primary-lg">
          방명록 작성
        </button>
      </form>
    </div>

    <!-- 방명록 목록 -->
    <div class="space-y-6">
      <div v-for="post in posts" :key="post.id" class="card-base">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-semibold text-heading">{{ post.title }}</h3>
            <p class="text-sm text-meta">{{ post.author }} | {{ formatDate(post.createdAt) }}</p>
          </div>
          <div class="flex space-x-2">
            <button @click="editPost(post)" class="icon-color-blue">수정</button>
            <button @click="deletePost(post)" class="icon-color-red">삭제</button>
          </div>
        </div>
        <div class="text-body mb-4">{{ post.content }}</div>

        <!-- 댓글 작성 폼 -->
        <div class="border-t pt-4">
          <h4 class="text-md font-medium mb-2 text-heading">댓글 작성</h4>
          <form @submit.prevent="handleCommentSubmit(post.id)" class="space-y-2">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input v-model="commentForm.author" type="text" placeholder="작성자" required class="form-input w-auto">
              <input v-model="commentForm.password" type="password" placeholder="비밀번호" required class="form-input w-auto">
            </div>
            <textarea v-model="commentForm.content" placeholder="댓글 내용" required class="form-input" rows="2"></textarea>
            <button type="submit" class="btn-comment-submit">
              댓글 작성
            </button>
          </form>
        </div>

        <!-- 댓글 목록 -->
        <div v-if="post.comments?.length" class="mt-4 space-y-2">
          <div v-for="comment in post.comments" :key="comment.id" class="comment-bg p-3 rounded">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm font-medium text-heading">{{ comment.author }}</p>
                <p class="text-xs text-meta">{{ formatDate(comment.createdAt) }}</p>
              </div>
              <div class="flex space-x-1">
                <button @click="editComment(comment)" class="icon-color-blue text-xs">수정</button>
                <button @click="deleteComment(comment)" class="icon-color-red text-xs">삭제</button>
              </div>
            </div>
            <p class="text-body mt-1">{{ comment.content }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 페이지네이션 -->
    <div v-if="totalPages > 1" class="flex justify-center mt-8">
      <div class="flex space-x-2">
        <button v-for="page in totalPages" :key="page" @click="currentPage = page; fetchPosts()" 
                :class="['pagination-btn', { 'active': page === currentPage }]"
                >
          {{ page }}
        </button>
      </div>
    </div>

    <!-- 수정 모달 -->
    <GuestbookEditModal v-if="showEdit" v-model="showEdit" :post="selectedPost" @submit="handleEdit" />

    <!-- 삭제 모달 -->
    <GuestbookDeleteModal v-if="showDelete" v-model="showDelete" :post="selectedPost" @submit="handleDelete" />

    <!-- 댓글 수정 모달 -->
    <CommentEditModal v-if="showCommentEdit" v-model="showCommentEdit" :comment="selectedComment" @submit="handleCommentEdit" />

    <!-- 댓글 삭제 모달 -->
    <GuestbookDeleteModal v-if="showCommentDelete" v-model="showCommentDelete" :post="selectedComment" @submit="handleCommentDelete" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, defineAsyncComponent } from 'vue'
import { useApiCall, useApiCreate, useApiUpdate, useApiDelete } from '@/composables/useApiCall'
// 모달 지연 로딩
const CommentEditModal = defineAsyncComponent(() => import('~/components/CommentEditModal.vue'))
const GuestbookDeleteModal = defineAsyncComponent(() => import('~/components/GuestbookDeleteModal.vue'))
import { formatDate } from '~/utils/dateFormatter'

const posts = ref([])
const totalPages = ref(1)
const currentPage = ref(1)
const form = ref({ title: '', content: '', author: '', password: '' })
const commentForm = ref({ content: '', author: '', password: '' })

// 모달 상태
const showEdit = ref(false)
const showDelete = ref(false)
const showCommentEdit = ref(false)
const showCommentDelete = ref(false)
const selectedPost = ref(null)
const selectedComment = ref(null)

// 방명록 목록 조회
const fetchPosts = async () => {
  await useApiCall({
    apiCall: () => $fetch(`/api/guestbook?page=${currentPage.value}`),
    errorMessage: '방명록을 불러오는데 실패했습니다.',
    onSuccess: (response) => {
      posts.value = response.posts
      totalPages.value = response.totalPages
    }
  })
}

// 방명록 작성
const handleSubmit = async () => {
  await useApiCreate({
    apiCall: () => $fetch('/api/guestbook', { method: 'POST', body: form.value }),
    successMessage: '방명록이 성공적으로 작성되었습니다.',
    errorMessage: '방명록 작성에 실패했습니다.',
    onSuccess: async () => {
      form.value = { title: '', content: '', author: '', password: '' }
      await fetchPosts()
    }
  })
}

// 댓글 작성
const handleCommentSubmit = async (postId) => {
  await useApiCreate({
    apiCall: () => $fetch('/api/guestbook/comment', {
      method: 'POST',
      body: { ...commentForm.value, postId }
    }),
    successMessage: '댓글이 성공적으로 작성되었습니다.',
    errorMessage: '댓글 작성에 실패했습니다.',
    onSuccess: async () => {
      commentForm.value = { content: '', author: '', password: '' }
      await fetchPosts()
    }
  })
}

// 방명록 수정
const editPost = (post) => {
  selectedPost.value = post
  showEdit.value = true
}

const handleEdit = async (data) => {
  await useApiUpdate({
    apiCall: () => $fetch(`/api/guestbook/${selectedPost.value.id}`, { method: 'PUT', body: data }),
    successMessage: '방명록이 성공적으로 수정되었습니다.',
    errorMessage: '방명록 수정에 실패했습니다.',
    onSuccess: async () => {
      showEdit.value = false
      await fetchPosts()
    }
  })
}

// 방명록 삭제
const deletePost = (post) => {
  selectedPost.value = post
  showDelete.value = true
}

const handleDelete = async (password) => {
  await useApiDelete({
    apiCall: () => $fetch(`/api/guestbook/${selectedPost.value.id}`, {
      method: 'DELETE',
      body: { password }
    }),
    successMessage: '방명록이 성공적으로 삭제되었습니다.',
    errorMessage: '방명록 삭제에 실패했습니다.',
    onSuccess: async () => {
      showDelete.value = false
      await fetchPosts()
    }
  })
}

// 댓글 수정
const editComment = (comment) => {
  selectedComment.value = comment
  showCommentEdit.value = true
}

const handleCommentEdit = async (data) => {
  await useApiUpdate({
    apiCall: () => $fetch(`/api/guestbook/comment/${selectedComment.value.id}`, { method: 'PUT', body: data }),
    successMessage: '댓글이 성공적으로 수정되었습니다.',
    errorMessage: '댓글 수정에 실패했습니다.',
    onSuccess: async () => {
      showCommentEdit.value = false
      await fetchPosts()
    }
  })
}

// 댓글 삭제
const deleteComment = (comment) => {
  selectedComment.value = comment
  showCommentDelete.value = true
}

const handleCommentDelete = async (password) => {
  await useApiDelete({
    apiCall: () => $fetch(`/api/guestbook/comment/${selectedComment.value.id}`, {
      method: 'DELETE',
      body: { password }
    }),
    successMessage: '댓글이 성공적으로 삭제되었습니다.',
    errorMessage: '댓글 삭제에 실패했습니다.',
    onSuccess: async () => {
      showCommentDelete.value = false
      await fetchPosts()
    }
  })
}

onMounted(fetchPosts)

definePageMeta({
  title: '방명록 - Dion',
  meta: [
    { name: 'description', content: 'Dion - 방명록' },
    { name: 'keywords', content: 'Dion, 방명록' }
  ]
})
</script>

<style scoped>
/* 공통 입력 필드 스타일 */
.form-input {
  @apply w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100;
}

/* 기본 버튼 스타일 */
.btn-base {
  @apply text-white rounded-md transition-colors;
}

.btn-primary-lg {
  @apply btn-base w-full py-2 px-4 bg-blue-500 hover:bg-blue-600;
}

.btn-comment-submit {
  @apply btn-base py-1 px-3 bg-green-500 hover:bg-green-600;
}

/* 카드/패널 스타일 */
.card-base {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6;
}

/* 텍스트 색상 스타일 */
.text-heading {
  @apply text-gray-800 dark:text-gray-200;
}

.text-body {
  @apply text-gray-700 dark:text-gray-300;
}

.text-meta {
  @apply text-gray-600 dark:text-gray-400;
}

/* 페이지네이션 버튼 */
.pagination-btn {
  @apply px-3 py-1 rounded;
}

.pagination-btn.active {
  @apply bg-blue-500 text-white;
}

.pagination-btn:not(.active) {
  @apply bg-gray-200 text-gray-700;
}

/* 댓글 배경 */
.comment-bg {
  @apply bg-gray-50 dark:bg-gray-700;
}

/* 아이콘 색상 */
.icon-color-blue {
  @apply text-blue-500 hover:text-blue-700;
}

.icon-color-red {
  @apply text-red-500 hover:text-red-700;
}
</style> 