<template>
  <div class="container mx-auto px-4 py-8 bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
    <h1 class="text-3xl font-bold mb-6">게시판</h1>
    <div class="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-6">
      <table class="min-w-full">
        <thead class="bg-green-600 text-white">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"># 번호</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">제목</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">작성자</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">작성일</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="post in posts.posts" :key="post.id" class="hover:bg-gray-200 dark:hover:bg-gray-700">
            <td class="px-6 py-4 whitespace-nowrap">{{ post.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <NuxtLink :to="`/adminboard/view?id=${post.id}`" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">{{ post.title }}</NuxtLink>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">{{ post.author }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ post.createdAt }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex justify-end mb-4">
      <NuxtLink to="/adminboard/write" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        새 글 작성
      </NuxtLink>
    </div>
    <SearchBar @search="handleSearch" />
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
import { ref } from 'vue';
import SearchBar from '~/components/board/SearchBar.vue';
import Pagination from '~/components/board/Pagination.vue';

const { data: posts, error } = await useAsyncData('adminPosts', () => 
  $fetch('/api/adminboard')
)

if (error.value) {
  console.error('게시글을 불러오는 데 실패했습니다:', error.value)
}

const totalItems = ref(100); // 예시 값, API에서 받아와야 함
const itemsPerPage = ref(10);
const currentPage = ref(1);

const handleSearch = (searchParams) => {
  console.log('Search params:', searchParams);
  // 여기에 검색 로직 구현
};

const handlePageChange = (page) => {
  currentPage.value = page;
  // 여기에 페이지 변경 로직 구현
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  // 여기에 페이지당 항목 수 변경 로직 구현
};
</script>