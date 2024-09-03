<template>
  <div class="container mx-auto px-4 py-8 dark:bg-gray-800 dark:text-white">
    <h1 class="text-3xl font-bold mb-6 dark:text-white flex items-center">
      <Icon icon="mdi:frequently-asked-questions" class="mr-2" />
      질문과 답변
    </h1>
    <div class="mb-6 flex justify-between items-center">
      <NuxtLink to="/qna/write" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center">
        <Icon icon="mdi:pencil-plus" class="mr-2" />
        질문 작성하기
      </NuxtLink>
    </div>
    
    <!-- 검색 바 컴포넌트 -->
    <SearchBar @search="handleSearch" />
    
    <ul class="space-y-4 mt-6">
      <li v-for="qna in qnas" :key="qna.id" class="border p-4 rounded shadow hover:shadow-md transition dark:border-gray-700 dark:bg-gray-700">
        <NuxtLink :to="`/qna/view?id=${qna.id}`" class="block">
          <h2 class="text-xl font-semibold mb-2 dark:text-white flex items-center">
            <Icon icon="mdi:help-circle-outline" class="mr-2" />
            {{ qna.questionTitle }}
          </h2>
          <p class="text-gray-600 mb-2 dark:text-gray-300">{{ qna.questionContent.substring(0, 100) }}...</p>
          <div class="text-sm text-gray-500 mb-2 dark:text-gray-400 flex items-center">
            <Icon icon="mdi:account" class="mr-1" />
            작성자: {{ qna.author }} | 
            <Icon icon="mdi:calendar" class="ml-2 mr-1" />
            작성일: {{ formatDate(qna.createdAt) }}
          </div>
          <div class="flex items-center mb-2">
            <span :class="qna.answerContent ? 'bg-green-500' : 'bg-red-500'" class="px-2 py-1 rounded text-white text-xs mr-2 flex items-center">
              <Icon :icon="qna.answerContent ? 'mdi:check-circle' : 'mdi:clock-outline'" class="mr-1" />
              {{ qna.answerContent ? '답변 완료' : '답변 대기' }}
            </span>
          </div>
          <div v-if="qna.answerContent" class="bg-blue-50 p-3 rounded dark:bg-blue-900">
            <h3 class="font-semibold mb-1 dark:text-white flex items-center">
              <Icon icon="mdi:comment-text-outline" class="mr-2" />
              답변:
            </h3>
            <p class="text-gray-700 dark:text-gray-300">{{ qna.answerContent.substring(0, 100) }}...</p>
            <div class="text-sm text-gray-500 mt-1 dark:text-gray-400 flex items-center">
              <Icon icon="mdi:account" class="mr-1" />
              답변자: {{ qna.answerer }} | 
              <Icon icon="mdi:calendar" class="ml-2 mr-1" />
              답변일: {{ formatDate(qna.updatedAt) }}
            </div>
          </div>
        </NuxtLink>
      </li>
    </ul>
    
    <!-- 페이지네이션 컴포넌트 -->
    <Pagination 
      :total-items="totalItems" 
      :items-per-page="itemsPerPage" 
      :current-page="currentPage"
      @page-change="handlePageChange"
      @items-per-page-change="handleItemsPerPageChange"
    />
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SearchBar from '~/components/board/SearchBar.vue'
import Pagination from '~/components/board/Pagination.vue'
import { Icon } from '@iconify/vue'

definePageMeta ({
  title: '질문과 답변 - Dion',
  meta: [
    { name: 'description', content: 'Dion - 질문과 답변' },
    { name: 'keywords', content: 'Dion, 질문과 답변' }
  ]
})

const route = useRoute()
const router = useRouter()

const qnas = ref([])
const totalItems = ref(0)
const itemsPerPage = ref(10)
const currentPage = ref(1)
const searchParams = ref({ type: '', text: '' })

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ko-KR')
}

const fetchQnAs = async () => {
  try {
    const data = await $fetch('/api/qna', {
      params: {
        page: currentPage.value,
        itemsPerPage: itemsPerPage.value,
        ...searchParams.value
      }
    })
    qnas.value = data.qnas
    totalItems.value = data.total
  } catch (error) {
    console.error('Error fetching QnAs:', error)
  }
}

const handleSearch = (params) => {
  searchParams.value = params
  currentPage.value = 1
  updateRouteQuery()
}

const handlePageChange = (page) => {
  currentPage.value = page
  updateRouteQuery()
}

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage
  currentPage.value = 1
  updateRouteQuery()
}

const updateRouteQuery = () => {
  router.push({
    query: {
      ...searchParams.value,
      page: currentPage.value,
      itemsPerPage: itemsPerPage.value
    }
  })
}

watchEffect(() => {
  currentPage.value = parseInt(route.query.page) || 1
  itemsPerPage.value = parseInt(route.query.itemsPerPage) || 10
  searchParams.value = {
    type: route.query.type || '',
    text: route.query.text || ''
  }
  fetchQnAs()
})
</script>