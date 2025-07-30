<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-container max-w-2xl">
      <div class="p-6">
        <h2 class="section-title mb-4">
          {{ videoItem ? 'YouTube 비디오 수정' : '새 YouTube 비디오 추가' }}
        </h2>
        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label for="url" class="form-label">YouTube URL</label>
            <input
              type="url"
              id="url"
              v-model="form.url"
              class="input mt-1"
              placeholder="https://www.youtube.com/watch?v=VIDEO_ID 또는 https://youtu.be/VIDEO_ID"
              required
              @blur="validateYouTubeUrl"
            />
            <p v-if="urlError" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ urlError }}</p>
            
            <!-- 비디오 미리보기 영역 -->
            <div v-if="videoPreview.loading || videoPreview.data || videoPreview.error" class="mt-3 p-3 border border-gray-200 rounded-lg dark:border-gray-600">
              <!-- 로딩 상태 -->
              <div v-if="videoPreview.loading" class="flex items-center space-x-3">
                <div class="w-32 h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div class="flex-1">
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
              
              <!-- 오류 상태 -->
              <div v-else-if="videoPreview.error" class="flex items-center text-red-600 dark:text-red-400">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-sm">{{ videoPreview.error }}</span>
              </div>
              
              <!-- 미리보기 데이터 -->
              <div v-else-if="videoPreview.data">
                <div class="flex items-start space-x-3">
                  <img 
                    :src="videoPreview.data.thumbnail" 
                    :alt="videoPreview.data.title"
                    class="w-32 h-20 object-cover rounded flex-shrink-0"
                    loading="lazy"
                  />
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
                      {{ videoPreview.data.title }}
                    </h4>
                    <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      채널: {{ videoPreview.data.author }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-500">
                      비디오 ID: {{ videoPreview.data.videoId }}
                    </p>
                  </div>
                </div>
                <!-- 자동 제목 채우기 버튼 -->
                <div class="mt-3 flex justify-end">
                  <button
                    type="button"
                    @click="fillTitleFromPreview"
                    :disabled="!videoPreview.data.title || !!form.title"
                    class="btn-primary px-3 py-1 text-xs"
                  >
                    제목 자동 채우기
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mb-4">
            <label for="title" class="form-label">제목</label>
            <input
              type="text"
              id="title"
              v-model="form.title"
              class="input mt-1"
              required
            />
          </div>
          
          <div class="mb-4">
            <label for="description" class="form-label">설명</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              class="input mt-1"
              placeholder="비디오에 대한 설명을 입력하세요"
            ></textarea>
          </div>
          
          <div class="mb-4">
            <label for="category" class="form-label">카테고리</label>
            <div class="flex gap-2">
              <select
                id="category"
                v-model="form.categoryId"
                class="input mt-1 flex-1"
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
              
              <!-- 카테고리 관리 버튼들 (관리자만 표시) -->
              <div v-if="isAdmin" class="flex gap-1 mt-1">
                <button
                  type="button"
                  @click="showCategoryAddModal = true"
                  class="btn-success"
                  title="카테고리 추가"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                </button>
                
                <button
                  type="button"
                  @click="editSelectedCategory"
                  :disabled="!form.categoryId"
                  class="btn-primary"
                  title="카테고리 수정"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                
                <button
                  type="button"
                  @click="deleteSelectedCategory"
                  :disabled="!form.categoryId || isUncategorized"
                  class="btn-danger"
                  title="카테고리 삭제"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
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
              class="btn-secondary"
            >
              취소
            </button>
            <button
              type="submit"
              :disabled="!!urlError || isSubmitting"
              class="btn-primary"
            >
              {{ isSubmitting ? '저장 중...' : (videoItem ? '수정' : '추가') }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- 카테고리 추가/수정 모달 -->
    <div v-if="showCategoryAddModal || showCategoryEditModal" class="modal-overlay z-60">
      <div class="modal-container max-w-md">
        <div class="p-6">
          <h3 class="section-title mb-4">
            {{ showCategoryAddModal ? '새 카테고리 추가' : '카테고리 수정' }}
          </h3>
          
          <form @submit.prevent="handleCategorySubmit">
            <div class="mb-4">
              <label for="categoryName" class="form-label">카테고리명</label>
              <input
                type="text"
                id="categoryName"
                v-model="categoryForm.name"
                class="input mt-1"
                placeholder="카테고리명을 입력하세요"
                required
                maxlength="50"
              />
            </div>
            
            <div class="flex justify-end space-x-4">
              <button
                type="button"
                @click="closeCategoryModal"
                class="btn-secondary"
              >
                취소
              </button>
              <button
                type="submit"
                :disabled="!categoryForm.name.trim() || categorySubmitting"
                class="btn-primary"
              >
                {{ categorySubmitting ? '처리 중...' : (showCategoryAddModal ? '추가' : '수정') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Confirm Modal -->
  <ConfirmModal
    :isOpen="showConfirmModal"
    :title="confirmModalData.title"
    :message="confirmModalData.message"
    :type="confirmModalData.type"
    :confirmText="confirmModalData.confirmText"
    :cancelText="confirmModalData.cancelText"
    @confirm="handleConfirmModalConfirm"
    @cancel="handleConfirmModalCancel"
    @close="handleConfirmModalCancel"
  />
</template>

<script setup>
import { ref, watch, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useToast } from '~/composables/useToast';
import { useApiCall } from '@/composables/useApiCall';
import { useYoutubeCategories } from '~/stores/youtubeCategoryStore';
import { useAuth } from '~/composables/useAuth';
import { storeToRefs } from 'pinia';
import ConfirmModal from '~/components/common/ConfirmModal.vue';

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
const { isAdmin } = useAuth();
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

// Confirm modal states
const showConfirmModal = ref(false);
const confirmModalData = ref({
  title: '',
  message: '',
  type: 'info',
  confirmText: '확인',
  cancelText: '취소',
  onConfirm: null
});

// 비디오 미리보기 관련 상태
const videoPreview = reactive({
  loading: false,
  data: null,
  error: null
});

let previewTimeout = null;

// 미리보기 캐시 (세션 동안 유지)
const previewCache = new Map();

// 카테고리 관리 관련 상태
const showCategoryAddModal = ref(false);
const showCategoryEditModal = ref(false);
const categorySubmitting = ref(false);
const categoryForm = reactive({
  id: null,
  name: ''
});

// 카테고리 관련 computed 및 helper 함수
const availableCategories = computed(() => {
  if (!categories.value || !Array.isArray(categories.value)) return [];
  return categories.value.filter(category => category.id !== 'all');
});

const isUncategorized = computed(() => {
  if (!form.categoryId) return false;
  const selectedCategory = availableCategories.value.find(cat => cat.id === form.categoryId);
  return selectedCategory?.slug === 'uncategorized';
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
  videoPreview.data = null;
  videoPreview.error = null;
  videoPreview.loading = false;
  
  // 디바운스 타이머 클리어
  if (previewTimeout) {
    clearTimeout(previewTimeout);
    previewTimeout = null;
  }
};


// 컴포넌트 마운트 시 카테고리 로드
onMounted(async () => {
  console.log('AdminYouTubeVideoWrite: onMounted hook 실행됨');
  try {
    console.log('AdminYouTubeVideoWrite: fetchCategories 호출 시도...');
    await fetchCategories(); // use public endpoint (both APIs now return same data)
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

// 컴포넌트 언마운트 시 리소스 정리
onUnmounted(() => {
  if (previewTimeout) {
    clearTimeout(previewTimeout);
    previewTimeout = null;
  }
});

/**
 * YouTube URL에서 비디오 ID를 추출하는 함수입니다.
 */
const extractVideoId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match?.[1] || null;
};

// Confirm modal helper function
const showConfirm = (options) => {
  return new Promise((resolve) => {
    confirmModalData.value = {
      title: options.title || '확인',
      message: options.message,
      type: options.type || 'info',
      confirmText: options.confirmText || '확인',
      cancelText: options.cancelText || '취소',
      onConfirm: () => resolve(true)
    }
    showConfirmModal.value = true
  })
}

const handleConfirmModalCancel = () => {
  showConfirmModal.value = false
  // Promise는 자동으로 pending 상태로 남아있게 됨 (사용자가 취소한 경우)
}

const handleConfirmModalConfirm = () => {
  showConfirmModal.value = false
  if (confirmModalData.value.onConfirm) {
    confirmModalData.value.onConfirm()
  }
}

/**
 * YouTube oEmbed API를 사용하여 비디오 정보를 가져오는 함수입니다.
 * 캐싱을 통해 동일한 비디오에 대한 중복 API 호출을 방지합니다.
 */
const fetchVideoPreview = async (url) => {
  const videoId = extractVideoId(url);
  if (!videoId) {
    videoPreview.data = null;
    videoPreview.error = null;
    return;
  }

  // 캐시에서 먼저 확인
  if (previewCache.has(videoId)) {
    const cachedData = previewCache.get(videoId);
    if (cachedData.error) {
      videoPreview.data = null;
      videoPreview.error = cachedData.error;
    } else {
      videoPreview.data = cachedData;
      videoPreview.error = null;
      
      // 제목이 비어있으면 자동으로 폼에 채우기
      if (!form.title && cachedData.title) {
        form.title = cachedData.title;
      }
    }
    videoPreview.loading = false;
    return;
  }

  videoPreview.loading = true;
  videoPreview.error = null;

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      const errorMessage = response.status === 404 ? '존재하지 않는 비디오입니다.' : 
                          response.status === 403 ? '비공개 또는 제한된 비디오입니다.' :
                          '비디오 정보를 가져올 수 없습니다.';
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    const previewData = {
      title: data.title,
      author: data.author_name,
      thumbnail: data.thumbnail_url,
      thumbnailWidth: data.thumbnail_width,
      thumbnailHeight: data.thumbnail_height,
      videoId: videoId
    };

    // 캐시에 저장 (성공한 경우)
    previewCache.set(videoId, previewData);
    
    videoPreview.data = previewData;

    // 제목이 비어있으면 자동으로 폼에 채우기
    if (!form.title && data.title) {
      form.title = data.title;
    }
  } catch (error) {
    console.error('비디오 미리보기 로딩 오류:', error);
    const errorMessage = error.message;
    
    // 오류도 캐시에 저장 (재시도 방지)
    previewCache.set(videoId, { error: errorMessage });
    
    videoPreview.error = errorMessage;
    videoPreview.data = null;
  } finally {
    videoPreview.loading = false;
  }
};

/**
 * YouTube URL의 유효성을 검사하는 함수입니다.
 * 유효한 YouTube URL 형식인지 확인하고, videoId를 추출할 수 있는지 검증합니다.
 */
const validateYouTubeUrl = () => {
  if (!form.url) {
    urlError.value = '';
    videoPreview.data = null;
    videoPreview.error = null;
    return;
  }

  const videoId = extractVideoId(form.url);
  if (!videoId) {
    urlError.value = '유효한 YouTube URL이 아닙니다. (예: https://www.youtube.com/watch?v=VIDEO_ID)';
    videoPreview.data = null;
    videoPreview.error = null;
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
 * URL 변경을 감지하고 디바운싱과 함께 미리보기를 가져옵니다.
 */
watch(() => form.url, (newUrl) => {
  // 기존 타이머 클리어
  if (previewTimeout) {
    clearTimeout(previewTimeout);
  }

  // URL이 비어있으면 미리보기 초기화
  if (!newUrl) {
    videoPreview.data = null;
    videoPreview.error = null;
    videoPreview.loading = false;
    return;
  }

  // 500ms 디바운싱으로 API 호출 최적화
  previewTimeout = setTimeout(() => {
    const videoId = extractVideoId(newUrl);
    if (videoId) {
      fetchVideoPreview(newUrl);
    }
  }, 500);
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

  const requestBody = {
    url: form.url,
    title: form.title,
    description: form.description,
    isShort: form.isShort,
    categoryId: form.categoryId || null,
  };

  await useApiCall({
    apiCall: () => {
      if (form.id) {
        // 수정
        return $fetch(`/api/admin/youtube-gallery/${form.id}`, {
          method: 'PUT',
          body: requestBody
        });
      } else {
        // 생성
        return $fetch('/api/admin/youtube-gallery', {
          method: 'POST',
          body: requestBody
        });
      }
    },
    loadingState: { isSubmitting },
    successMessage: form.id ? 'YouTube 비디오가 성공적으로 수정되었습니다.' : '새 YouTube 비디오가 성공적으로 추가되었습니다.',
    errorMessage: 'YouTube 비디오 저장에 실패했습니다.',
    onSuccess: () => {
      emit('refresh');
      handleClose();
    },
    onError: (error) => {
      const errorMessage = error.data?.message || 'YouTube 비디오 저장에 실패했습니다.';
      showToast(errorMessage, 'error');
    }
  });
};

/**
 * 모달을 닫는 함수입니다.
 */
const handleClose = () => {
  emit('close');
};

// 카테고리 관리 함수들
const editSelectedCategory = () => {
  if (!form.categoryId) return;
  
  const selectedCategory = availableCategories.value.find(cat => cat.id === form.categoryId);
  if (selectedCategory) {
    categoryForm.id = selectedCategory.id;
    categoryForm.name = selectedCategory.name;
    showCategoryEditModal.value = true;
  }
};

const deleteSelectedCategory = async () => {
  if (!form.categoryId || isUncategorized.value) return;
  
  const selectedCategory = availableCategories.value.find(cat => cat.id === form.categoryId);
  if (!selectedCategory) return;
  
  try {
    const confirmDelete = await showConfirm({
      title: '카테고리 삭제',
      message: `'${selectedCategory.name}' 카테고리를 삭제하시겠습니까?\n해당 카테고리에 속한 비디오들은 '미분류'로 이동됩니다.`,
      type: 'danger',
      confirmText: '삭제',
      cancelText: '취소'
    });
    
    if (!confirmDelete) return;
  } catch (err) {
    return;
  }
  
  try {
    await youtubeCategoryStore.deleteCategory(selectedCategory.id);
    showToast(`'${selectedCategory.name}' 카테고리가 삭제되었습니다.`, 'success');
    form.categoryId = getDefaultCategoryId();
  } catch (error) {
    console.error('카테고리 삭제 오류:', error);
    showToast('카테고리 삭제에 실패했습니다.', 'error');
  }
};

const handleCategorySubmit = async () => {
  if (!categoryForm.name.trim()) return;
  
  categorySubmitting.value = true;
  
  try {
    if (showCategoryAddModal.value) {
      // 새 카테고리 추가
      const newCategoryData = {
        name: categoryForm.name.trim(),
        slug: categoryForm.name.trim().toLowerCase()
          .replace(/[^a-z0-9가-힣\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim()
      };
      
      await youtubeCategoryStore.createCategory(newCategoryData);
      showToast(`'${categoryForm.name}' 카테고리가 추가되었습니다.`, 'success');
      
      // 새로 추가된 카테고리를 선택
      await nextTick();
      const newCategory = availableCategories.value.find(cat => cat.name === categoryForm.name);
      if (newCategory) {
        form.categoryId = newCategory.id;
      }
    } else {
      // 카테고리 수정
      const existingCategories = categories.value.filter(c => c.id !== 'all');
      const updatedCategories = existingCategories.map(cat => {
        if (cat.id === categoryForm.id) {
          return {
            ...cat,
            name: categoryForm.name.trim(),
            slug: categoryForm.name.trim().toLowerCase()
              .replace(/[^a-z0-9가-힣\s-]/g, '')
              .replace(/\s+/g, '-')
              .trim()
          };
        }
        return cat;
      });
      
      await youtubeCategoryStore.updateCategories(updatedCategories, []);
      showToast(`카테고리가 '${categoryForm.name}'으로 수정되었습니다.`, 'success');
    }
    
    closeCategoryModal();
  } catch (error) {
    console.error('카테고리 처리 오류:', error);
    const action = showCategoryAddModal.value ? '추가' : '수정';
    showToast(`카테고리 ${action}에 실패했습니다.`, 'error');
  } finally {
    categorySubmitting.value = false;
  }
};

const closeCategoryModal = () => {
  showCategoryAddModal.value = false;
  showCategoryEditModal.value = false;
  categoryForm.id = null;
  categoryForm.name = '';
  categorySubmitting.value = false;
};

/**
 * 미리보기 데이터에서 제목을 폼에 채우는 함수입니다.
 */
const fillTitleFromPreview = () => {
  if (videoPreview.data?.title) {
    form.title = videoPreview.data.title;
    showToast('제목이 자동으로 채워졌습니다.', 'success');
  }
};
</script>

<style scoped>
/* line-clamp 유틸리티 클래스 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 