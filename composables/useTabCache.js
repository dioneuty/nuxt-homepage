import { ref, shallowRef, markRaw } from 'vue'

export default function useTabCache() {
  // 탭별 컴포넌트 인스턴스 캐시
  const componentCache = ref(new Map())
  
  // 탭별 상태 캐시
  const stateCache = ref(new Map())
  
  // 탭별 스크롤 위치 캐시
  const scrollCache = ref(new Map())
  
  // 탭별 폼 데이터 캐시
  const formCache = ref(new Map())
  
  // 최대 캐시 개수 (메모리 관리)
  const MAX_CACHE_SIZE = 10
  
  // 캐시된 컴포넌트 저장
  const setCachedComponent = (tabId, component) => {
    // 최대 캐시 개수 초과 시 가장 오래된 항목 제거
    if (componentCache.value.size >= MAX_CACHE_SIZE) {
      const firstKey = componentCache.value.keys().next().value
      componentCache.value.delete(firstKey)
    }
    
    // 컴포넌트를 reactive하지 않게 저장
    componentCache.value.set(tabId, markRaw(component))
  }
  
  // 캐시된 컴포넌트 가져오기
  const getCachedComponent = (tabId) => {
    return componentCache.value.get(tabId)
  }
  
  // 컴포넌트 캐시 확인
  const hasCachedComponent = (tabId) => {
    return componentCache.value.has(tabId)
  }
  
  // 컴포넌트 캐시 제거
  const removeCachedComponent = (tabId) => {
    componentCache.value.delete(tabId)
    stateCache.value.delete(tabId)
    scrollCache.value.delete(tabId)
    formCache.value.delete(tabId)
  }
  
  // 상태 저장
  const saveState = (tabId, state) => {
    stateCache.value.set(tabId, { ...state, timestamp: Date.now() })
  }
  
  // 상태 복원
  const restoreState = (tabId) => {
    return stateCache.value.get(tabId)
  }
  
  // 스크롤 위치 저장
  const saveScrollPosition = (tabId, scrollData) => {
    scrollCache.value.set(tabId, {
      top: scrollData.scrollTop || 0,
      left: scrollData.scrollLeft || 0,
      timestamp: Date.now()
    })
  }
  
  // 스크롤 위치 복원
  const restoreScrollPosition = (tabId) => {
    return scrollCache.value.get(tabId) || { top: 0, left: 0 }
  }
  
  // 폼 데이터 저장
  const saveFormData = (tabId, formData) => {
    formCache.value.set(tabId, {
      data: { ...formData },
      timestamp: Date.now()
    })
  }
  
  // 폼 데이터 복원
  const restoreFormData = (tabId) => {
    const cached = formCache.value.get(tabId)
    return cached ? cached.data : null
  }
  
  // 탭 캐시 정보 가져오기
  const getTabCacheInfo = (tabId) => {
    return {
      hasComponent: hasCachedComponent(tabId),
      hasState: stateCache.value.has(tabId),
      hasScroll: scrollCache.value.has(tabId),
      hasForm: formCache.value.has(tabId),
      lastAccessed: Math.max(
        stateCache.value.get(tabId)?.timestamp || 0,
        scrollCache.value.get(tabId)?.timestamp || 0,
        formCache.value.get(tabId)?.timestamp || 0
      )
    }
  }
  
  // 모든 캐시 정리
  const clearAllCache = () => {
    componentCache.value.clear()
    stateCache.value.clear()
    scrollCache.value.clear()
    formCache.value.clear()
  }
  
  // 특정 시간보다 오래된 캐시 정리
  const cleanupOldCache = (maxAge = 30 * 60 * 1000) => { // 기본 30분
    const now = Date.now()
    
    // 상태 캐시 정리
    for (const [tabId, cache] of stateCache.value.entries()) {
      if (now - cache.timestamp > maxAge) {
        removeCachedComponent(tabId)
      }
    }
  }
  
  // 메모리 사용량 추정
  const getCacheStats = () => {
    return {
      componentCount: componentCache.value.size,
      stateCount: stateCache.value.size,
      scrollCount: scrollCache.value.size,
      formCount: formCache.value.size,
      totalItems: componentCache.value.size + stateCache.value.size + 
                 scrollCache.value.size + formCache.value.size
    }
  }
  
  // 탭 캐시 내보내기 (디버깅용)
  const exportCache = () => {
    return {
      components: Array.from(componentCache.value.keys()),
      states: Array.from(stateCache.value.entries()),
      scrolls: Array.from(scrollCache.value.entries()),
      forms: Array.from(formCache.value.entries())
    }
  }
  
  return {
    // 컴포넌트 캐시
    setCachedComponent,
    getCachedComponent,
    hasCachedComponent,
    removeCachedComponent,
    
    // 상태 관리
    saveState,
    restoreState,
    
    // 스크롤 관리
    saveScrollPosition,
    restoreScrollPosition,
    
    // 폼 데이터 관리
    saveFormData,
    restoreFormData,
    
    // 캐시 정보
    getTabCacheInfo,
    getCacheStats,
    
    // 정리 및 관리
    clearAllCache,
    cleanupOldCache,
    exportCache
  }
}