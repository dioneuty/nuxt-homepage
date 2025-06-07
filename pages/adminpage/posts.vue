<!-- pages/adminpage/posts.vue -->
<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4 dark:text-white">게시판 관리</h2>
    <p class="mb-6 dark:text-gray-300">이곳에서 사이트의 게시판 목록을 관리합니다.</p>

    <div class="mb-4 flex justify-end">
      <button
        @click="openAddModal"
        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        새 게시판 추가
      </button>
    </div>

    <div class="overflow-x-auto bg-white shadow-md rounded dark:bg-gray-800 dark:border-gray-700">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
              이름
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
              설명
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
              작업
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="board in boards" :key="board.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm dark:bg-gray-800 dark:border-gray-700">
              <p class="text-gray-900 whitespace-no-wrap dark:text-white">{{ board.name }}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm dark:bg-gray-800 dark:border-gray-700">
              <p class="text-gray-900 whitespace-no-wrap dark:text-gray-200">{{ board.description }}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right dark:bg-gray-800 dark:border-gray-700">
              <button
                @click="openEditModal(board)"
                class="text-blue-600 hover:text-blue-900 mr-3"
              >
                수정
              </button>
              <button
                @click="deleteBoard(board.id)"
                class="text-red-600 hover:text-red-900"
              >
                삭제
              </button>
            </td>
          </tr>
          <tr v-if="boards.length === 0">
            <td colspan="3" class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              게시판이 없습니다.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- AdminBoardModal Component -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50"
    >
      <div class="relative p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
        <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4 dark:text-white">{{ isEditing ? '게시판 수정' : '새 게시판 추가' }}</h3>
        <div class="mt-2">
          <div class="mb-4">
            <label for="boardName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">이름</label>
            <input
              type="text"
              id="boardName"
              v-model="currentBoard.name"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div class="mb-4">
            <label for="boardDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300">설명</label>
            <textarea
              id="boardDescription"
              v-model="currentBoard.description"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            ></textarea>
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <button
            @click="closeModal"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
          >
            취소
          </button>
          <button
            @click="saveBoard"
            class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            {{ isEditing ? '수정' : '추가' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
});

useHead({
  title: '게시판 관리'
});

// Reactive state for boards
const boards = reactive([
  { id: 1, name: '자유게시판', description: '누구나 자유롭게 글을 작성하는 게시판입니다.' },
  { id: 2, name: '유머게시판', description: '재미있는 유머 글을 공유하는 게시판입니다.' },
  { id: 3, name: 'Q&A 게시판', description: '질문과 답변을 하는 게시판입니다.' },
]);

// Modal state
const isModalOpen = ref(false);
const isEditing = ref(false);
const currentBoard = reactive({ id: null, name: '', description: '' });
let nextId = boards.length > 0 ? Math.max(...boards.map(b => b.id)) + 1 : 1;

const openAddModal = () => {
  isEditing.value = false;
  currentBoard.id = null;
  currentBoard.name = '';
  currentBoard.description = '';
  isModalOpen.value = true;
};

const openEditModal = (board) => {
  isEditing.value = true;
  currentBoard.id = board.id;
  currentBoard.name = board.name;
  currentBoard.description = board.description;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const saveBoard = () => {
  if (currentBoard.name.trim() === '') {
    alert('게시판 이름을 입력해주세요.');
    return;
  }

  if (isEditing.value) {
    // Find and update existing board
    const index = boards.findIndex(b => b.id === currentBoard.id);
    if (index !== -1) {
      boards[index].name = currentBoard.name;
      boards[index].description = currentBoard.description;
    }
  } else {
    // Add new board
    boards.push({
      id: nextId++,
      name: currentBoard.name,
      description: currentBoard.description,
    });
  }
  closeModal();
};

const deleteBoard = (id) => {
  if (confirm('정말로 이 게시판을 삭제하시겠습니까?')) {
    const index = boards.findIndex(b => b.id === id);
    if (index !== -1) {
      boards.splice(index, 1);
    }
  }
};
</script>

<style scoped>
/* Tailwind CSS는 별도의 <style> 태그가 필요 없지만, 필요한 경우 여기에 추가 */
</style> 