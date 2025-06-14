<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8 dark:text-white">방명록</h1>

    <!-- 방명록 작성 폼 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4 dark:text-white">새 글 작성</h2>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="author" class="block text-sm font-medium text-gray-700 dark:text-gray-300">작성자</label>
            <input
              id="author"
              v-model="form.author"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400"
              placeholder="익명"
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">비밀번호</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400"
              placeholder="수정/삭제시 필요"
            />
          </div>
        </div>
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">제목</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400"
          />
        </div>
        <div>
          <label for="content" class="block text-sm font-medium text-gray-700 dark:text-gray-300">내용</label>
          <textarea
            id="content"
            v-model="form.content"
            rows="4"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400"
          ></textarea>
        </div>
        <div class="flex justify-end">
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            작성하기
          </button>
        </div>
      </form>
    </div>

    <!-- 방명록 목록 -->
    <div class="space-y-6">
      <div v-for="post in posts" :key="post.id" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-semibold">{{ post.title }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ post.author || '익명' }} • {{ formatDate(post.createdAt) }}
            </p>
          </div>
          <div class="space-x-2">
            <button
              @click="showEditModal(post)"
              class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              수정
            </button>
            <button
              @click="showDeleteModal(post)"
              class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              삭제
            </button>
          </div>
        </div>
        <div class="prose dark:prose-invert max-w-none mb-6">{{ post.content }}</div>

        <!-- 댓글 섹션 -->
        <div class="mt-6 border-t pt-4">
          <h4 class="text-lg font-semibold mb-4">댓글</h4>
          
          <!-- 댓글 작성 폼 -->
          <form @submit.prevent="handleCommentSubmit(post.id)" class="mb-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <input
                v-model="commentForm.author"
                type="text"
                placeholder="작성자 (선택)"
                class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-700 dark:text-gray-300"
              />
              <input
                v-model="commentForm.password"
                type="password"
                placeholder="비밀번호 (선택)"
                class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-700 dark:text-gray-300"
              />
            </div>
            <div class="flex gap-2">
              <textarea
                v-model="commentForm.content"
                rows="2"
                required
                placeholder="댓글을 입력하세요..."
                class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-700 dark:text-gray-300"
              ></textarea>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                작성
              </button>
            </div>
          </form>

          <!-- 댓글 목록 -->
          <div class="space-y-4">
            <div v-for="comment in post.comments" :key="comment.id" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div class="flex justify-between items-start mb-2">
                <p class="text-sm text-gray-500 dark:text-gray-300">
                  {{ comment.author || '익명' }} • {{ formatDate(comment.createdAt) }}
                </p>
                <div class="space-x-2">
                  <button
                    @click="showCommentEditModal(comment)"
                    class="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200 text-sm"
                  >
                    수정
                  </button>
                  <button
                    @click="showCommentDeleteModal(comment)"
                    class="text-red-600 hover:text-red-800 dark:text-red-300 dark:hover:text-red-200 text-sm"
                  >
                    삭제
                  </button>
                </div>
              </div>
              <p class="text-gray-700 dark:text-gray-200">{{ comment.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 페이지네이션 -->
    <div class="mt-8 flex justify-center">
      <nav class="flex items-center space-x-2">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="currentPage = page"
          :class="[
            'px-3 py-1 rounded-md',
            currentPage === page
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          ]"
        >
          {{ page }}
        </button>
      </nav>
    </div>

    <!-- 수정 모달 -->
    <GuestbookEditModal
      v-if="showEdit"
      v-model="showEdit"
      :post="selectedPost"
      @submit="handleEdit"
    />

    <!-- 삭제 모달 -->
    <GuestbookDeleteModal
      v-if="showDelete"
      v-model="showDelete"
      :post="selectedPost"
      @submit="handleDelete"
    />

    <!-- 댓글 수정 모달 -->
    <CommentEditModal
      v-if="showCommentEdit"
      v-model="showCommentEdit"
      :comment="selectedComment"
      @submit="handleCommentEdit"
    />

    <!-- 댓글 삭제 모달 -->
    <GuestbookDeleteModal
      v-if="showCommentDelete"
      v-model="showCommentDelete"
      :post="selectedComment"
      @submit="handleCommentDelete"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import CommentEditModal from '~/components/CommentEditModal.vue'
import GuestbookDeleteModal from '~/components/GuestbookDeleteModal.vue'
import { formatDate } from '~/utils/dateFormatter'

const posts = ref([])
const totalPages = ref(1)
const currentPage = ref(1)
const form = ref({
  title: '',
  content: '',
  author: '',
  password: ''
})
const commentForm = ref({
  content: '',
  author: '',
  password: ''
})

// 모달 상태
const showEdit = ref(false)
const showDelete = ref(false)
const showCommentEdit = ref(false)
const showCommentDelete = ref(false)
const selectedPost = ref(null)
const selectedComment = ref(null)

// 방명록 목록 조회
const fetchPosts = async () => {
  console.log('fetchPosts 함수 호출됨. API 요청 시작...');
  try {
    const response = await $fetch(`/api/guestbook?page=${currentPage.value}`)
    console.log('API 응답 수신:', response);
    posts.value = response.posts
    totalPages.value = response.totalPages
  } catch (error) {
    console.error('방명록 조회 실패:', error)
  }
}

// 방명록 작성
const handleSubmit = async () => {
  console.log('방명록 작성 폼 제출됨. 데이터:', form.value);
  try {
    await $fetch('/api/guestbook', {
      method: 'POST',
      body: form.value
    })
    console.log('방명록 작성 성공!');
    form.value = { title: '', content: '', author: '', password: '' }
    await fetchPosts()
  } catch (error) {
    console.error('방명록 작성 실패:', error)
  }
}

// 방명록 수정 모달 표시
const showEditModal = (post) => {
  selectedPost.value = post
  showEdit.value = true
}

// 방명록 삭제 모달 표시
const showDeleteModal = (post) => {
  selectedPost.value = post
  showDelete.value = true
}

// 방명록 수정
const handleEdit = async (formData) => {
  try {
    await $fetch(`/api/guestbook?id=${selectedPost.value.id}`, {
      method: 'PUT',
      body: formData
    })
    await fetchPosts()
  } catch (error) {
    console.error('방명록 수정 실패:', error)
  }
}

// 방명록 삭제
const handleDelete = async (password) => {
  try {
    await $fetch(`/api/guestbook?id=${selectedPost.value.id}`, {
      method: 'DELETE',
      body: { password }
    })
    await fetchPosts()
  } catch (error) {
    console.error('방명록 삭제 실패:', error)
  }
}

// 댓글 작성
const handleCommentSubmit = async (guestbookId) => {
  try {
    await $fetch('/api/guestbook/comment', {
      method: 'POST',
      body: {
        ...commentForm.value,
        guestbookId
      }
    })
    commentForm.value = { content: '', author: '', password: '' }
    await fetchPosts()
  } catch (error) {
    console.error('댓글 작성 실패:', error)
  }
}

// 댓글 수정 모달 표시
const showCommentEditModal = (comment) => {
  selectedComment.value = comment
  showCommentEdit.value = true
}

// 댓글 삭제 모달 표시
const showCommentDeleteModal = (comment) => {
  selectedComment.value = comment
  showCommentDelete.value = true
}

// 댓글 수정
const handleCommentEdit = async (formData) => {
  try {
    await $fetch(`/api/guestbook/comment?id=${selectedComment.value.id}`, {
      method: 'PUT',
      body: formData
    })
    await fetchPosts()
  } catch (error) {
    console.error('댓글 수정 실패:', error)
  }
}

// 댓글 삭제
const handleCommentDelete = async (password) => {
  try {
    await $fetch(`/api/guestbook/comment?id=${selectedComment.value.id}`, {
      method: 'DELETE',
      body: { password }
    })
    await fetchPosts()
  } catch (error) {
    console.error('댓글 삭제 실패:', error)
  }
}

// 페이지 변경 감지
watch(currentPage, () => {
  fetchPosts()
})

// 초기 데이터 로드
onMounted(() => {
  fetchPosts()
})
</script> 