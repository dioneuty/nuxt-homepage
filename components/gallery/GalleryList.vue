<template>
  <div>
    <!-- 상단 검색바와 새 갤러리 항목 추가 버튼 영역 -->
    <div class="mb-6 flex justify-between items-center">
      <!-- 검색 입력창 -->
      <div class="relative flex-grow mr-4">
        <!-- 검색 아이콘 -->
        <Icon icon="mdi:magnify" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="검색..." 
          class="w-full p-2 pl-10 border rounded-md dark:bg-gray-700 dark:text-white"
        >
      </div>
      <!-- 새 갤러리 항목 추가 버튼 -->
      <button 
        @click="openEditModal()" 
        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center"
      >
        <Icon icon="mdi:plus" class="mr-2" />
        새 갤러리 항목
      </button>
    </div>

    <!-- 상태별 화면 표시 영역 -->
    <!-- 로딩 중일 때 표시되는 스피너 -->
    <div v-if="loading" class="text-center py-8">
      <Icon icon="mdi:loading" class="animate-spin w-8 h-8 text-blue-500" />
      <p class="mt-2 text-gray-600 dark:text-gray-400">데이터를 불러오는 중...</p>
    </div>

    <!-- 에러 발생 시 표시되는 메시지 -->
    <div v-else-if="error" class="text-center py-8 text-red-500">
      <Icon icon="mdi:alert-circle" class="w-8 h-8 mb-2" />
      <p>데이터를 불러오는 데 실패했습니다. 다시 시도해 주세요.</p>
    </div>

    <!-- 검색 결과가 없을 때 표시되는 메시지 -->
    <div v-else-if="filteredItems.length === 0" class="text-center py-8 text-gray-600 dark:text-gray-400">
      <Icon icon="mdi:image-off" class="w-8 h-8 mb-2" />
      <p>표시할 갤러리 항목이 없습니다.</p>
    </div>

    <!-- 갤러리 메인 컨텐츠 영역 (Masonry 레이아웃) -->
    <div v-else class="masonry-layout">
      <!-- 각 갤러리 아이템 -->
      <div v-for="item in filteredItems" :key="item.id" class="masonry-item mb-4 break-inside-avoid">
        <div @click="openModal(item)" class="glass-card-effect rounded-lg overflow-hidden relative cursor-pointer">
          <!-- 이미지 영역 -->
          <div class="w-full h-48 overflow-hidden">
            <ClientOnly>
              <div v-html-img-one="item.content" class="w-full h-full object-cover"></div>
            </ClientOnly>
          </div>
          <!-- 컨텐츠 정보 영역 -->
          <div class="p-4">
            <!-- 제목 -->
            <h2 class="text-xl font-bold mb-2 dark:text-white flex items-center">
              <Icon icon="mdi:image" class="mr-2" />
              {{ item.title }}
            </h2>
            <!-- 설명 -->
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-4 flex items-center">
              <Icon icon="mdi:information-outline" class="mr-2" />
              {{ item.description }}
            </p>
            <!-- 태그 목록 -->
            <div class="flex flex-wrap gap-2 mb-8">
              <span v-for="tag in item.tags" :key="tag" class="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs flex items-center">
                <Icon icon="mdi:tag" class="mr-1" />
                {{ tag }}
              </span>
            </div>
          </div>
          <!-- 댓글 수 표시 뱃지 -->
          <div v-if="showComments" class="absolute bottom-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
            <Icon icon="mdi:comment-outline" class="mr-1" />
            {{ item.comments ? item.comments.length : 0 }}
          </div>
        </div>
      </div>
    </div>

    <!-- 모달 컴포넌트들 -->
    <!-- 갤러리 상세 보기 모달 -->
    <GalleryModal
      v-if="selectedItem"
      :item="selectedItem"
      :apiEndpoint="apiEndpoint"
      :isFirstItem="isFirstItem"
      :isLastItem="isLastItem"
      :isAdminGallery="isAdminGallery"
      @close="closeModal"
      @edit="openEditModal"
      @delete="deleteItem"
      @update="fetchItems"
      @previous="showPreviousItem"
      @next="showNextItem"
      :showComments="showComments"
    />
    
    <!-- 갤러리 항목 편집 모달 -->
    <GalleryEditModal
      v-if="showEditModal"
      :item="editingItem"
      :apiEndpoint="apiEndpoint"
      @close="closeEditModal"
      @save="updateItem"
    />
  </div>
