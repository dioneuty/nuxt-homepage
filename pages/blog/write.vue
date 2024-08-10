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
        <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300">카테고리</label>
        <select id="category" v-model="category_id" required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>
      <div>
        <label for="content" class="block text-sm font-medium text-gray-700 dark:text-gray-300">내용</label>
        <textarea id="content" v-model="content" rows="10" required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
      </div>
      <div class="flex justify-between items-center">
        <button type="submit" 
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          포스트 작성
        </button>
        <NuxtLink to="/blog" 
                  class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600">
          목록으로
        </NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: 'blog',
  name: 'blog-write'
})

const router = useRouter()
const title = ref('')
const content = ref('')
const category_id = ref(null)
const refreshCategories = inject('refreshCategories')

const categories = [
  { name: '전체 보기', slug: 'all' },
  { name: '부분 수리', slug: 'partial-repair' },
  { name: '전장 설치', slug: 'electrical-installation' },
  { name: '욕실 수리', slug: 'bathroom-repair' },
  { name: '주방 수리', slug: 'kitchen-repair' },
  { name: '도배 및 페인트', slug: 'wallpaper-and-paint' },
  { name: '바닥재 시공', slug: 'flooring' },
  { name: '창호 교체', slug: 'window-replacement' },
  { name: '단열 공사', slug: 'insulation' },
  { name: '누수 수리', slug: 'leak-repair' },
  { name: '전체 리모델링', slug: 'full-remodeling' }
]

async function submitPost() {
  const { error } = await useFetch('/api/blogPosts', {
    method: 'POST',
    body: {
      title: title.value,
      content: content.value,
      category_id: category_id.value
    }
  })

  if (error.value) {
    console.error('Error:', error.value)
    alert('포스트 작성에 실패했습니다.')
    return
  }

  alert('포스트가 성공적으로 작성되었습니다.')

  refreshCategories()

  router.push('/blog')
}
</script>