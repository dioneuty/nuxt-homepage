<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">질문과 답변</h1>
    <div class="mb-6 flex justify-between items-center">
      <NuxtLink to="/qna/write" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
        질문 작성하기
      </NuxtLink>
    </div>
    <SearchBar @search="handleSearch" />
    <ul class="space-y-4 mt-6">
      <li v-for="qna in qnas" :key="qna.id" class="border p-4 rounded shadow hover:shadow-md transition">
        <NuxtLink :to="`/qna/view?id=${qna.id}`" class="block">
          <h2 class="text-xl font-semibold mb-2">{{ qna.questionTitle }}</h2>
          <p class="text-gray-600 mb-2">{{ qna.questionContent.substring(0, 100) }}...</p>
          <div class="text-sm text-gray-500 mb-2">
            작성자: {{ qna.author }} | 작성일: {{ formatDate(qna.createdAt) }}
          </div>
          <div class="flex items-center mb-2">
            <span :class="qna.answerContent ? 'bg-green-500' : 'bg-red-500'" class="px-2 py-1 rounded text-white text-xs mr-2">
              {{ qna.answerContent ? '답변 완료' : '답변 대기' }}
            </span>
          </div>
          <div v-if="qna.answerContent" class="bg-blue-50 p-3 rounded">
            <h3 class="font-semibold mb-1">답변:</h3>
            <p class="text-gray-700">{{ qna.answerContent.substring(0, 100) }}...</p>
            <div class="text-sm text-gray-500 mt-1">
              답변자: {{ qna.answerer }} | 답변일: {{ formatDate(qna.updatedAt) }}
            </div>
          </div>
        </NuxtLink>
      </li>
    </ul>
    <Pagination 
      :current-page="currentPage" 
      :total-pages="totalPages" 
      :items-per-page="itemsPerPage"
      @page-change="handlePageChange"
      @items-per-page-change="handleItemsPerPageChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const qnas = ref([])
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const searchParams = ref({ type: '', text: '' })

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ko-KR')
}

const fetchQnAs = async () => {
  const { data } = await useFetch('/api/qna', {
    params: {
      page: currentPage.value,
      itemsPerPage: itemsPerPage.value,
      ...searchParams.value
    }
  })
  qnas.value = data.value.qnas
  totalItems.value = data.value.total
}

const handleSearch = (params) => {
  searchParams.value = params
  currentPage.value = 1
  router.push({ query: { ...route.query, ...params, page: 1 } })
  fetchQnAs()
}

const handlePageChange = (page) => {
  currentPage.value = page
  router.push({ query: { ...route.query, page } })
  fetchQnAs()
}

const handleItemsPerPageChange = (items) => {
  itemsPerPage.value = items
  currentPage.value = 1
  router.push({ query: { ...route.query, itemsPerPage: items, page: 1 } })
  fetchQnAs()
}

onMounted(() => {
  currentPage.value = parseInt(route.query.page) || 1
  itemsPerPage.value = parseInt(route.query.itemsPerPage) || 10
  searchParams.value = {
    type: route.query.type || '',
    text: route.query.text || ''
  }
  fetchQnAs()
})
</script>