<!-- pages/adminpage/posts.vue -->
<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4 dark:text-white">게시글 관리</h2>
    <p class="mb-6 dark:text-gray-300">선택한 게시판의 글 목록을 관리합니다.</p>

    <div class="mb-4 flex items-center space-x-4">
      <label for="board-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300">게시판 선택:</label>
      <select
        id="board-select"
        v-model="selectedBoardType"
        class="mt-1 block w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        <option v-for="board in boardTypes" :key="board.type" :value="board.type">
          {{ board.name }}
        </option>
      </select>
    </div>

    <div v-if="selectedBoard" class="mb-6 p-4 border rounded-md dark:border-gray-700 dark:bg-gray-800">
      <h3 class="text-lg font-semibold dark:text-white">{{ selectedBoard.name }}</h3>
      <p class="text-sm text-gray-600 dark:text-gray-300">{{ selectedBoard.description }}</p>
    </div>

    <AdminBoardIndex
      :board-type="boardIndexBoardType"
      :admin-board-type="selectedBoardType"
      :board-title="selectedBoard ? selectedBoard.name : ''"
      board-icon="mdi:text-box-multiple"
      :api-endpoint="boardApiEndpoint"
      header-color-class="bg-blue-100 dark:bg-blue-800"
      :table-headers="dynamicTableHeaders"
      :is-admin-board="true"
      :show-write-button="false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import AdminBoardIndex from '~/components/admin/AdminBoardIndex.vue';
import { getBoardConfig } from '~/server/utils/boardTypeMapper.js';

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
});

useHead({
  title: '게시글 관리'
});

const boardTypes = [
  { type: 'freeboard', name: '자유게시판' },
  { type: 'humor', name: '유머게시판' },
  { type: 'qna', name: 'Q&A 게시판' },
];

const selectedBoardType = ref('freeboard'); // Default to freeboard

const selectedBoard = computed(() => getBoardConfig(selectedBoardType.value));

// BoardIndex 컴포넌트의 board-type prop은 라우팅에 사용되므로, 관리자 페이지 라우팅에 맞게 조정
const boardIndexBoardType = computed(() => `adminpage/posts`);

const boardApiEndpoint = computed(() => `/api/admin/posts?boardType=${selectedBoardType.value}`);

const defaultTableHeaders = [
  { key: 'id', label: '번호', icon: 'mdi:pound', class: 'hidden sm:table-cell' },
  { key: 'title', label: '제목', icon: 'mdi:format-title' },
  { key: 'author', label: '작성자', icon: 'mdi:account', class: 'hidden sm:table-cell' },
  { key: 'createdAt', label: '작성일', icon: 'mdi:calendar', class: 'hidden sm:table-cell' }
];

const qnaTableHeaders = [
  { key: 'id', label: '번호', icon: 'mdi:pound', class: 'hidden sm:table-cell' },
  { key: 'questionTitle', label: '질문 제목', icon: 'mdi:format-title' },
  { key: 'author', label: '작성자', icon: 'mdi:account', class: 'hidden sm:table-cell' },
  { key: 'createdAt', label: '작성일', icon: 'mdi:calendar', class: 'hidden sm:table-cell' }
];

const dynamicTableHeaders = computed(() => {
  return selectedBoardType.value === 'qna' ? qnaTableHeaders : defaultTableHeaders;
});
</script>

<style scoped>
/* Tailwind CSS는 별도의 <style> 태그가 필요 없지만, 필요한 경우 여기에 추가 */
</style> 