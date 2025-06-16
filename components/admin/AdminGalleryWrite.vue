<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 overflow-hidden">
      <div class="p-6">
        <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{{ galleryItem ? '갤러리 항목 수정' : '새 갤러리 항목 추가' }}</h2>
        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label for="galleryType" class="block text-sm font-medium text-gray-700 dark:text-gray-300">갤러리 분류</label>
            <select
              id="galleryType"
              v-model="form.galleryType"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            >
              <option value="general">일반 갤러리</option>
              <option value="admin">관리자 갤러리</option>
            </select>
          </div>
          <div class="mb-4">
            <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">제목</label>
            <input
              type="text"
              id="title"
              v-model="form.title"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>
          <div class="mb-4">
            <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">설명</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            ></textarea>
          </div>
          <div class="mb-4">
            <label for="tags" class="block text-sm font-medium text-gray-700 dark:text-gray-300">태그 (콤마로 구분)</label>
            <input
              type="text"
              id="tags"
              v-model="form.tags"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              placeholder="예: 자연, 풍경, 여행"
            />
          </div>
          <div class="mb-4">
            <label for="content" class="block text-sm font-medium text-gray-700 dark:text-gray-300">콘텐츠</label>
            <ClientOnly>
              <QuillEditor
                v-model:content="form.content"
                contentType="html"
                theme="snow"
                toolbar="full"
                class="mt-1 block w-full min-h-[300px] border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </ClientOnly>
          </div>

          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="handleClose"
              class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              취소
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              {{ galleryItem ? '수정' : '추가' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive } from 'vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { useToast } from '~/composables/useToast';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  galleryItem: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'refresh']);

const { showToast } = useToast();

const form = reactive({
  id: null,
  title: '',
  description: '',
  content: '',
  tags: '',
  galleryType: 'general',
});

const resetForm = () => {
  form.id = null;
  form.title = '';
  form.description = '';
  form.content = '';
  form.tags = '';
  form.galleryType = 'general';
};

/**
 * `galleryItem` prop이 변경될 때마다 폼 데이터를 업데이트합니다.
 * 새 항목인 경우 폼을 초기화하고, 기존 항목인 경우 해당 항목의 데이터로 폼을 채웁니다.
 * @param {object|null} newItem - 새로 전달된 갤러리 항목 객체 또는 null.
 */
watch(() => props.galleryItem, (newItem) => {
  if (newItem) {
    form.id = newItem.id;
    form.title = newItem.title;
    form.description = newItem.description;
    form.content = newItem.content;
    form.tags = newItem.tags; // 이미 문자열로 변환되어 넘어옴
    form.galleryType = newItem.type || 'general'; // galleryType 추가 (type으로 넘어옴)
  } else {
    resetForm();
  }
}, { immediate: true });

/**
 * `isOpen` prop이 `false`가 될 때 폼 데이터를 초기화합니다.
 * 모달이 닫힐 때 폼의 잔여 데이터를 제거하기 위함입니다.
 * @param {boolean} newVal - `isOpen` prop의 새 값.
 */
watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    resetForm();
  }
});

/**
 * 폼 제출을 처리하는 함수입니다. 새 갤러리 항목을 추가하거나 기존 항목을 수정합니다.
 * 성공 시 토스트 메시지를 표시하고, 모달을 닫고, 부모 컴포넌트에 새로고침 이벤트를 알립니다.
 * 실패 시 오류 토스트 메시지를 표시합니다.
 */
const handleSubmit = async () => {
  try {
    if (form.id) {
      // 수정
      await $fetch(`/api/admin/gallery`, {
        method: 'PUT',
        body: {
          title: form.title,
          description: form.description,
          content: form.content,
          tags: form.tags,
          id: form.id,
          galleryType: form.galleryType,
        },
      });
      showToast('갤러리 항목이 성공적으로 수정되었습니다.', 'success');
    } else {
      // 생성
      await $fetch('/api/admin/gallery', {
        method: 'POST',
        body: {
          title: form.title,
          description: form.description,
          content: form.content,
          tags: form.tags,
          galleryType: form.galleryType,
        },
      });
      showToast('새 갤러리 항목이 성공적으로 추가되었습니다.', 'success');
    }
    emit('refresh');
    handleClose();
  } catch (error) {
    showToast('갤러리 항목 저장에 실패했습니다.', 'error');
  }
};

/**
 * 모달을 닫는 함수입니다. 부모 컴포넌트에 'close' 이벤트를 발생시킵니다.
 */
const handleClose = () => {
  emit('close');
};
</script>

<style scoped>
/* Tailwind CSS는 자동으로 적용되므로 추가적인 scoped CSS는 필요에 따라 추가 */
.ql-editor {
  min-height: 200px; /* 에디터 최소 높이 조정 */
}
</style> 