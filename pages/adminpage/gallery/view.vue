<template>
  <div class="p-4 sm:p-6 lg:p-8 dark:bg-gray-800 dark:text-gray-200 min-h-screen">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">갤러리 항목 상세</h1>
      <div>
        <button
          @click="openEditModal"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-700 dark:hover:bg-indigo-800 mr-2"
        >
          수정
        </button>
        <button
          @click="confirmDeleteItem"
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-800"
        >
          삭제
        </button>
        <button
          @click="goBack"
          class="ml-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          목록으로
        </button>
      </div>
    </div>

    <div v-if="galleryItem" class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg p-6">
      <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-8">
        <div class="sm:col-span-1">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">ID</dt>
          <dd class="mt-1 text-sm text-gray-900 dark:text-gray-200">{{ galleryItem.id }}</dd>
        </div>
        <div class="sm:col-span-1">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">유형</dt>
          <dd class="mt-1 text-sm text-gray-900 dark:text-gray-200">{{ galleryItem.type }}</dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">제목</dt>
          <dd class="mt-1 text-sm text-gray-900 dark:text-gray-200">{{ galleryItem.title }}</dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">설명</dt>
          <dd class="mt-1 text-sm text-gray-900 dark:text-gray-200">{{ galleryItem.description }}</dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">태그</dt>
          <dd class="mt-1 text-sm text-gray-900 dark:text-gray-200">{{ galleryItem.tags ? galleryItem.tags.join(', ') : 'N/A' }}</dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">내용</dt>
          <ClientOnly>
            <dd class="mt-1 text-sm text-gray-900 dark:text-gray-200 ql-editor-display" v-html="galleryItem.content || '내용 없음'"></dd>
          </ClientOnly>
        </div>
        <div class="sm:col-span-1">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">생성일</dt>
          <dd class="mt-1 text-sm text-gray-900 dark:text-gray-200">{{ formatDateTime(galleryItem.createdAt) }}</dd>
        </div>
        <div class="sm:col-span-1">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">수정일</dt>
          <dd class="mt-1 text-sm text-gray-900 dark:text-gray-200">{{ galleryItem.updatedAt ? formatDateTime(galleryItem.updatedAt) : 'N/A' }}</dd>
        </div>
      </dl>
    </div>
    <div v-else class="text-center text-gray-500 dark:text-gray-400 py-8">
      갤러리 항목을 불러오는 중입니다...
    </div>

    <!-- 갤러리 작성/수정 모달 -->
    <AdminGalleryWrite
      :isOpen="isModalOpen"
      :galleryItem="selectedItemForEdit"
      @close="closeModal"
      @refresh="fetchGalleryItemDetail"
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
import { useRoute, useRouter } from 'vue-router';
import { useToast } from '~/composables/useToast';
import { formatDateTime } from '~/utils/dateFormatter';
import AdminGalleryWrite from '~/components/admin/AdminGalleryWrite.vue';
import GalleryDeleteConfirmModal from '~/components/admin/GalleryDeleteConfirmModal.vue';
import { useAuth } from '~/composables/useAuth';

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
});

const route = useRoute();
const router = useRouter();
const { showToast } = useToast();
const { isAdmin } = useAuth();

const galleryItem = ref(null);
const isModalOpen = ref(false); // 작성/수정 모달
const selectedItemForEdit = ref(null); // 수정 시 사용
const isConfirmModalOpen = ref(false); // 삭제 확인 모달
const itemToDeleteId = ref(null);
const itemToDeleteGallerytype = ref(null);

const fetchGalleryItemDetail = async () => {
  if (!isAdmin.value) {
    showToast('관리자 권한이 필요합니다.', 'error');
    return;
  }
  const itemId = route.query.id;
  const itemGalleryType = route.query.galleryType;
  try {
    const data = await $fetch(`/api/admin/gallery?id=${itemId}&galleryType=${itemGalleryType}`, { method: 'GET' });
    galleryItem.value = data;
  } catch (error) {
    console.error('Failed to fetch gallery item detail:', error);
    showToast(error.data?.message || '갤러리 항목 상세 정보를 불러오는 데 실패했습니다.', 'error');
    router.back(); // 오류 발생 시 이전 페이지로 돌아가기
  }
};

const openEditModal = () => {
  selectedItemForEdit.value = { ...galleryItem.value, tags: galleryItem.value.tags.join(', ') }; // 태그 배열을 문자열로 변환
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedItemForEdit.value = null;
};

const confirmDeleteItem = () => {
  isConfirmModalOpen.value = true;
  itemToDeleteId.value = galleryItem.value.id;
  itemToDeleteGallerytype.value = galleryItem.value.galleryType;
};

const cancelDelete = () => {
  isConfirmModalOpen.value = false;
  itemToDeleteId.value = null;
  itemToDeleteGallerytype.value = null;
};

const deleteItem = async () => {
  if (!itemToDeleteId.value) return;
  if (!itemToDeleteGallerytype.value) return;

  if (!isAdmin.value) {
    showToast('관리자 권한이 필요합니다.', 'error');
    return;
  }
  try {
    await $fetch(`/api/admin/gallery?id=${itemToDeleteId.value}&galleryType=${itemToDeleteGallerytype.value}`, {
      method: 'DELETE',
    });
    showToast('갤러리 항목이 성공적으로 삭제되었습니다.', 'success');
    router.push('/adminpage/admingallery'); // 삭제 후 목록 페이지로 이동
  } catch (error) {
    console.error('Failed to delete gallery item:', error);
    showToast(error.data?.message || '갤러리 항목 삭제에 실패했습니다.', 'error');
  } finally {
    cancelDelete();
  }
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  fetchGalleryItemDetail();
});

const confirmMessage = computed(() => {
  return `선택된 갤러리 항목 (ID: ${itemToDeleteId.value}, 유형: ${itemToDeleteGallerytype.value})을 정말 삭제하시겠습니까?`;
});
</script>

<style>
/* Quill 에디터의 ql-editor 스타일이 상세 페이지에서도 적용되도록 별도 클래스 추가 */
.ql-editor-display {
  min-height: auto; /* 상세 페이지에서는 최소 높이 필요 없을 수 있음 */
  padding: 0;
}
.ql-editor-display p,
.ql-editor-display ol,
.ql-editor-display ul,
.ql-editor-display pre,
.ql-editor-display blockquote,
.ql-editor-display h1,
.ql-editor-display h2,
.ql-editor-display h3,
.ql-editor-display h4,
.ql-editor-display h5,
.ql-editor-display h6 {
  margin-bottom: 0.5em; /* 단락 간격 조절 */
}
.ql-editor-display strong {
  font-weight: bold;
}
.ql-editor-display em {
  font-style: italic;
}
.ql-editor-display u {
  text-decoration: underline;
}
.ql-editor-display s {
  text-decoration: line-through;
}
.ql-editor-display img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}
.ql-editor-display iframe {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}
.ql-editor-display a {
  color: #3b82f6; /* Tailwind blue-500 */
  text-decoration: underline;
}
.ql-editor-display code {
  background-color: #e2e8f0; /* Tailwind gray-200 */
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
  font-family: monospace;
}
.ql-editor-display pre.ql-syntax {
  background-color: #2d3748; /* Tailwind gray-800 */
  color: #e2e8f0; /* Tailwind gray-200 */
  padding: 1em;
  border-radius: 0.25rem;
  overflow-x: auto;
}
.dark .ql-editor-display code {
  background-color: #4b5563; /* Tailwind gray-700 */
  color: #e5e7eb; /* Tailwind gray-200 */
}
</style> 