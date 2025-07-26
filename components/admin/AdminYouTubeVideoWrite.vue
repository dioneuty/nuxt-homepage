<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
      <div class="p-6">
        <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          {{ videoItem ? 'YouTube 비디오 수정' : '새 YouTube 비디오 추가' }}
        </h2>
        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label for="url" class="block text-sm font-medium text-gray-700 dark:text-gray-300">YouTube URL</label>
            <input
              type="url"
              id="url"
              v-model="form.url"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              placeholder="https://www.youtube.com/watch?v=VIDEO_ID 또는 https://youtu.be/VIDEO_ID"
              required
              @blur="validateYouTubeUrl"
            />
            <p v-if="urlError" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ urlError }}</p>
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
              placeholder="비디오에 대한 설명을 입력하세요"
            ></textarea>
          </div>
          
          <div class="mb-4">
            <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300">카테고리</label>
            <select
              id="category"
              v-model="form.categoryId"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              :disabled="categoryLoading"
            >
              <option value="">카테고리 선택</option>
              <option 
                v-for="category in availableCategories" 
                :key="category.id" 
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
            <p v-if="categoryLoading" class="mt-1 text-sm text-gray-500 dark:text-gray-400">카테고리를 불러오는 중...</p>
          </div>
          
          <div class="mb-4">
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="form.isShort"
                class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600"
              />
              <span class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">YouTube Shorts</span>
            </label>
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
              :disabled="!!urlError || isSubmitting"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? '저장 중...' : (videoItem ? '수정' : '추가') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive, computed, onMounted } from 'vue';
import { useToast } from '~/composables/useToast';
import { useYoutubeCategories } from '~/stores/youtubeCategoryStore';
import { storeToRefs } from 'pinia';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  videoItem: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'refresh']);

const { showToast } = useToast();
const youtubeCategoryStore = useYoutubeCategoryStore();
const { categories, loading: categoryLoading } = storeToRefs(youtubeCategoryStore);
const { fetchCategories, getCategoryById } = youtubeCategoryStore;

const form = reactive({
  id: null,
  url: '',
  title: '',
  description: '',
  isShort: false,
  categoryId: '',
});

const urlError = ref('');
const isSubmitting = ref(false);

// 카테고리 관련 computed 및 helper 함수
const availableCategories = computed(() => {
  if (!categories.value || !Array.isArray(categories.value)) return [];
  return categories.value.filter(category => category.id !== 'all');
});

const getDefaultCategoryId = () => {
  if (!availableCategories.value || availableCategories.value.length === 0) return '';
  
  // 'uncategorized' 카테고리를 찾아서 기본값으로 설정
  const uncategorized = availableCategories.value.find(cat => cat.slug === 'uncategorized');
  if (uncategorized) return uncategorized.id;
  
  // 'uncategorized'가 없으면 첫 번째 카테고리 사용
  return availableCategories.value[0]?.id || '';
};

const resetForm = () => {
  form.id = null;
  form.url = '';
  form.title = '';
  form.description = '';
  form.isShort = false;
  form.categoryId = getDefaultCategoryId();
  urlError.value = '';
};

// 컴포넌트 마운트 시 카테고리 로드
onMounted(async () => {
  console.log('AdminYouTubeVideoWrite: onMounted hook 실행됨');
  try {
    console.log('AdminYouTubeVideoWrite: fetchCategories 호출 시도...');
    await fetchCategories(true); // use admin endpoint
    console.log('AdminYouTubeVideoWrite: fetchCategories 호출 완료. categories:', categories.value);
    // 새 비디오인 경우 기본 카테고리 설정
    if (!props.videoItem) {
      form.categoryId = getDefaultCategoryId();
    }
  } catch (error) {
    console.error('카테고리 로딩 실패:', error);
    // 카테고리 로딩에 실패해도 모달은 사용할 수 있도록 함
  }
});

/**
 * YouTube URL의 유효성을 검사하는 함수입니다.
 * 유효한 YouTube URL 형식인지 확인하고, videoId를 추출할 수 있는지 검증합니다.
 */
const validateYouTubeUrl = () => {
  if (!form.url) {
    urlError.value = '';
    return;
  }

  const videoId = form.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
  if (!videoId) {
    urlError.value = '유효한 YouTube URL이 아닙니다. (예: https://www.youtube.com/watch?v=VIDEO_ID)';
  } else {
    urlError.value = '';
  }
};

/**
 * videoItem prop이 변경될 때마다 폼 데이터를 업데이트합니다.
 * 새 항목인 경우 폼을 초기화하고, 기존 항목인 경우 해당 항목의 데이터로 폼을 채웁니다.
 */
watch(() => props.videoItem, (newItem) => {
  if (newItem) {
    form.id = newItem.id;
    form.url = `https://www.youtube.com/watch?v=${newItem.videoId}`;
    form.title = newItem.title;
    form.description = newItem.description || '';
    form.isShort = newItem.isShort || false;
    form.categoryId = newItem.categoryId || getDefaultCategoryId();
  } else {
    resetForm();
  }
}, { immediate: true });

/**
 * isOpen prop이 false가 될 때 폼 데이터를 초기화합니다.
 */
watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    resetForm();
  }
});

/**
 * 폼 제출을 처리하는 함수입니다. 새 YouTube 비디오를 추가하거나 기존 비디오를 수정합니다.
 */
const handleSubmit = async () => {
  if (urlError.value) {
    showToast('유효한 YouTube URL을 입력해주세요.', 'error');
    return;
  }

  // 카테고리 유효성 검사 (선택 사항이지만 선택된 경우 유효한 카테고리인지 확인)
  if (form.categoryId && !availableCategories.value.find(cat => cat.id === form.categoryId)) {
    showToast('유효하지 않은 카테고리입니다.', 'error');
    return;
  }

  isSubmitting.value = true;

  try {
    if (form.id) {
      // 수정
      await $fetch(`/api/admin/youtube-gallery/${form.id}`, {
        method: 'PUT',
        body: {
          url: form.url,
          title: form.title,
          description: form.description,
          isShort: form.isShort,
          categoryId: form.categoryId || null,
        },
      });
      showToast('YouTube 비디오가 성공적으로 수정되었습니다.', 'success');
    } else {
      // 생성
      await $fetch('/api/admin/youtube-gallery', {
        method: 'POST',
        body: {
          url: form.url,
          title: form.title,
          description: form.description,
          isShort: form.isShort,
          categoryId: form.categoryId || null,
        },
      });
      showToast('새 YouTube 비디오가 성공적으로 추가되었습니다.', 'success');
    }
    emit('refresh');
    handleClose();
  } catch (error) {
    console.error('YouTube 비디오 저장 오류:', error);
    const errorMessage = error.data?.message || 'YouTube 비디오 저장에 실패했습니다.';
    showToast(errorMessage, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

/**
 * 모달을 닫는 함수입니다.
 */
const handleClose = () => {
  emit('close');
};
</script>

<style scoped>
/* 추가적인 스타일이 필요한 경우 여기에 작성 */
</style> 