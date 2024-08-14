<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 dark:text-white">새 블로그 포스트 작성</h1>
    <form @submit.prevent="submitPost" class="space-y-4">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">제목</label>
        <input type="text" id="title" v-model="title" required
               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
      </div>
      <div>
        <label for="categoryId" class="block text-sm font-medium text-gray-700 dark:text-gray-300">카테고리</label>
        <select id="categoryId" v-model="categoryId" required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>
      <div>
        <label for="content" class="block text-sm font-medium text-gray-700 dark:text-gray-300">내용</label>
        <CommonQuillEditor v-model="content" />
      </div>
      <div class="flex justify-end space-x-4">
        <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          작성
        </button>
        <NuxtLink to="/blog" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
          취소
        </NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CommonQuillEditor from '~/components/CommonQuillEditor.vue'

const router = useRouter()

const title = ref('')
const content = ref('')
const categoryId = ref('')

const { data: categories } = await useFetch('/api/categories')

async function submitPost() {
  if (!title.value || !content.value || !categoryId.value) {
    alert('제목, 내용, 카테고리는 필수 입력 항목입니다.')
    return
  }

  const { error } = await useFetch('/api/blogPosts', {
    method: 'POST',
    body: {
      title: title.value,
      content: content.value,
      categoryId: categoryId.value
    }
  })

  if (error.value) {
    console.error('블로그 포스트 작성 중 오류:', error.value)
    alert('블로그 포스트 작성이 실패했습니다.')
  } else {
    alert('블로그 포스트가 작성되었습니다.')
    await navigateTo('/blog')
  }
}
</script>