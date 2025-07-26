import { ref, computed, nextTick } from 'vue'
import { useImageCache } from './useImageCache'

/**
 * 갤러리 지연 로딩 및 가상화를 위한 composable
 * Base64 이미지 유지하면서 성능 최적화
 */
export function useLazyGallery() {
  const { getCachedImage, setCachedImage } = useImageCache()
  
  // 상태 관리
  const loadedImages = ref(new Map()) // 로드된 이미지들
  const loadingImages = ref(new Set()) // 로딩 중인 이미지들
  const visibleItems = ref(new Set()) // 화면에 보이는 아이템들
  const loadQueue = ref([]) // 로딩 대기열
  const isProcessingQueue = ref(false)
  
  // 성능 설정
  const ITEMS_PER_BATCH = 6 // 배치당 로드할 이미지 수
  const LOAD_DELAY = 100 // 로딩 지연 시간 (ms)
  const INTERSECTION_THRESHOLD = 0.1 // Intersection Observer 임계값
  
  /**
   * 개별 이미지 로드
   * @param {number} itemId - 아이템 ID
   * @param {string} apiEndpoint - API 엔드포인트
   */
  const loadImage = async (itemId, apiEndpoint = '/api/gallery') => {
    // 이미 로드되었거나 로딩 중이면 스킵
    if (loadedImages.value.has(itemId) || loadingImages.value.has(itemId)) {
      return loadedImages.value.get(itemId)
    }
    
    // 캐시에서 확인
    const cachedImage = getCachedImage(itemId)
    if (cachedImage) {
      loadedImages.value.set(itemId, cachedImage)
      return cachedImage
    }
    
    try {
      loadingImages.value.add(itemId)
      
      // 개별 이미지 API 호출
      const response = await $fetch(`${apiEndpoint}`, {
        query: { 
          id: itemId,
          imageOnly: true // 이미지만 요청하는 플래그
        }
      })
      
      const imageData = response.content
      
      // 캐시에 저장
      setCachedImage(itemId, imageData)
      loadedImages.value.set(itemId, imageData)
      
      return imageData
    } catch (error) {
      console.error(`이미지 로드 실패 (ID: ${itemId}):`, error)
      return null
    } finally {
      loadingImages.value.delete(itemId)
    }
  }
  
  /**
   * 배치 이미지 로드 (성능 최적화)
   */
  const processBatchLoad = async (apiEndpoint) => {
    if (isProcessingQueue.value || loadQueue.value.length === 0) return
    
    isProcessingQueue.value = true
    
    try {
      // 배치에서 처리할 아이템들 선택
      const batch = loadQueue.value.splice(0, ITEMS_PER_BATCH)
      
      // 병렬로 이미지 로드 (하지만 동시 요청 수 제한)
      const promises = batch.map((itemId, index) => 
        new Promise(resolve => {
          setTimeout(async () => {
            const result = await loadImage(itemId, apiEndpoint)
            resolve({ itemId, result })
          }, index * LOAD_DELAY)
        })
      )
      
      await Promise.all(promises)
      
      // 큐에 더 있으면 다음 배치 처리
      if (loadQueue.value.length > 0) {
        await nextTick()
        processBatchLoad(apiEndpoint)
      }
    } finally {
      isProcessingQueue.value = false
    }
  }
  
  /**
   * 이미지 로드를 큐에 추가
   * @param {number} itemId - 아이템 ID
   * @param {string} apiEndpoint - API 엔드포인트
   */
  const queueImageLoad = (itemId, apiEndpoint = '/api/gallery') => {
    if (!loadQueue.value.includes(itemId) && 
        !loadedImages.value.has(itemId) && 
        !loadingImages.value.has(itemId)) {
      loadQueue.value.push(itemId)
      
      // 배치 처리 시작
      if (!isProcessingQueue.value) {
        processBatchLoad(apiEndpoint)
      }
    }
  }
  
  /**
   * Intersection Observer 설정
   * @param {string} apiEndpoint - API 엔드포인트
   */
  const createIntersectionObserver = (apiEndpoint = '/api/gallery') => {
    if (!process.client) return null
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const itemId = parseInt(entry.target.dataset.itemId)
          
          if (entry.isIntersecting) {
            visibleItems.value.add(itemId)
            // 화면에 들어오면 로딩 큐에 추가
            queueImageLoad(itemId, apiEndpoint)
          } else {
            visibleItems.value.delete(itemId)
          }
        })
      },
      {
        threshold: INTERSECTION_THRESHOLD,
        rootMargin: '50px' // 50px 앞서 로딩 시작
      }
    )
    
    return observer
  }
  
  /**
   * 즉시 로드할 아이템들 (초기 화면)
   * @param {Array} items - 갤러리 아이템 배열
   * @param {string} apiEndpoint - API 엔드포인트
   * @param {number} count - 즉시 로드할 개수
   */
  const loadInitialImages = async (items, apiEndpoint = '/api/gallery', count = 6) => {
    const initialItems = items.slice(0, count)
    
    for (const item of initialItems) {
      queueImageLoad(item.id, apiEndpoint)
    }
  }
  
  /**
   * 이미지가 로드되었는지 확인
   * @param {number} itemId - 아이템 ID
   * @returns {boolean}
   */
  const isImageLoaded = (itemId) => {
    return loadedImages.value.has(itemId)
  }
  
  /**
   * 이미지가 로딩 중인지 확인
   * @param {number} itemId - 아이템 ID
   * @returns {boolean}
   */
  const isImageLoading = (itemId) => {
    return loadingImages.value.has(itemId)
  }
  
  /**
   * 로드된 이미지 데이터 가져오기
   * @param {number} itemId - 아이템 ID
   * @returns {string|null}
   */
  const getLoadedImage = (itemId) => {
    return loadedImages.value.get(itemId) || null
  }
  
  /**
   * 아이템이 화면에 보이는지 확인
   * @param {number} itemId - 아이템 ID
   * @returns {boolean}
   */
  const isItemVisible = (itemId) => {
    return visibleItems.value.has(itemId)
  }
  
  /**
   * 상태 초기화
   */
  const resetState = () => {
    loadedImages.value.clear()
    loadingImages.value.clear()
    visibleItems.value.clear()
    loadQueue.value = []
    isProcessingQueue.value = false
  }
  
  /**
   * 성능 통계
   */
  const getStats = computed(() => ({
    loadedCount: loadedImages.value.size,
    loadingCount: loadingImages.value.size,
    visibleCount: visibleItems.value.size,
    queueLength: loadQueue.value.length,
    isProcessing: isProcessingQueue.value
  }))
  
  return {
    // 상태
    loadedImages: readonly(loadedImages),
    loadingImages: readonly(loadingImages),
    visibleItems: readonly(visibleItems),
    
    // 메서드
    loadImage,
    queueImageLoad,
    createIntersectionObserver,
    loadInitialImages,
    
    // 체크 함수
    isImageLoaded,
    isImageLoading,
    getLoadedImage,
    isItemVisible,
    
    // 유틸리티
    resetState,
    getStats
  }
}