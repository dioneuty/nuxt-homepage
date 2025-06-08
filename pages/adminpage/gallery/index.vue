<template>
  <div class="p-4 sm:p-6 lg:p-8 dark:bg-gray-800 dark:text-gray-200 min-h-screen">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">갤러리 관리</h1>
      <button
        @click="openWriteModal"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800"
      >
        새 갤러리 항목 추가
      </button>
    </div>

    <!-- 검색 및 필터링 -->
    <div class="mb-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
      <select
        v-model="galleryType"
        @change="fetchGalleryItems"
        class="p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
      >
        <option value="">모든 갤러리</option>
        <option value="admin">관리자 갤러리</option>
        <option value="general">일반 갤러리</option>
      </select>
      <select
        v-model="searchType"
        class="p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
      >
        <option value="">검색 유형</option>
        <option value="title">제목</option>
        <option value="description">설명</option>
      </select>
      <input
        type="text"
        v-model="searchText"
        @keyup.enter="fetchGalleryItems"
        placeholder="검색어 입력"
        class="flex-grow p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
      />
      <button
        @click="fetchGalleryItems"
        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-700 dark:hover:bg-indigo-800"
      >
        검색
      </button>
    </div>

    <!-- 갤러리 목록 테이블 -->
    <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
              ID
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
              유형
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
              제목
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
              설명
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
              태그
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
              생성일
            </th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
          <tr v-if="galleryItems.length === 0">
            <td colspan="7" class="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
              갤러리 아이템이 없습니다.
            </td>
          </tr>
          <tr
            v-for="item in galleryItems"
            :key="item.galleryType + '-' + item.id"
            @click="viewItemDetail(item.id, item.galleryType)"
            class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
              {{ item.id }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
              {{ item.type }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
              {{ item.title }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 overflow-hidden text-ellipsis max-w-xs">
              {{ item.description }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
              {{ item.tags?.join(', ') }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
              {{ formatDateTime(item.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="openEditModal(item)"
                class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-500 mr-4"
              >
                수정
              </button>
              <button
                @click="confirmDeleteItem(item.id)"
                class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-500"
              >
                삭제
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 페이지네이션 -->
    <div class="mt-6 flex justify-between items-center">
      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200"
      >
        이전
      </button>
      <span class="text-gray-700 dark:text-gray-300">페이지 {{ currentPage }} / {{ totalPages }}</span>
      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200"
      >
        다음
      </button>
    </div>

    <!-- 갤러리 작성/수정 모달 -->
    <AdminGalleryWrite
      :isOpen="isModalOpen"
      :galleryItem="selectedItem"
      @close="closeModal"
      @refresh="fetchGalleryItems"
    />

    <!-- 삭제 확인 모달 -->
    <GalleryDeleteConfirmModal
      :is-open="isConfirmModalOpen"
      title="갤러리 항목 삭제"
      :message="confirmMessage"
      @confirm="deleteItem"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from '~/composables/useToast';
import { formatDateTime } from '~/utils/dateFormatter';
import AdminGalleryWrite from '~/components/admin/AdminGalleryWrite.vue';
import GalleryDeleteConfirmModal from '~/components/admin/GalleryDeleteConfirmModal.vue';
import { useAuth } from '~/composables/useAuth';
import { useRouter } from 'vue-router';

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
});

const { showToast } = useToast();
const { isAdmin } = useAuth(); // isAdmin 상태 가져오기
const router = useRouter(); // useRouter 추가

const galleryItems = ref([]);
const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = 10;
const searchType = ref('');
const searchText = ref('');
const galleryType = ref('');
const selectedItem = ref(null); // 수정 시 사용
const isModalOpen = ref(false); // 작성/수정 모달
const isConfirmModalOpen = ref(false); // 삭제 확인 모달
const itemToDeleteId = ref(null);
const itemToDeleteType = ref(null);

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

const fetchGalleryItems = async () => {
  if (!isAdmin.value) {
    showToast('관리자 권한이 필요합니다.', 'error');
    return;
  }
  try {
    const { items, total } = await $fetch('/api/admin/gallery', {
      method: 'GET',
      query: {
        page: currentPage.value,
        limit: itemsPerPage,
        searchType: searchType.value,
        searchText: searchText.value,
        galleryType: galleryType.value,
      },
    });
    galleryItems.value = items;
    totalItems.value = total;
  } catch (error) {
    console.error('Failed to fetch gallery items:', error);
    showToast(error.data?.message || '갤러리 아이템을 불러오는 데 실패했습니다.', 'error');
  }
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchGalleryItems();
  }
};

const openWriteModal = () => {
  selectedItem.value = null; // 새 항목 추가
  isModalOpen.value = true;
};

const openEditModal = (item) => {
  selectedItem.value = { ...item, tags: item.tags.join(', ') }; // 태그 배열을 문자열로 변환하여 전달
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedItem.value = null;
};

const confirmDeleteItem = (id, type) => {
  itemToDeleteId.value = id;
  itemToDeleteType.value = type;
  isConfirmModalOpen.value = true;
};

const cancelDelete = () => {
  isConfirmModalOpen.value = false;
  itemToDeleteId.value = null;
  itemToDeleteType.value = null;
};

const deleteItem = async () => {
  if (!itemToDeleteId.value) return;
  if (!itemToDeleteType.value) return;
  if (!isAdmin.value) {
    showToast('관리자 권한이 필요합니다.', 'error');
    return;
  }
  try {
    await $fetch(`/api/admin/gallery?id=${itemToDeleteId.value}&type=${itemToDeleteType.value}`, {
      method: 'DELETE',
    });
    showToast('갤러리 항목이 성공적으로 삭제되었습니다.', 'success');
    fetchGalleryItems();
  } catch (error) {
    console.error('Failed to delete gallery item:', error);
    showToast(error.data?.message || '갤러리 항목 삭제에 실패했습니다.', 'error');
  } finally {
    cancelDelete();
  }
};

const viewItemDetail = (id, galleryType) => {
  router.push({ path: '/adminpage/gallery/view', query: { id: id, galleryType: galleryType } });
};

onMounted(() => {
  fetchGalleryItems();
});

const confirmMessage = computed(() => {
  return itemToDeleteId.value ? `ID ${itemToDeleteId.value}번 갤러리 항목을 정말 삭제하시겠습니까?` : '선택된 갤러리 항목을 정말 삭제하시겠습니까?';
});
</script>

<style scoped>
/* 필요한 스타일 추가 */
</style> 