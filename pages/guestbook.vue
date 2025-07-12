<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-200">방명록</h1>
    
    <!-- 방명록 작성 폼 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">방명록 작성</h2>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">제목</label>
            <input v-model="form.title" type="text" required class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">작성자</label>
            <input v-model="form.author" type="text" required class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">내용</label>
          <textarea v-model="form.content" required class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" rows="4"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">비밀번호</label>
          <input v-model="form.password" type="password" required class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
        </div>
        <button type="submit" class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
          방명록 작성
        </button>
      </form>
    </div>

    <!-- 방명록 목록 -->
    <div class="space-y-6">
      <div v-for="post in posts" :key="post.id" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">{{ post.title }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ post.author }} | {{ formatDate(post.createdAt) }}</p>
          </div>
          <div class="flex space-x-2">
            <button @click="editPost(post)" class="text-blue-500 hover:text-blue-700">수정</button>
            <button @click="deletePost(post)" class="text-red-500 hover:text-red-700">삭제</button>
          </div>
        </div>
        <div class="text-gray-700 dark:text-gray-300 mb-4">{{ post.content }}</div>

        <!-- 댓글 작성 폼 -->
        <div class="border-t pt-4">
          <h4 class="text-md font-medium mb-2 text-gray-800 dark:text-gray-200">댓글 작성</h4>
          <form @submit.prevent="handleCommentSubmit(post.id)" class="space-y-2">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input v-model="commentForm.author" type="text" placeholder="작성자" required class="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <input v-model="commentForm.password" type="password" placeholder="비밀번호" required class="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            </div>
            <textarea v-model="commentForm.content" placeholder="댓글 내용" required class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" rows="2"></textarea>
            <button type="submit" class="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 transition-colors">
              댓글 작성
            </button>
          </form>
        </div>

        <!-- 댓글 목록 -->
        <div v-if="post.comments?.length" class="mt-4 space-y-2">
          <div v-for="comment in post.comments" :key="comment.id" class="bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ comment.author }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">{{ formatDate(comment.createdAt) }}</p>
              </div>
              <div class="flex space-x-1">
                <button @click="editComment(comment)" class="text-blue-500 hover:text-blue-700 text-xs">수정</button>
                <button @click="deleteComment(comment)" class="text-red-500 hover:text-red-700 text-xs">삭제</button>
              </div>
            </div>
            <p class="text-gray-700 dark:text-gray-300 mt-1">{{ comment.content }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 페이지네이션 -->
    <div v-if="totalPages > 1" class="flex justify-center mt-8">
      <div class="flex space-x-2">
        <button v-for="page in totalPages" :key="page" @click="currentPage = page; fetchPosts()" 
                :class="{ 'bg-blue-500 text-white': page === currentPage, 'bg-gray-200 text-gray-700': page !== currentPage }"
                class="px-3 py-1 rounded">
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
  try {
    const response = await $fetch(`/api/guestbook?page=${currentPage.value}`)
    posts.value = response.posts
    totalPages.value = response.totalPages
  } catch (error) {
    console.error('방명록 조회 실패:', error)
  }
}

// 방명록 작성
const handleSubmit = async () => {
  try {
    await $fetch('/api/guestbook', { method: 'POST', body: form.value })
    form.value = { title: '', content: '', author: '', password: '' }
    await fetchPosts()
  } catch (error) {
    console.error('방명록 작성 실패:', error)
  }
}

// 댓글 작성
const handleCommentSubmit = async (postId) => {
  try {
    await $fetch('/api/guestbook/comment', {
      method: 'POST',
      body: { ...commentForm.value, postId }
    })
    commentForm.value = { content: '', author: '', password: '' }
    await fetchPosts()
  } catch (error) {
    console.error('댓글 작성 실패:', error)
  }
}

// 방명록 수정
const editPost = (post) => {
  selectedPost.value = post
  showEdit.value = true
}

const handleEdit = async (data) => {
  try {
    await $fetch(`/api/guestbook/${selectedPost.value.id}`, { method: 'PUT', body: data })
    showEdit.value = false
    await fetchPosts()
  } catch (error) {
    console.error('방명록 수정 실패:', error)
  }
}

// 방명록 삭제
const deletePost = (post) => {
  selectedPost.value = post
  showDelete.value = true
}

const handleDelete = async (password) => {
  try {
    await $fetch(`/api/guestbook/${selectedPost.value.id}`, {
      method: 'DELETE',
      body: { password }
    })
    showDelete.value = false
    await fetchPosts()
  } catch (error) {
    console.error('방명록 삭제 실패:', error)
  }
}

// 댓글 수정
const editComment = (comment) => {
  selectedComment.value = comment
  showCommentEdit.value = true
}

const handleCommentEdit = async (data) => {
  try {
    await $fetch(`/api/guestbook/comment/${selectedComment.value.id}`, { method: 'PUT', body: data })
    showCommentEdit.value = false
    await fetchPosts()
  } catch (error) {
    console.error('댓글 수정 실패:', error)
  }
}

// 댓글 삭제
const deleteComment = (comment) => {
  selectedComment.value = comment
  showCommentDelete.value = true
}

const handleCommentDelete = async (password) => {
  try {
    await $fetch(`/api/guestbook/comment/${selectedComment.value.id}`, {
      method: 'DELETE',
      body: { password }
    })
    showCommentDelete.value = false
    await fetchPosts()
  } catch (error) {
    console.error('댓글 삭제 실패:', error)
  }
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