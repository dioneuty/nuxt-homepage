<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-4 dark:text-gray-200">섹션 선택</h2>
      <div class="flex flex-wrap gap-4">
        <label v-for="section in sections" :key="section.id" class="inline-flex items-center cursor-pointer">
          <div class="relative">
            <input type="checkbox" v-model="selectedSections" :value="section.id" class="sr-only">
            <div class="w-6 h-6 bg-white dark:bg-gray-700 border-2 border-gray-400 dark:border-gray-500 rounded-md transition-all duration-200 ease-in-out">
              <svg class="w-4 h-4 text-indigo-600 dark:text-indigo-400 opacity-0 transition-opacity duration-200 ease-in-out absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <span class="ml-2 text-gray-700 dark:text-gray-300">{{ section.label }}</span>
        </label>
      </div>
    </div>

    <template v-for="section in sections" :key="section.id">
      <template v-if="selectedSections.includes(section.id)">
        <Suspense>
          <component :is="getSectionComponent(section.id)" />
          <template #fallback>
            <div class="flex justify-center items-center h-full py-8">
              <Icon icon="mdi:loading" class="animate-spin w-8 h-8 text-blue-500" />
              <p class="mt-2 text-gray-600 dark:text-gray-400">데이터를 불러오는 중...</p>
            </div>
          </template>
        </Suspense>
      </template>
    </template>

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
import GalleryModal from '@/components/gallery/GalleryModal.vue'
import { useGalleryStore } from '@/stores/galleryStore'
import { Icon } from '@iconify/vue'

const sections = [
  { id: 'carousel', label: '슬라이드 보기' },
  { id: 'posts', label: '게시판 보기' },
  { id: 'gallery', label: '갤러리 보기' },
  { id: 'weather', label: '일기예보' },
  { id: 'calendar', label: '달력' },
]

const selectedSections = ref([])

// 로컬 스토리지에서 선택된 섹션 불러오기
onMounted(() => {
  const savedSections = localStorage.getItem('selectedSections')
  if (savedSections) {
    selectedSections.value = JSON.parse(savedSections)
  } else {
    selectedSections.value = ['carousel'] // 기본값 설정
  }
})

// 선택된 섹션이 변경될 때마다 로컬 스토리지에 저장
watch(selectedSections, (newValue) => {
  localStorage.setItem('selectedSections', JSON.stringify(newValue))
}, { deep: true })

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

const apiEndpoint = '/api/gallery'
const galleryStore = useGalleryStore()

// selectedGalleryItem ref와 closeGalleryModal 함수는 더 이상 필요하지 않습니다.

definePageMeta({
  title: 'Dion - 홈',
  meta: [
    { name: 'description', content: 'Dion의 메인 페이지입니다.' },
    { name: 'keywords', content: 'Dion, 홈, 메인' }
  ]
})
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
</style>
