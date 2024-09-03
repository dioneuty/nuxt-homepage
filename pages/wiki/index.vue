<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 dark:text-white flex items-center">
      <Icon icon="mdi:book-open-page-variant" class="mr-2" />
      Wiki 목록
    </h1>
    <div class="mb-6 flex justify-between items-center">
      <NuxtLink 
        v-if="auth.isLoggedIn && auth.user" 
        to="/wiki/edit" 
        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center"
      >
        <Icon icon="mdi:plus" class="mr-2" />
        새 Wiki 페이지
      </NuxtLink>
      <NuxtLink to="/wiki/syntax" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center ml-2">
        <Icon icon="mdi:help-circle-outline" class="mr-2" />
        마크 문법 가이드
      </NuxtLink>
    </div>
    <div v-if="loading" class="text-center py-8">
      <Icon icon="mdi:loading" class="animate-spin w-8 h-8 text-blue-500" />
      <p class="mt-2 text-gray-600 dark:text-gray-400">데이터를 불러오는 중...</p>
    </div>
    <div v-else-if="error" class="text-center py-8 text-red-500">
      <Icon icon="mdi:alert-circle" class="w-8 h-8 mb-2" />
      <p>데이터를 불러오는 데 실패했습니다. 다시 시도해 주세요.</p>
    </div>
    <ul v-else class="space-y-4">
      <li v-for="page in wikiPages" :key="page.id" class="border p-4 rounded shadow hover:shadow-md transition dark:border-gray-700 dark:bg-gray-800">
        <NuxtLink :to="`/wiki/view?id=${page.id}`" class="block">
          <h2 class="text-xl font-semibold mb-2 dark:text-white flex items-center">
            <Icon icon="mdi:file-document-outline" class="mr-2" />
            {{ page.title }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400">{{ page.excerpt }}</p>
          <div class="mt-2 text-sm text-gray-500 dark:text-gray-500 flex items-center">
            <Icon icon="mdi:clock-outline" class="mr-1" />
            최종 수정: {{ formatDate(page.updatedAt) }}
          </div>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useAuth } from '~/composables/useAuth'

definePageMeta ({
  title: '위키 - Dion',
  meta: [
    { name: 'description', content: 'Dion - 위키' },
    { name: 'keywords', content: 'Dion, 위키' }
  ]
})

const { auth } = useAuth()

const wikiPages = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const { data } = await useFetch('/api/wiki')
    wikiPages.value = data.value
  } catch (e) {
    error.value = e
  } finally {
    loading.value = false
  }
})

function formatDate(date) {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>