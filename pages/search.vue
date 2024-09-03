<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 dark:text-white flex items-center">
      <Icon icon="mdi:magnify" class="mr-2" />
      종합 검색
    </h1>
    <form @submit.prevent="performSearch" class="mb-8">
      <div class="flex">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="검색어를 입력하세요" 
          class="flex-grow p-2 border rounded-l dark:bg-gray-700 dark:text-white"
        >
        <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600">검색</button>
      </div>
    </form>
    
    <div v-if="loading" class="text-center py-8">
      <Icon icon="mdi:loading" class="animate-spin w-8 h-8 text-blue-500" />
      <p class="mt-2 text-gray-600 dark:text-gray-400">검색 중...</p>
    </div>
    
    <div v-else-if="searchResults.length > 0">
      <h2 class="text-2xl font-semibold mb-4 dark:text-white">검색 결과</h2>
      <ul class="space-y-4">
        <li v-for="result in searchResults" :key="result.id" class="border p-4 rounded shadow hover:shadow-md transition dark:border-gray-700 dark:bg-gray-800">
          <NuxtLink :to="result.link" class="block">
            <h3 class="text-xl font-semibold mb-2 dark:text-white flex items-center">
              <Icon :icon="getIconForType(result.type)" class="mr-2" />
              {{ result.title }}
            </h3>
            <!-- <p class="text-gray-600 dark:text-gray-400">{{ result.excerpt }}</p> -->
            <div class="mt-2 text-sm text-gray-500 dark:text-gray-500 flex items-center">
              <Icon icon="mdi:tag" class="mr-1" />
              {{ result.type }}
            </div>
          </NuxtLink>
        </li>
      </ul>
    </div>
    <p v-else-if="searched" class="text-center py-8 text-gray-600 dark:text-gray-400">검색 결과가 없습니다.</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

definePageMeta ({
  title: '종합 검색 - Dion',
  meta: [
    { name: 'description', content: 'Dion - 종합 검색' },
    { name: 'keywords', content: 'Dion, 종합 검색' }
  ]
})

const searchQuery = ref('')
const searchResults = ref([])
const loading = ref(false)
const searched = ref(false)

async function performSearch() {
  if (!searchQuery.value.trim()) return

  loading.value = true
  searched.value = true

  try {
    const { data } = await useFetch('/api/search', {
      method: 'POST',
      body: { query: searchQuery.value }
    })
    searchResults.value = data.value
  } catch (error) {
    console.error('검색 중 오류 발생:', error)
  } finally {
    loading.value = false
  }
}

function getIconForType(type) {
  switch (type) {
    case '게시판': return 'mdi:clipboard-text-outline'
    case '블로그': return 'mdi:post-outline'
    case '위키': return 'mdi:book-open-page-variant'
    case '갤러리': return 'mdi:image-multiple'
    default: return 'mdi:file-document-outline'
  }
}
</script>