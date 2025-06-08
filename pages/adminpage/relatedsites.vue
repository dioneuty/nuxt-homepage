<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4 dark:text-white">관련 사이트 관리</h1>

    <div class="flex justify-end mb-4">
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
      >
        새 관련 사이트 추가
      </button>
    </div>

    <div class="overflow-x-auto bg-white dark:bg-gray-800 rounded shadow">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th
              class="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
            >
              이름
            </th>
            <th
              class="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
            >
              URL
            </th>
            <th
              class="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
            >
              설명
            </th>
            <th
              class="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
            >
              순서
            </th>
            <th
              class="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
            >
              생성일
            </th>
            <th
              class="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
            >
              수정일
            </th>
            <th
              class="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900"
            ></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="site in relatedSites" :key="site.id">
            <td
              class="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm dark:text-white"
            >
              {{ site.name }}
            </td>
            <td
              class="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm dark:text-white"
            >
              <a :href="site.url" target="_blank" class="text-blue-500 hover:underline">
                {{ site.url }}
              </a>
            </td>
            <td
              class="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm dark:text-white"
            >
              {{ site.description }}
            </td>
            <td
              class="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm dark:text-white"
            >
              {{ site.order }}
            </td>
            <td
              class="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm dark:text-white"
            >
              {{ formatDate(site.createdAt) }}
            </td>
            <td
              class="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm dark:text-white"
            >
              {{ formatDate(site.updatedAt) }}
            </td>
            <td
              class="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-right"
            >
              <button
                @click="openEditModal(site)"
                class="text-blue-500 hover:text-blue-700 mr-3"
              >
                수정
              </button>
              <button
                @click="confirmDelete(site.id)"
                class="text-red-500 hover:text-red-700"
              >
                삭제
              </button>
            </td>
          </tr>
          <tr v-if="relatedSites.length === 0">
            <td colspan="7" class="px-5 py-5 bg-white dark:bg-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
              데이터가 없습니다.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center"
    >
      <div
        class="relative p-8 bg-white dark:bg-gray-900 w-full max-w-lg mx-auto rounded-lg shadow-lg"
      >
        <h2 class="text-xl font-bold mb-4 dark:text-white">
          {{ isEditMode ? '관련 사이트 수정' : '새 관련 사이트 추가' }}
        </h2>
        <form @submit.prevent="handleSave">
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >이름</label
            >
            <input
              type="text"
              id="name"
              v-model="currentSite.name"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div class="mb-4">
            <label for="url" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >URL</label
            >
            <input
              type="url"
              id="url"
              v-model="currentSite.url"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div class="mb-4">
            <label
              for="description"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >설명</label
            >
            <input
              type="text"
              id="description"
              v-model="currentSite.description"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div class="mb-4">
            <label for="order" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >순서</label
            >
            <input
              type="number"
              id="order"
              v-model="currentSite.order"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div class="flex justify-end space-x-2">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              취소
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              {{ isEditMode ? '수정' : '추가' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="isDeleteConfirmOpen"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center"
    >
      <div
        class="relative p-8 bg-white dark:bg-gray-900 w-full max-w-lg mx-auto rounded-lg shadow-lg"
      >
        <h2 class="text-xl font-bold mb-4 dark:text-white">관련 사이트 삭제 확인</h2>
        <p class="mb-4 text-gray-700 dark:text-gray-300">
          이 관련 사이트를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
        </p>
        <div class="flex justify-end space-x-2">
          <button
            type="button"
            @click="cancelDelete"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            취소
          </button>
          <button
            type="button"
            @click="deleteRelatedSite"
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from '~/composables/useToast';

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
});

const relatedSites = ref([]);
const isModalOpen = ref(false);
const isEditMode = ref(false);
const currentSite = ref({
  id: null,
  name: '',
  url: '',
  description: '',
  order: null,
});
const isDeleteConfirmOpen = ref(false);
const siteToDeleteId = ref(null);
const toast = useToast();

const fetchRelatedSites = async () => {
  try {
    const response = await $fetch('/api/admin/relatedSites');
    relatedSites.value = response;
  } catch (error) {
    console.error('Failed to fetch related sites:', error);
    toast.showToast('관련 사이트 목록을 불러오지 못했습니다.', 'error');
  }
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('ko-KR', options);
};

const openCreateModal = () => {
  isEditMode.value = false;
  currentSite.value = {
    id: null,
    name: '',
    url: '',
    description: '',
    order: null,
  };
  isModalOpen.value = true;
};

const openEditModal = (site) => {
  isEditMode.value = true;
  currentSite.value = { ...site };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  currentSite.value = {
    id: null,
    name: '',
    url: '',
    description: '',
    order: null,
  };
};

const handleSave = async () => {
  try {
    if (isEditMode.value) {
      await $fetch(`/api/admin/relatedSites/${currentSite.value.id}`, {
        method: 'PUT',
        body: currentSite.value,
      });
      toast.showToast('관련 사이트가 성공적으로 수정되었습니다.', 'success');
    } else {
      await $fetch('/api/admin/relatedSites', {
        method: 'POST',
        body: currentSite.value,
      });
      toast.showToast('새 관련 사이트가 성공적으로 추가되었습니다.', 'success');
    }
    closeModal();
    await fetchRelatedSites();
  } catch (error) {
    console.error('Failed to save related site:', error);
    toast.showToast('관련 사이트 저장에 실패했습니다.', 'error');
  }
};

const confirmDelete = (id) => {
  siteToDeleteId.value = id;
  isDeleteConfirmOpen.value = true;
};

const cancelDelete = () => {
  siteToDeleteId.value = null;
  isDeleteConfirmOpen.value = false;
};

const deleteRelatedSite = async () => {
  try {
    await $fetch(`/api/admin/relatedSites/${siteToDeleteId.value}`, {
      method: 'DELETE',
    });
    toast.showToast('관련 사이트가 성공적으로 삭제되었습니다.', 'success');
    cancelDelete();
    await fetchRelatedSites();
  } catch (error) {
    console.error('Failed to delete related site:', error);
    toast.showToast('관련 사이트 삭제에 실패했습니다.', 'error');
  }
};

onMounted(() => {
  fetchRelatedSites();
});
</script> 