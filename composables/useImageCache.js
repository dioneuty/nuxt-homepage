// 이미지 캐싱 시스템 - 메모리 효율적 LRU 캐시
export function useImageCache() {
  const cache = new Map()
  const MAX_CACHE_SIZE = 30 // 최대 30개 이미지 캐시
  const CACHE_DURATION = 10 * 60 * 1000 // 10분 캐시 지속 시간
  
  /**
   * 캐시에서 이미지 데이터 조회
   * @param {string|number} id - 이미지 ID
   * @returns {string|null} 캐시된 이미지 데이터 또는 null
   */
  const getCachedImage = (id) => {
    const key = String(id)
    
    if (cache.has(key)) {
      const item = cache.get(key)
      
      // 만료 시간 체크
      if (Date.now() - item.timestamp > CACHE_DURATION) {
        cache.delete(key)
        return null
      }
      
      // LRU 업데이트 (최근 사용된 것으로 이동)
      cache.delete(key)
      cache.set(key, item)
      
      return item.data
    }
    
    return null
  }
  
  /**
   * 캐시에 이미지 데이터 저장
   * @param {string|number} id - 이미지 ID
   * @param {string} imageData - Base64 이미지 데이터
   */
  const setCachedImage = (id, imageData) => {
    const key = String(id)
    
    // 캐시 크기 관리 (LRU 방식)
    if (cache.size >= MAX_CACHE_SIZE) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }
    
    cache.set(key, {
      data: imageData,
      timestamp: Date.now()
    })
  }
  
  /**
   * 캐시에서 특정 이미지 제거
   * @param {string|number} id - 이미지 ID
   */
  const removeCachedImage = (id) => {
    const key = String(id)
    cache.delete(key)
  }
  
  /**
   * 전체 캐시 초기화
   */
  const clearCache = () => {
    cache.clear()
  }
  
  /**
   * 캐시 상태 정보 조회
   * @returns {object} 캐시 통계
   */
  const getCacheStats = () => {
    return {
      size: cache.size,
      maxSize: MAX_CACHE_SIZE,
      keys: Array.from(cache.keys())
    }
  }
  
  /**
   * 만료된 캐시 항목 정리
   */
  const cleanupExpiredCache = () => {
    const now = Date.now()
    for (const [key, item] of cache.entries()) {
      if (now - item.timestamp > CACHE_DURATION) {
        cache.delete(key)
      }
    }
  }
  
  // 5분마다 만료된 캐시 정리
  if (process.client) {
    setInterval(cleanupExpiredCache, 5 * 60 * 1000)
  }
  
  return {
    getCachedImage,
    setCachedImage,
    removeCachedImage,
    clearCache,
    getCacheStats,
    cleanupExpiredCache
  }
}