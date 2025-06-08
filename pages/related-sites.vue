<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8 text-center text-blue-600 dark:text-blue-400">
      <Icon icon="mdi:link-variant" class="inline-block mr-2" />
      관련 사이트
    </h1>
    
    <div v-if="loading" class="text-center text-gray-500 dark:text-gray-400">
      관련 사이트를 불러오는 중입니다...
    </div>
    <div v-else-if="error" class="text-center text-red-500 dark:text-red-400">
      {{ error }}
    </div>
    <div v-else-if="relatedSites.length === 0" class="text-center text-gray-500 dark:text-gray-400">
      표시할 관련 사이트가 없습니다.
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="site in relatedSites" :key="site.id" class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
        <a :href="site.url" target="_blank" rel="noopener noreferrer" class="block">
          <div class="p-6">
            <div class="flex items-center mb-4">
              <img v-if="site.customIcon" :src="site.customIcon" class="w-6 h-6 mr-3" alt="사이트 아이콘">
              <Icon v-if="site.icon" :icon="site.icon" class="text-3xl mr-3 text-blue-500" />
              <h2 class="text-xl font-semibold text-gray-800 dark:text-white">{{ site.name }}</h2>
            </div>
            <p class="text-gray-600 dark:text-gray-300">{{ site.description }}</p>
          </div>
          <div class="bg-blue-500 text-white py-2 px-4 text-center">
            방문하기
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'

definePageMeta ({
  title: '관련 사이트 - Dion',
  meta: [
    { name: 'description', content: 'Dion - 관련 사이트' },
    { name: 'keywords', content: 'Dion, 관련 사이트' }
  ]
})

const relatedSites = ref([])
const loading = ref(true)
const error = ref(null)

const fetchRelatedSites = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/relatedSites')
    relatedSites.value = response
  } catch (err) {
    console.error('Failed to fetch related sites:', err)
    error.value = '관련 사이트 목록을 불러오는 데 실패했습니다.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRelatedSites()
})
</script>