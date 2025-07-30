<template>
  <div 
    :data-item-id="item.id"
    class="masonry-item gallery-lazy-item"
    ref="itemRef"
  >
    <div 
      @click="$emit('click', item)" 
      class="gallery-lazy-card"
    >
      <!-- 이미지 영역 -->
      <div class="gallery-lazy-image-container">
        <!-- 로딩 플레이스홀더 -->
        <div 
          v-if="!isImageLoaded && !isImageLoading" 
          class="gallery-lazy-placeholder"
        >
          <div class="gallery-lazy-placeholder-content">
            <Icon icon="mdi:image-outline" class="gallery-lazy-placeholder-icon" />
            <button 
              @click.stop="loadImage"
              class="gallery-lazy-load-btn"
            >
              이미지 보기
            </button>
          </div>
        </div>
        
        <!-- 로딩 스피너 -->
        <div 
          v-else-if="isImageLoading" 
          class="gallery-lazy-loading"
        >
          <div class="gallery-lazy-loading-content">
            <Icon icon="mdi:loading" class="gallery-lazy-loading-icon" />
            <p class="gallery-lazy-loading-text">이미지 로딩 중...</p>
          </div>
        </div>
        
        <!-- 로드된 이미지 -->
        <div 
          v-else-if="isImageLoaded && imageData"
          v-html-img-one="imageData" 
          class="gallery-lazy-image"
        ></div>
        
        <!-- 이미지 로드 실패 -->
        <div 
          v-else 
          class="gallery-lazy-error"
        >
          <div class="gallery-lazy-error-content">
            <Icon icon="mdi:image-broken" class="gallery-lazy-error-icon" />
            <p class="gallery-lazy-error-text">이미지 로드 실패</p>
            <button 
              @click.stop="retryLoad"
              class="gallery-lazy-retry-btn"
            >
              다시 시도
            </button>
          </div>
        </div>
        
        <!-- 호버 오버레이 -->
        <div class="gallery-lazy-overlay"></div>
      </div>
      
      <!-- 컨텐츠 정보 영역 -->
      <div class="gallery-lazy-content">
        <!-- 제목 -->
        <h2 class="gallery-lazy-title">
          <Icon icon="mdi:image" class="gallery-lazy-title-icon" />
          <span class="gallery-lazy-title-text">{{ item.title }}</span>
        </h2>
        
        <!-- 설명 -->
        <p class="gallery-lazy-description">
          <Icon icon="mdi:information-outline" class="gallery-lazy-description-icon" />
          <span class="gallery-lazy-description-text">{{ item.description }}</span>
        </p>
        
        <!-- 태그 목록 -->
        <div class="gallery-lazy-tags">
          <span 
            v-for="tag in item.tags?.slice(0, 3)" 
            :key="tag" 
            class="gallery-lazy-tag"
          >
            <Icon icon="mdi:tag" class="gallery-lazy-tag-icon" />
            {{ tag }}
          </span>
          <span 
            v-if="item.tags?.length > 3"
            class="gallery-lazy-tag-more"
          >
            +{{ item.tags.length - 3 }}
          </span>
        </div>
        
        <!-- 생성일 -->
        <div class="gallery-lazy-date">
          <Icon icon="mdi:calendar" class="gallery-lazy-date-icon" />
          {{ formatDate(item.createdAt) }}
        </div>
      </div>
      
      <!-- 댓글 수 표시 뱃지 -->
      <div 
        v-if="showComments && (item._count?.comments || item.comments?.length)" 
        class="gallery-lazy-comment-badge"
      >
        <Icon icon="mdi:comment-outline" class="gallery-lazy-comment-icon" />
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