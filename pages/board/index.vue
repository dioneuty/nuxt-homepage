<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6 dark:text-white text-center">게시판</h1>
    <div class="bg-white dark:bg-gray-800 dark:text-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-white">번호</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-white">제목</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-white">작성자</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-white">작성일</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:text-white">
          <tr v-for="post in posts" :key="post.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-white">{{ post.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <NuxtLink :to="`/board/view?id=${post.id}`" class="text-sm font-medium text-blue-600 hover:text-blue-800 dark:hover:text-blue-600 dark:text-white">
                {{ post.title }}
              </NuxtLink>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-white">{{ post.author }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-white">
              {{ new Date(post.createdAt).toLocaleDateString() }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-6">
      <NuxtLink to="/board/write" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        새 글 작성
      </NuxtLink>
    </div>
    
    <!-- 검색 바 컴포넌트 -->
    <SearchBar @search="handleSearch" />
    
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
import SearchBar from '~/components/board/SearchBar.vue'
import Pagination from '~/components/board/Pagination.vue'

const totalItems = ref(0)
const itemsPerPage = ref(10)
const currentPage = ref(1)
const searchParams = ref({ type: 'title', text: '' })


const { data: posts, error, refresh } = await useAsyncData('boardPosts', async () => {
  const response = await $fetch('/api/boardPosts', {
    params: {
      page: currentPage.value,
      itemsPerPage: itemsPerPage.value,
      type: searchParams.value.type,
      text: searchParams.value.text
    }
  })
  totalItems.value = response.total
  return response.posts
}, {
  watch: [currentPage, itemsPerPage, searchParams]
})


const handleSearch = async (params) => {
  searchParams.value = params
  currentPage.value = 1
}

const handlePageChange = async (page) => {
  currentPage.value = page
}

const handleItemsPerPageChange = async (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage
  currentPage.value = 1
}
</script>