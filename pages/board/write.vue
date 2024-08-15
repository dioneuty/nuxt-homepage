<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 dark:text-white">{{ isEditing ? '게시글 수정' : '새 게시글 작성' }}</h1>
    <form @submit.prevent="submitPost" class="space-y-4">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">제목 *</label>
        <input id="title" v-model="post.title" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="제목을 입력하세요" required>
      </div>
      <div>
        <label for="author" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">작성자 *</label>
        <input id="author" v-model="post.author" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="작성자 이름을 입력하세요" required>
      </div>
      <div>
        <label for="content" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">내용 *</label>
        <CommonQuillEditor id="content" v-model="post.content" />
      </div>
      <div class="flex justify-between">
        <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          {{ isEditing ? '수정하기' : '작성하기' }}
        </button>
        <button v-if="isEditing" @click="cancelEdit" type="button" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
          취소
        </button>
        <NuxtLink to="/board" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
          목록
        </NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useModal } from '~/composables/useModal'

const route = useRoute()
const router = useRouter()
const { openModal } = useModal()

const isEditing = ref(false)
const post = ref({
  title: '',
  author: '',
  content: ''
})

onMounted(async () => {
  if (route.query.id) {
    isEditing.value = true
    const { data, error } = await useFetch(`/api/boardPosts?id=${route.query.id}`)
    if (error.value) {
      openModal('오류', '게시글을 불러오는데 실패했습니다.')
      return
    }
    post.value = data.value
  }
})

async function submitPost() {
  if (!post.value.title || !post.value.author || !post.value.content) {
    openModal('경고', '제목, 작성자, 내용은 필수 입력 항목입니다.')
    return
  }

  const url = isEditing.value ? `/api/boardPosts/${route.query.id}` : '/api/boardPosts'
  const method = isEditing.value ? 'PUT' : 'POST'

  const { data, error } = await useFetch(url, {
    method,
    body: post.value
  })

  if (error.value) {
    openModal('오류', `게시글 ${isEditing.value ? '수정' : '작성'}에 실패했습니다.`)
    return
  }

  openModal('성공', `게시글이 성공적으로 ${isEditing.value ? '수정' : '작성'}되었습니다.`, () => {
    if (isEditing.value) {
      router.push(`/board/view?id=${route.query.id}`)
    } else {
      router.push('/board')
    }
  })
}

function cancelEdit() {
  router.push(`/board/view?id=${route.query.id}`)
}
</script>