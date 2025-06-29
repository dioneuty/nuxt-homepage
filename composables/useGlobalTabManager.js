import { ref } from 'vue'
import { useRouter } from 'vue-router'

// 전역 탭 관리자 인스턴스
let globalTabManager = null

export default function useGlobalTabManager() {
  const router = useRouter()
  
  // 전역 탭 관리자가 없으면 생성
  if (!globalTabManager) {
    globalTabManager = {
      // 탭 관리자 인스턴스 참조
      tabManagerInstance: ref(null),
      
      // 탭 관리자 인스턴스 설정
      setTabManager: (instance) => {
        globalTabManager.tabManagerInstance.value = instance
      },
      
      // 새 탭으로 페이지 열기
      openInTab: (path, title, type = 'page') => {
        // 모바일에서는 탭 기능 비활성화
        if (window.innerWidth < 768) {
          router.push(path)
          return false
        }
        
        // 탭 관리자가 설정되어 있는 경우
        if (globalTabManager.tabManagerInstance.value) {
          const tabManager = globalTabManager.tabManagerInstance.value
          
          // 이미 열린 탭이 있는지 확인
          const existingTab = tabManager.tabs.find(tab => tab.path === path)
          if (existingTab) {
            // 기존 탭으로 전환하고 해당 페이지로 네비게이션
            tabManager.switchTab(existingTab.id)
            if (router.currentRoute.value.path !== path) {
              router.push(path)
            }
            return true
          }
          
          // 새 탭 생성
          const newTab = tabManager.addTab(title || path, '', type)
          // 탭에 경로 정보 저장
          tabManager.updateTab(newTab.id, { path, type })
          // 해당 페이지로 네비게이션
          router.push(path)
          return true
        }
        
        // 탭 관리자가 없는 경우 일반 네비게이션
        router.push(path)
        return false
      },
      
      // 현재 탭 페이지에 있는지 확인
      isInTabMode: () => {
        return router.currentRoute.value.path === '/tabs' && globalTabManager.tabManagerInstance.value
      }
    }
  }
  
  return globalTabManager
}