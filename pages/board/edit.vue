<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 dark:text-white">게시글 {{ id ? '수정' : '작성' }}</h1>
    <form v-if="post" @submit.prevent="submitPost" class="space-y-4">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">제목</label>
        <input type="text" id="title" v-model="post.title" required
               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
      </div>
      <div>
        <label for="author" class="block text-sm font-medium text-gray-700 dark:text-gray-300">작성자</label>
        <input type="text" id="author" v-model="post.author" required
               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
      </div>
      <div>
        <label for="content" class="block text-sm font-medium text-gray-700 dark:text-gray-300">내용</label>
        <CommonQuillEditor v-model="post.content" />
      </div>
      <div class="flex justify-end items-center space-x-4">
        <button type="submit" 
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          {{ id ? '게시글 수정' : '게시글 작성' }}
        </button>
        <NuxtLink :to="`/board/view?id=${id}`"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-600">
          취소
        </NuxtLink>
        <button type="button" @click="goToList"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700">
          목록으로
        </button>
      </div>
    </form>
    <div v-else>로딩 중...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CommonQuillEditor from '~/components/CommonQuillEditor.vue'

const route = useRoute()
const router = useRouter()
const id = route.query.id
const post = ref(null)

const { data, error } = await useLazyAsyncData(`post-${id}`, () => $fetch(`/api/boardPosts`, {
  params: { id }
}))

watchEffect(() => {
  if (data.value) {
    post.value = data.value
  }
})

async function submitPost() {
  if (!post.value.title || !post.value.author || !post.value.content) {
    alert('제목, 작성자, 내용은 필수 입력 항목입니다.')
    return
  }

  const { error } = await useFetch(id ? `/api/boardPosts` : `/api/boardPosts`, {
    method: id ? 'PUT' : 'POST',
    body: post.value
  })

  if (error.value) {
    console.error('게시글 작성/수정 중 오류:', error.value)
    alert('게시글 작성/수정이 실패했습니다.')
  } else {
    alert('게시글이 작성/수정되었습니다.')
    await router.push('/board')
  }
}

function goToList() {
  router.push('/board')
}
</script>