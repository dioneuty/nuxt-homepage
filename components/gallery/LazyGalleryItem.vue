<template>
  <div 
    :data-item-id="item.id"
    class="masonry-item mb-4 break-inside-avoid"
    ref="itemRef"
  >
    <div 
      @click="$emit('click', item)" 
      class="glass-card-effect rounded-lg overflow-hidden relative cursor-pointer group hover:scale-[1.02] transition-transform duration-200"
    >
      <!-- 이미지 영역 -->
      <div class="w-full h-48 overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
        <!-- 로딩 플레이스홀더 -->
        <div 
          v-if="!isImageLoaded && !isImageLoading" 
          class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"
        >
          <div class="text-center">
            <Icon icon="mdi:image-outline" class="w-12 h-12 text-gray-400 dark:text-gray-500 mb-2" />
            <button 
              @click.stop="loadImage"
              class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-full transition-colors"
            >
              이미지 보기
            </button>
          </div>
        </div>
        
        <!-- 로딩 스피너 -->
        <div 
          v-else-if="isImageLoading" 
          class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"
        >
          <div class="text-center">
            <Icon icon="mdi:loading" class="animate-spin w-8 h-8 text-blue-500 mb-2" />
            <p class="text-sm text-gray-600 dark:text-gray-400">이미지 로딩 중...</p>
          </div>
        </div>
        
        <!-- 로드된 이미지 -->
        <div 
          v-else-if="isImageLoaded && imageData"
          v-html-img-one="imageData" 
          class="w-full h-full object-cover"
        ></div>
        
        <!-- 이미지 로드 실패 -->
        <div 
          v-else 
          class="w-full h-full flex items-center justify-center bg-red-100 dark:bg-red-900"
        >
          <div class="text-center">
            <Icon icon="mdi:image-broken" class="w-12 h-12 text-red-400 mb-2" />
            <p class="text-sm text-red-600 dark:text-red-400">이미지 로드 실패</p>
            <button 
              @click.stop="retryLoad"
              class="mt-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-full transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
        
        <!-- 호버 오버레이 -->
        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200"></div>
      </div>
      
      <!-- 컨텐츠 정보 영역 -->
      <div class="p-4">
        <!-- 제목 -->
        <h2 class="text-xl font-bold mb-2 dark:text-white flex items-center">
          <Icon icon="mdi:image" class="mr-2 flex-shrink-0" />
          <span class="truncate">{{ item.title }}</span>
        </h2>
        
        <!-- 설명 -->
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-4 flex items-start">
          <Icon icon="mdi:information-outline" class="mr-2 mt-0.5 flex-shrink-0" />
          <span class="line-clamp-2">{{ item.description }}</span>
        </p>
        
        <!-- 태그 목록 -->
        <div class="flex flex-wrap gap-2 mb-2">
          <span 
            v-for="tag in item.tags?.slice(0, 3)" 
            :key="tag" 
            class="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs flex items-center"
          >
            <Icon icon="mdi:tag" class="mr-1" />
            {{ tag }}
          </span>
          <span 
            v-if="item.tags?.length > 3"
            class="px-2 py-1 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full text-xs"
          >
            +{{ item.tags.length - 3 }}
          </span>
        </div>
        
        <!-- 생성일 -->
        <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center">
          <Icon icon="mdi:calendar" class="mr-1" />
          {{ formatDate(item.createdAt) }}
        </div>
      </div>
      
      <!-- 댓글 수 표시 뱃지 -->
      <div 
        v-if="showComments && (item._count?.comments || item.comments?.length)" 
        class="absolute bottom-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center shadow-lg"
      >
        <Icon icon="mdi:comment-outline" class="mr-1" />
        {{ item._count?.comments || item.comments?.length || 0 }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useLazyGallery } from '~/composables/useLazyGallery'

// Props
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  apiEndpoint: {
    type: String,
    default: '/api/gallery'
  },
  showComments: {
    type: Boolean,
    default: true
  },
  autoLoad: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['click', 'imageLoaded', 'imageFailed'])

// Lazy loading 기능
const { 
  loadImage: loadImageFromCache, 
  isImageLoaded: checkImageLoaded, 
  isImageLoading: checkImageLoading,
  getLoadedImage,
  createIntersectionObserver 
} = useLazyGallery()

// 반응형 상태
const itemRef = ref(null)
const imageData = ref(null)
const loadAttempts = ref(0)
const maxRetries = 3

// 계산된 속성
const isImageLoaded = computed(() => {
  return checkImageLoaded(props.item.id) || !!imageData.value
})

const isImageLoading = computed(() => {
  return checkImageLoading(props.item.id)
})

// 이미지 로드 함수
const loadImage = async () => {
  if (isImageLoaded.value || isImageLoading.value) return
  
  try {
    // 캐시에서 먼저 확인
    const cachedImage = getLoadedImage(props.item.id)
    if (cachedImage) {
      imageData.value = cachedImage
      emit('imageLoaded', props.item.id)
      return
    }
    
    // API에서 로드
    const result = await loadImageFromCache(props.item.id, props.apiEndpoint)
    if (result) {
      imageData.value = result
      emit('imageLoaded', props.item.id)
    } else {
      emit('imageFailed', props.item.id)
    }
  } catch (error) {
    console.error(`이미지 로드 실패 (ID: ${props.item.id}):`, error)
    emit('imageFailed', props.item.id)
  }
}

// 재시도 함수
const retryLoad = () => {
  if (loadAttempts.value < maxRetries) {
    loadAttempts.value++
    loadImage()
  }
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return '오늘'
  } else if (diffDays === 1) {
    return '어제'
  } else if (diffDays < 7) {
    return `${diffDays}일 전`
  } else {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
}

// Intersection Observer 설정
let observer = null

onMounted(() => {
  if (process.client && props.autoLoad) {
    observer = createIntersectionObserver(props.apiEndpoint)
    if (observer && itemRef.value) {
      observer.observe(itemRef.value)
    }
  }
  
  // 이미 로드된 이미지가 있으면 표시
  const cachedImage = getLoadedImage(props.item.id)
  if (cachedImage) {
    imageData.value = cachedImage
  }
})

onUnmounted(() => {
  if (observer && itemRef.value) {
    observer.unobserve(itemRef.value)
  }
})

// 외부에서 수동으로 이미지 로드 가능
defineExpose({
  loadImage,
  retryLoad,
  isImageLoaded,
  isImageLoading
})
</script>

<style scoped>
.glass-card-effect {
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 텍스트 줄임 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 호버 효과 개선 */
.group:hover .glass-card-effect {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* 로딩 애니메이션 */
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.skeleton-loader {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}
</style>