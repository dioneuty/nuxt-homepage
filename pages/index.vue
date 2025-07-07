<!-- 
  메인 홈페이지 컴포넌트
  - 다양한 섹션(슬라이드, 게시판, 갤러리, 날씨, 달력)을 선택적으로 표시
  - 사용자 선택에 따라 동적으로 컴포넌트 로딩
  - 로컬 스토리지에 사용자 선택 사항 저장
  - 지연 로딩을 통한 성능 최적화
-->
<template>
  <div class="container mx-auto px-2 md:px-4 py-4 md:py-8">
    <!-- 섹션 선택 UI -->
    <div class="glass-section mb-6 md:mb-8 p-4 md:p-6 rounded-lg">
      <h2 class="text-xl md:text-2xl font-bold mb-3 md:mb-4 dark:text-gray-200">섹션 선택</h2>
      <div class="flex flex-wrap gap-3 md:gap-4">
        <!-- 각 섹션에 대한 체크박스 -->
        <label v-for="section in sections" :key="section.id" class="inline-flex items-center cursor-pointer">
          <div class="relative">
            <!-- 숨겨진 체크박스 (접근성을 위해 유지) -->
            <input type="checkbox" v-model="selectedSections" :value="section.id" class="sr-only">
            <!-- 커스텀 체크박스 디자인 -->
            <div class="w-6 h-6 bg-white dark:bg-gray-700 border-2 border-gray-400 dark:border-gray-500 rounded-md transition-all duration-200 ease-in-out">
              <!-- 체크 표시 아이콘 -->
              <svg class="w-4 h-4 text-indigo-600 dark:text-indigo-400 opacity-0 transition-opacity duration-200 ease-in-out absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <span class="ml-2 text-sm md:text-base text-gray-700 dark:text-gray-300">{{ section.label }}</span>
        </label>
      </div>
    </div>

    <!-- 선택된 섹션들을 동적으로 렌더링 -->
    <template v-for="section in sections" :key="section.id">
      <template v-if="selectedSections.includes(section.id)">
        <!-- Suspense를 사용한 지연 로딩 -->
        <Suspense>
          <!-- 동적 컴포넌트 로딩 -->
          <component :is="getSectionComponent(section.id)" />
          <!-- 로딩 중 표시할 폴백 UI -->
          <template #fallback>
            <div class="flex justify-center items-center h-full py-8">
              <Icon icon="mdi:loading" class="animate-spin w-8 h-8 text-blue-500" />
              <p class="mt-2 text-gray-600 dark:text-gray-400">데이터를 불러오는 중...</p>
            </div>
          </template>
        </Suspense>
      </template>
    </template>

    <!-- 갤러리 모달 (전역 상태에 따라 표시) -->
    <GalleryModal
      v-if="galleryStore.selectedItem"
      :item="galleryStore.selectedItem"
      :apiEndpoint="apiEndpoint"
      @close="galleryStore.clearSelectedItem"
      @edit="openEditModal"
      @delete="deleteItem"
      @update="fetchItems"
    />
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent, onMounted, watch } from 'vue'
import { useGalleryStore } from '@/stores/galleryStore'
import { Icon } from '@iconify/vue'

// 갤러리 모달을 지연 로딩으로 import
const GalleryModal = defineAsyncComponent(() => import('@/components/gallery/GalleryModal.vue'))

// 사용 가능한 섹션 정의
const sections = [
  { id: 'carousel', label: '슬라이드 보기' },
  { id: 'posts', label: '게시판 보기' },
  { id: 'gallery', label: '갤러리 보기' },
  { id: 'weather', label: '일기예보' },
  { id: 'calendar', label: '달력' },
]

// 선택된 섹션들을 저장하는 반응형 상태
const selectedSections = ref([])

// 컴포넌트 마운트 시 로컬 스토리지에서 선택된 섹션 불러오기
onMounted(() => {
  const savedSections = localStorage.getItem('selectedSections')
  if (savedSections) {
    selectedSections.value = JSON.parse(savedSections)
  } else {
    selectedSections.value = ['carousel'] // 기본값: 슬라이드 보기만 선택
  }
})

// 선택된 섹션이 변경될 때마다 로컬 스토리지에 저장
watch(selectedSections, (newValue) => {
  localStorage.setItem('selectedSections', JSON.stringify(newValue))
}, { deep: true })

/**
 * 섹션 ID에 따라 해당하는 컴포넌트를 동적으로 반환
 * @param {string} sectionId - 섹션 식별자
 * @returns {Promise<Component>} 지연 로딩된 컴포넌트
 */
function getSectionComponent(sectionId) {
  switch (sectionId) {
    case 'carousel':
      return defineAsyncComponent(() => import('@/components/home/CarouselSection.vue'))
    case 'posts':
      return defineAsyncComponent(() => import('@/components/home/PostsSection.vue'))
    case 'gallery':
      return defineAsyncComponent(() => import('@/components/home/GallerySection.vue'))
    case 'weather':
      return defineAsyncComponent(() => import('@/components/home/WeatherSection.vue'))
    case 'calendar':
      return defineAsyncComponent(() => import('@/components/home/CalendarSection.vue'))
    default:
      return null
  }
}

// 갤러리 API 엔드포인트
const apiEndpoint = '/api/gallery'
// 갤러리 스토어 사용
const galleryStore = useGalleryStore()

// 페이지 메타데이터 정의 (SEO 최적화)
definePageMeta({
  title: 'Dion - 홈',
  meta: [
    { name: 'description', content: 'Dion의 메인 페이지입니다.' },
    { name: 'keywords', content: 'Dion, 홈, 메인' }
  ]
})
</script>

<style scoped>
/* 텍스트 그림자 효과 */
.text-shadow {
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

/* 정사각형 비율 유지 */
.aspect-square {
  aspect-ratio: 1 / 1;
}

/* 커스텀 체크박스 스타일 */
/* 체크된 상태의 배경색과 테두리 색상 */
input:checked + div {
  @apply bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500;
}

/* 체크된 상태의 체크 아이콘 표시 */
input:checked + div svg {
  @apply opacity-100;
}

/* 포커스 상태의 링 효과 */
input:focus + div {
  @apply ring-2 ring-offset-2 ring-indigo-500 dark:ring-indigo-400 dark:ring-offset-gray-800;
}

/* 호버 효과 */
label:hover div {
  @apply border-indigo-500 dark:border-indigo-400;
}

/* 글래스모피즘 섹션 스타일 */
.glass-section {
  /* 라이트 모드 - 어두운 유령 흰색 톤의 글래스 효과 */
  background: linear-gradient(135deg, rgba(70, 75, 80, 0.15), rgba(50, 55, 60, 0.15));
  backdrop-filter: blur(5px);
  border-radius: 15px;
  border: 1px solid rgba(70, 75, 80, 0.3);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 다크 모드에서의 글래스 효과 */
.dark .glass-section {
  background-color: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