</template>

<script setup>
// 필요한 의존성 import
import { ref, computed, onMounted, watch, defineAsyncComponent } from 'vue'
import { Icon } from '@iconify/vue'
// 🚀 모달 지연 로딩
const GalleryModal = defineAsyncComponent(() => import('./GalleryModal.vue'))
const GalleryEditModal = defineAsyncComponent(() => import('./GalleryEditModal.vue'))
import { useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'

const router = useRouter()

// props 정의
const props = defineProps({
  apiEndpoint: {
    type: String,
    required: true
  },
  showComments: {
    type: Boolean,
    default: true
  },
  isAdminGallery: {
    type: Boolean,
    default: false,
  },
})

// 반응형 상태 변수들
const items = ref([])                // 갤러리 아이템 목록
const searchQuery = ref('')          // 검색어
const selectedItem = ref(null)       // 선택된 아이템
const showEditModal = ref(false)     // 편집 모달 표시 여부
const editingItem = ref(null)        // 편집 중인 아이템
const loading = ref(true)            // 로딩 상태
const error = ref(null)              // 에러 상태

// 검색어에 따른 필터링된 아이템 목록
const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value
  return items.value.filter(item => 
    item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 현재 선택된 아이템의 인덱스
const selectedItemIndex = computed(() => {
  if (!selectedItem.value) return -1
  return filteredItems.value.findIndex(item => item.id === selectedItem.value.id)
})

// 이전/다음 버튼 활성화 여부
const isFirstItem = computed(() => selectedItemIndex.value === 0)
const isLastItem = computed(() => selectedItemIndex.value === filteredItems.value.length - 1)

/**
 * 갤러리 아이템 데이터를 비동기적으로 가져오는 함수입니다.
 * API 호출 중 로딩 상태를 설정하고, 에러 발생 시 `error` 상태를 업데이트합니다.
 * @returns {boolean} 데이터 가져오기 성공 여부.
 */
async function fetchItems() {
  loading.value = true
  error.value = null
  try {
    items.value = await $fetch(props.apiEndpoint)
    return true
  } catch (err) {
    console.error('Failed to fetch gallery items:', err)
    error.value = err
    return false
  } finally {
    loading.value = false
  }
}

const route = useRoute()

/**
 * 주어진 ID를 가진 갤러리 아이템의 모달을 여는 함수입니다.
 * 아이템 목록이 비어있다면 먼저 데이터를 가져온 후 해당 아이템을 찾아 모달을 엽니다.
 * @param {string} id - 열고자 하는 갤러리 아이템의 ID.
 */
async function openModalById(id) {
  if (items.value.length === 0) {
    const success = await fetchItems()
    if (!success) return
  }
  const item = items.value.find(item => item.id === parseInt(id))
  if (item) {
    openModal(item)
  }
}

// URL 쿼리 파라미터 변경 감지
watch(() => route.query.id, (newId) => {
  if (newId) {
    openModalById(newId)
  }
})

// 인증 상태 가져오기
const { isLoggedIn, user } = useAuth()

// 컴포넌트 마운트 시 초기화
onMounted(async () => {
  // 관리자 갤러리인 경우 권한 체크
  if (!props.isAdminGallery || (props.isAdminGallery && isLoggedIn.value && user.value?.role === 'ADMIN')) {
    await fetchItems()

    if (route.query.id) {
      openModalById(route.query.id)
    }
  } else {
    router.push('/')
  }
})

/**
 * 모달을 여는 함수입니다.
 * 선택된 아이템을 설정합니다.
 * @param {object} item - 선택된 갤러리 아이템 객체.
 */
function openModal(item) {
  selectedItem.value = item
}

/**
 * 모달을 닫는 함수입니다.
 * 선택된 아이템을 초기화합니다.
 */
function closeModal() {
  selectedItem.value = null
}

// TODO: JGM 전체 사진 보기(슬라이드 쇼) 기능을 위한 로직 추가
// - 현재 선택된 이미지 외에 모든 이미지를 볼 수 있는 UI/UX 구현
// - 이미지 전환 (이전/다음) 기능 구현
// - 키보드 탐색 (좌우 화살표 키) 지원 고려
// - 모달 내에서 이미지 확대/축소 기능 고려

/**
 * 갤러리 항목 편집 모달을 여는 함수입니다.
 * 새 항목을 추가하는 경우 기본값으로 초기화된 객체를, 기존 항목을 수정하는 경우 해당 항목을 `editingItem`으로 설정합니다.
 * @param {object|null} item - 편집할 갤러리 아이템 객체 (선택 사항).
 */
function openEditModal(item = null) {
  editingItem.value = item || { title: '', description: '', imageUrl: '', tags: [] }
  showEditModal.value = true
}

/**
 * 갤러리 항목 편집 모달을 닫는 함수입니다.
 * `editingItem`과 `showEditModal` 상태를 초기화합니다.
 */
function closeEditModal() {
  editingItem.value = null
  showEditModal.value = false
}

/**
 * 갤러리 아이템이 업데이트되었을 때 호출되는 함수입니다.
 * 기존 아이템을 찾아 업데이트하거나, 새 아이템인 경우 목록의 맨 앞에 추가합니다.
 * 선택된 아이템이 업데이트된 아이템과 동일하면 `selectedItem`도 업데이트합니다.
 * 편집 모달을 닫습니다.
 * @param {object} updatedItem - 업데이트된 갤러리 아이템 객체.
 */
async function updateItem(updatedItem) {
  const index = items.value.findIndex(function(item) { return item.id === updatedItem.id })
  if (index !== -1) {
    items.value[index] = updatedItem
  } else {
    items.value.unshift(updatedItem)
  }
  if (selectedItem.value && selectedItem.value.id === updatedItem.id) {
    selectedItem.value = updatedItem
  }
  closeEditModal()
}

/**
 * 갤러리 아이템이 삭제되었을 때 호출되는 함수입니다.
 * `deletedItemId`와 일치하는 아이템을 목록에서 제거하고, `selectedItem`을 초기화합니다.
 * @param {number} deletedItemId - 삭제된 갤러리 아이템의 ID.
 */
function deleteItem(deletedItemId) {
  items.value = items.value.filter(function(item) { return item.id !== deletedItemId })
  selectedItem.value = null
}

/**
 * 이전 갤러리 아이템을 표시하는 함수입니다.
 * 현재 선택된 아이템이 첫 번째가 아니라면 `filteredItems` 목록에서 이전 아이템을 찾아 `selectedItem`으로 설정합니다.
 */
function showPreviousItem() {
  if (!isFirstItem.value) {
    selectedItem.value = filteredItems.value[selectedItemIndex.value - 1]
  }
}

/**
 * 다음 갤러리 아이템을 표시하는 함수입니다.
 * 현재 선택된 아이템이 마지막이 아니라면 `filteredItems` 목록에서 다음 아이템을 찾아 `selectedItem`으로 설정합니다.
 */
function showNextItem() {
  if (!isLastItem.value) {
    selectedItem.value = filteredItems.value[selectedItemIndex.value + 1]
  }
}

// 외부에서 접근 가능한 메서드 노출
defineExpose({ fetchItems })
</script>

<style scoped>
.text-shadow {
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.aspect-square {
  aspect-ratio: 1 / 1;
}

/* 체크박스 커스텀 스타일 */
input:checked + div {
  @apply bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500;
}

input:checked + div svg {
  @apply opacity-100;
}

input:focus + div {
  @apply ring-2 ring-offset-2 ring-indigo-500 dark:ring-indigo-400 dark:ring-offset-gray-800;
}

/* 호버 효과 */
label:hover div {
  @apply border-indigo-500 dark:border-indigo-400;
}

.glass-card-effect {
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 반응형 Masonry 레이아웃 스타일 */
.masonry-layout {
  column-count: 1;
  column-gap: 1rem;
}

.masonry-item {
  display: inline-block;
  width: 100%;
}

/* 반응형 브레이크포인트에 따른 column 수 조정 */
@media (min-width: 640px) {
  .masonry-layout {
    column-count: 2;
  }
}

@media (min-width: 768px) {
  .masonry-layout {
    column-count: 2;
  }
}

@media (min-width: 1024px) {
  .masonry-layout {
    column-count: 3;
  }
}

@media (min-width: 1280px) {
  .masonry-layout {
    column-count: 4;
  }
}

@media (min-width: 1536px) {
  .masonry-layout {
    column-count: 4;
  }
}

@media (min-width: 1920px) {
  .masonry-layout {
    column-count: 5;
  }
}

@media (min-width: 2560px) {
  .masonry-layout {
    column-count: 6;
  }
}
</style>