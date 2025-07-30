<template>
  <div v-if="showMonitor" class="gallery-perf-monitor">
    <div class="gallery-perf-header">
      <h3 class="gallery-perf-title">갤러리 성능 모니터</h3>
      <button @click="toggleMonitor" class="gallery-perf-close-btn">
        <Icon icon="mdi:close" />
      </button>
    </div>
    
    <!-- 로딩 통계 -->
    <div class="gallery-perf-section">
      <div class="gallery-perf-row">
        <span>로드 완료:</span>
        <span class="gallery-perf-value-green">{{ stats.loadedCount }}개</span>
      </div>
      <div class="gallery-perf-row">
        <span>로딩 중:</span>
        <span class="gallery-perf-value-blue">{{ stats.loadingCount }}개</span>
      </div>
      <div class="gallery-perf-row">
        <span>화면 표시:</span>
        <span class="gallery-perf-value-yellow">{{ stats.visibleCount }}개</span>
      </div>
      <div class="gallery-perf-row">
        <span>대기열:</span>
        <span class="gallery-perf-value-orange">{{ stats.queueLength }}개</span>
      </div>
    </div>

    <!-- 성능 지표 -->
    <div class="gallery-perf-divider">
      <div class="gallery-perf-section">
        <div class="gallery-perf-row">
          <span>평균 로딩 시간:</span>
          <span class="gallery-perf-value-blue-light">{{ averageLoadTime }}ms</span>
        </div>
        <div class="gallery-perf-row">
          <span>캐시 히트율:</span>
          <span class="gallery-perf-value-green-light">{{ cacheHitRate }}%</span>
        </div>
        <div class="gallery-perf-row">
          <span>압축률:</span>
          <span class="gallery-perf-value-purple">{{ compressionRatio }}%</span>
        </div>
      </div>
    </div>

    <!-- 메모리 사용량 -->
    <div class="gallery-perf-divider">
      <div class="gallery-perf-section">
        <div class="gallery-perf-row">
          <span>캐시 크기:</span>
          <span class="gallery-perf-value-indigo">{{ cacheStats.size }}/{{ cacheStats.maxSize }}</span>
        </div>
        <div class="gallery-perf-row">
          <span>총 처리량:</span>
          <span class="gallery-perf-value-cyan">{{ formatFileSize(totalDataProcessed) }}</span>
        </div>
      </div>
    </div>

    <!-- 실시간 그래프 (간단한 막대) -->
    <div class="gallery-perf-divider">
      <div class="gallery-perf-graph-title">로딩 속도 (최근 10초)</div>
      <div class="gallery-perf-graph">
        <div 
          v-for="(value, index) in performanceHistory" 
          :key="index"
          class="gallery-perf-graph-bar"
          :style="{ height: `${Math.max(value * 100, 2)}%` }"
          :title="`${value.toFixed(2)}개/초`"
        ></div>
      </div>
    </div>

    <!-- 토글 버튼 -->
    <div class="gallery-perf-actions">
      <button 
        @click="resetStats" 
        class="gallery-perf-reset-btn"
      >
        통계 초기화
      </button>
    </div>
  </div>

  <!-- 플로팅 토글 버튼 -->
  <button 
    v-else
    @click="toggleMonitor" 
    class="gallery-perf-toggle-btn"
    title="성능 모니터 열기"
  >
    <Icon icon="mdi:speedometer" class="gallery-perf-toggle-icon" />
  </button>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useLazyGallery } from '~/composables/useLazyGallery'
import { useImageCache } from '~/composables/useImageCache'
import { useImageOptimizer } from '~/composables/useImageOptimizer'

// Props
const props = defineProps({
  autoShow: {
    type: Boolean,
    default: false
  }
})

// 상태 관리
const showMonitor = ref(props.autoShow)
const performanceHistory = ref(Array(20).fill(0))
const loadTimes = ref([])
const cacheHits = ref(0)
const totalRequests = ref(0)
const totalDataProcessed = ref(0)

// Composables
const { getStats } = useLazyGallery()
const { getCacheStats } = useImageCache()
const { compressionStats, formatFileSize } = useImageOptimizer()

// 계산된 속성
const stats = computed(() => getStats.value)
const cacheStats = computed(() => getCacheStats())

const averageLoadTime = computed(() => {
  if (loadTimes.value.length === 0) return 0
  const avg = loadTimes.value.reduce((sum, time) => sum + time, 0) / loadTimes.value.length
  return Math.round(avg)
})

const cacheHitRate = computed(() => {
  if (totalRequests.value === 0) return 0
  return ((cacheHits.value / totalRequests.value) * 100).toFixed(1)
})

const compressionRatio = computed(() => {
  return compressionStats.value.compressionRatio || 0
})

// 메서드
const toggleMonitor = () => {
  showMonitor.value = !showMonitor.value
}

const resetStats = () => {
  loadTimes.value = []
  cacheHits.value = 0
  totalRequests.value = 0
  totalDataProcessed.value = 0
  performanceHistory.value = Array(20).fill(0)
}

const addLoadTime = (time) => {
  loadTimes.value.push(time)
  if (loadTimes.value.length > 50) {
    loadTimes.value = loadTimes.value.slice(-50)
  }
}

const recordCacheHit = () => {
  cacheHits.value++
  totalRequests.value++
}

const recordCacheMiss = () => {
  totalRequests.value++
}

const updatePerformanceHistory = () => {
  const currentLoadRate = stats.value.loadedCount > 0 ? 
    stats.value.loadedCount / Math.max(Date.now() - startTime, 1) * 1000 : 0
  
  performanceHistory.value.shift()
  performanceHistory.value.push(Math.min(currentLoadRate, 1))
}

// 시작 시간 추적
let startTime = Date.now()
let performanceInterval = null

// 라이프사이클
onMounted(() => {
  startTime = Date.now()
  
  // 1초마다 성능 히스토리 업데이트
  performanceInterval = setInterval(updatePerformanceHistory, 1000)
  
  // 개발 모드에서 자동으로 모니터 표시
  if (process.dev) {
    showMonitor.value = true
  }
})

onUnmounted(() => {
  if (performanceInterval) {
    clearInterval(performanceInterval)
  }
})

// 통계 변화 감지
watch(() => stats.value.loadedCount, (newCount, oldCount) => {
  if (newCount > oldCount) {
    // 새로운 이미지 로드 완료
    const loadTime = Date.now() - startTime
    addLoadTime(loadTime)
    totalDataProcessed.value += 1024 * 500 // 평균 이미지 크기 추정
  }
})

// 외부에서 접근 가능한 메서드
defineExpose({
  toggleMonitor,
  resetStats,
  recordCacheHit,
  recordCacheMiss,
  addLoadTime
})
</script>

<style scoped>
/* 애니메이션 효과 */
.fixed {
  transition: all 0.3s ease-in-out;
}

/* 스크롤바 스타일링 */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}
</style>