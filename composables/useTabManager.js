import { ref, computed, watch } from 'vue'

export default function useTabManager() {
  // 탭 목록
  const tabs = ref([])
  
  // 현재 활성 탭 ID
  const activeTabId = ref(null)
  
  // 다음 탭 ID를 위한 카운터
  const nextTabId = ref(1)
  
  // localStorage 키
  const STORAGE_KEY = 'tabManager'
  
  // 로컬 스토리지에서 데이터 로드
  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        tabs.value = data.tabs || []
        activeTabId.value = data.activeTabId || null
        nextTabId.value = data.nextTabId || 1
        
        // 활성 탭이 존재하지 않으면 첫 번째 탭으로 설정
        if (tabs.value.length > 0 && !tabs.value.find(tab => tab.id === activeTabId.value)) {
          activeTabId.value = tabs.value[0].id
        }
      }
    } catch (error) {
      console.error('탭 데이터 로드 실패:', error)
    }
  }
  
  // 로컬 스토리지에 데이터 저장
  const saveToStorage = () => {
    try {
      const data = {
        tabs: tabs.value,
        activeTabId: activeTabId.value,
        nextTabId: nextTabId.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('탭 데이터 저장 실패:', error)
    }
  }
  
  // 현재 활성 탭
  const activeTab = computed(() => {
    return tabs.value.find(tab => tab.id === activeTabId.value) || null
  })
  
  // 새 탭 추가
  const addTab = (title = '새 탭', content = '', type = 'default') => {
    const newTab = {
      id: nextTabId.value++,
      title,
      content,
      type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    tabs.value.push(newTab)
    activeTabId.value = newTab.id
    saveToStorage()
    
    return newTab
  }
  
  // 탭 제거
  const removeTab = (tabId) => {
    const tabIndex = tabs.value.findIndex(tab => tab.id === tabId)
    if (tabIndex === -1) return
    
    tabs.value.splice(tabIndex, 1)
    
    // 제거된 탭이 활성 탭이었다면 다른 탭으로 전환
    if (activeTabId.value === tabId) {
      if (tabs.value.length > 0) {
        // 가능하면 다음 탭으로, 없으면 이전 탭으로
        const newActiveIndex = tabIndex < tabs.value.length ? tabIndex : tabIndex - 1
        activeTabId.value = tabs.value[newActiveIndex]?.id || null
      } else {
        activeTabId.value = null
      }
    }
    
    saveToStorage()
  }
  
  // 탭 전환
  const switchTab = (tabId) => {
    if (tabs.value.find(tab => tab.id === tabId)) {
      activeTabId.value = tabId
      saveToStorage()
    }
  }
  
  // 탭 업데이트
  const updateTab = (tabId, updates) => {
    const tab = tabs.value.find(tab => tab.id === tabId)
    if (tab) {
      Object.assign(tab, updates, { updatedAt: new Date().toISOString() })
      saveToStorage()
    }
  }
  
  // 탭 제목 업데이트
  const updateTabTitle = (tabId, title) => {
    updateTab(tabId, { title })
  }
  
  // 탭 내용 업데이트
  const updateTabContent = (tabId, content) => {
    updateTab(tabId, { content })
  }
  
  // 모든 탭 닫기
  const closeAllTabs = () => {
    tabs.value = []
    activeTabId.value = null
    saveToStorage()
  }
  
  // 다른 탭들 닫기 (현재 탭 제외)
  const closeOtherTabs = (keepTabId) => {
    tabs.value = tabs.value.filter(tab => tab.id === keepTabId)
    activeTabId.value = keepTabId
    saveToStorage()
  }
  
  // 탭 순서 변경
  const reorderTabs = (oldIndex, newIndex) => {
    const movedTab = tabs.value.splice(oldIndex, 1)[0]
    tabs.value.splice(newIndex, 0, movedTab)
    saveToStorage()
  }
  
  // 탭 복제
  const duplicateTab = (tabId) => {
    const originalTab = tabs.value.find(tab => tab.id === tabId)
    if (originalTab) {
      const duplicatedTab = {
        ...originalTab,
        id: nextTabId.value++,
        title: `${originalTab.title} (복사)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      tabs.value.push(duplicatedTab)
      activeTabId.value = duplicatedTab.id
      saveToStorage()
      
      return duplicatedTab
    }
  }
  
  // 저장 감시
  watch([tabs, activeTabId], () => {
    saveToStorage()
  }, { deep: true })
  
  // 초기화
  const initialize = () => {
    loadFromStorage()
    
    // 탭이 없으면 기본 탭 생성
    if (tabs.value.length === 0) {
      addTab('홈', '', 'home')
    }
  }
  
  return {
    // 상태
    tabs,
    activeTabId,
    activeTab,
    
    // 메서드
    addTab,
    removeTab,
    switchTab,
    updateTab,
    updateTabTitle,
    updateTabContent,
    closeAllTabs,
    closeOtherTabs,
    reorderTabs,
    duplicateTab,
    initialize,
    
    // 유틸리티
    loadFromStorage,
    saveToStorage
  }
}