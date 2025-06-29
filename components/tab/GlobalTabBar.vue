<template>
  <div class="global-tab-bar bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm hidden md:block">
    <!-- 탭 헤더 -->
    <div class="tab-header flex items-center overflow-x-auto">
      <!-- 탭 목록 -->
      <div class="flex items-center min-w-0 flex-1">
        <draggable
          v-model="tabs"
          item-key="id"
          @change="handleTabReorder"
          :animation="200"
          class="flex items-center"
          ghost-class="tab-ghost"
        >
          <template #item="{ element }">
            <div
              :class="[
                'tab-item flex items-center min-w-0 max-w-xs cursor-pointer border-r border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                { 'bg-blue-50 dark:bg-blue-900 border-b-2 border-blue-500': element.id === activeTabId }
              ]"
              @click="switchTab(element.id)"
              @contextmenu.prevent="showTabContextMenu(element.id, $event)"
            >
              <div class="flex items-center px-3 py-2 min-w-0 flex-1">
                <!-- 탭 아이콘 -->
                <Icon
                  :icon="getTabIcon(element.type)"
                  :class="[
                    'w-4 h-4 mr-2 flex-shrink-0',
                    element.isCached 
                      ? 'text-green-500 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  ]"
                />
                
                <!-- 탭 제목 -->
                <span
                  v-if="!element.isEditing"
                  :class="[
                    'text-sm truncate',
                    element.id === activeTabId 
                      ? 'text-blue-700 dark:text-blue-300 font-medium' 
                      : 'text-gray-600 dark:text-gray-300'
                  ]"
                  @dblclick="startEditingTitle(element.id)"
                  :title="element.title"
                >
                  {{ element.title }}
                </span>
                
                <!-- 탭 제목 편집 -->
                <input
                  v-else
                  v-model="element.title"
                  class="text-sm bg-transparent border-none outline-none min-w-0 flex-1"
                  @blur="stopEditingTitle(element.id)"
                  @keydown.enter="stopEditingTitle(element.id)"
                  @keydown.escape="cancelEditingTitle(element.id)"
                  :ref="el => { if (el) titleInputRefs[element.id] = el }"
                />
              </div>
              
              <!-- 탭 닫기 버튼 -->
              <button
                v-if="tabs.length > 1"
                @click.stop="removeTab(element.id)"
                class="flex-shrink-0 p-1 mr-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                :title="'탭 닫기: ' + element.title"
              >
                <Icon icon="mdi:close" class="w-3 h-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
              </button>
            </div>
          </template>
        </draggable>
      </div>
      
      <!-- 탭 컨트롤 버튼들 -->
      <div class="flex items-center space-x-1 px-2">
        <!-- 새 탭 추가 버튼 -->
        <button
          @click="addNewTab"
          class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          title="새 탭 추가 (Ctrl+T)"
        >
          <Icon icon="mdi:plus" class="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
        
        <!-- 탭 메뉴 -->
        <div class="relative">
          <button
            @click="showTabMenu = !showTabMenu"
            class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="탭 메뉴"
          >
            <Icon icon="mdi:menu" class="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          
          <!-- 탭 메뉴 드롭다운 -->
          <div
            v-if="showTabMenu"
            class="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
          >
            <button
              @click="closeOtherTabs(activeTabId); showTabMenu = false"
              class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              다른 탭 모두 닫기
            </button>
            <button
              @click="closeAllTabs(); showTabMenu = false"
              class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              모든 탭 닫기
            </button>
            <button
              v-if="activeTab"
              @click="duplicateTab(activeTabId); showTabMenu = false"
              class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              현재 탭 복제
            </button>
            <hr class="border-gray-200 dark:border-gray-600" />
            <button
              @click="cleanupDuplicateTabs(); showTabMenu = false"
              class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              중복 탭 정리
            </button>
            <button
              @click="clearTabCache(); showTabMenu = false"
              class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              캐시 정리
            </button>
            <button
              @click="navigateToTabManager(); showTabMenu = false"
              class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              탭 관리자 열기
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 컨텍스트 메뉴 -->
    <div
      v-if="contextMenu.show"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      class="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1"
    >
      <button
        @click="duplicateTab(contextMenu.tabId); hideContextMenu()"
        class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
      >
        탭 복제
      </button>
      <button
        v-if="tabs.length > 1"
        @click="removeTab(contextMenu.tabId); hideContextMenu()"
        class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm text-red-600"
      >
        탭 닫기
      </button>
      <button
        @click="closeOtherTabs(contextMenu.tabId); hideContextMenu()"
        class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
      >
        다른 탭 모두 닫기
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter, useRoute } from 'vue-router'
import draggable from 'vuedraggable'
import useTabManager from '~/composables/useTabManager.js'
import useGlobalTabManager from '~/composables/useGlobalTabManager.js'
import useTabCache from '~/composables/useTabCache.js'

// 라우터
const router = useRouter()
const route = useRoute()

// 탭 관리자 사용
const {
  tabs,
  activeTabId,
  activeTab,
  addTab,
  removeTab,
  switchTab: originalSwitchTab,
  updateTabContent,
  closeAllTabs,
  closeOtherTabs,
  duplicateTab,
  reorderTabs,
  initialize
} = useTabManager()

// 전역 탭 관리자
const globalTabManager = useGlobalTabManager()

// 탭 캐시 관리자
const { clearAllCache, cleanupOldCache, getCacheStats } = useTabCache()

// 로컬 상태
const showTabMenu = ref(false)
const titleInputRefs = ref({})
const originalTitles = ref({})

// 컨텍스트 메뉴
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  tabId: null
})

// 탭 아이콘 매핑
const getTabIcon = (type) => {
  const iconMap = {
    home: 'mdi:home',
    outliner: 'mdi:format-list-bulleted-triangle',
    editor: 'mdi:file-document-edit',
    browser: 'mdi:web',
    terminal: 'mdi:terminal',
    page: 'mdi:file-document',
    admin: 'mdi:cog',
    default: 'mdi:file-document'
  }
  return iconMap[type] || iconMap.default
}

// 새 탭 추가
const addNewTab = () => {
  // 이미 "새 탭"이 있는지 확인
  const existingNewTab = tabs.value.find(tab => 
    tab.title === '새 탭' && !tab.path
  )
  
  if (existingNewTab) {
    // 기존 새 탭으로 전환
    switchTab(existingNewTab.id)
  } else {
    // 새 탭 생성
    const newTab = addTab('새 탭', '', 'default')
    switchTab(newTab.id)
  }
}

// 탭 순서 변경 처리
const handleTabReorder = (evt) => {
  if (evt.moved) {
    reorderTabs(evt.moved.oldIndex, evt.moved.newIndex)
  }
}

// 탭 제목 편집 시작
const startEditingTitle = (tabId) => {
  const tab = tabs.value.find(t => t.id === tabId)
  if (tab) {
    originalTitles.value[tabId] = tab.title
    tab.isEditing = true
    
    nextTick(() => {
      const input = titleInputRefs.value[tabId]
      if (input) {
        input.focus()
        input.select()
      }
    })
  }
}

// 탭 제목 편집 완료
const stopEditingTitle = (tabId) => {
  const tab = tabs.value.find(t => t.id === tabId)
  if (tab) {
    tab.isEditing = false
    if (tab.title.trim() === '') {
      tab.title = originalTitles.value[tabId] || '제목 없음'
    }
    delete originalTitles.value[tabId]
  }
}

// 탭 제목 편집 취소
const cancelEditingTitle = (tabId) => {
  const tab = tabs.value.find(t => t.id === tabId)
  if (tab) {
    tab.title = originalTitles.value[tabId] || tab.title
    tab.isEditing = false
    delete originalTitles.value[tabId]
  }
}

// 컨텍스트 메뉴 표시
const showTabContextMenu = (tabId, event) => {
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    tabId
  }
}

// 컨텍스트 메뉴 숨기기
const hideContextMenu = () => {
  contextMenu.value.show = false
}

// 중복 탭 정리
const cleanupDuplicateTabs = () => {
  const uniqueTabs = []
  const tabsToRemove = []
  
  // 경로별로 중복 확인
  const pathMap = new Map()
  
  tabs.value.forEach(tab => {
    if (tab.path) {
      if (pathMap.has(tab.path)) {
        // 중복된 경로 - 기존 탭 삭제 대상에 추가
        tabsToRemove.push(tab.id)
      } else {
        pathMap.set(tab.path, tab)
        uniqueTabs.push(tab)
      }
    } else {
      // 경로가 없는 탭들 중 "새 탭"이 여러 개 있으면 하나만 남기기
      if (tab.title === '새 탭') {
        const existingNewTab = uniqueTabs.find(t => t.title === '새 탭' && !t.path)
        if (existingNewTab) {
          tabsToRemove.push(tab.id)
        } else {
          uniqueTabs.push(tab)
        }
      } else {
        uniqueTabs.push(tab)
      }
    }
  })
  
  // 중복 탭들 제거
  tabsToRemove.forEach(tabId => {
    removeTab(tabId)
  })
  
  console.log(`${tabsToRemove.length}개의 중복 탭을 정리했습니다.`)
}

// 캐시 정리
const clearTabCache = () => {
  // 모든 탭의 캐시 플래그 제거
  tabs.value.forEach(tab => {
    tab.isCached = false
  })
  
  // 캐시 데이터 정리
  clearAllCache()
  
  console.log('탭 캐시가 정리되었습니다.')
}

// 탭 관리자 페이지로 이동
const navigateToTabManager = () => {
  router.push('/tabs')
}

// 탭 전환 시 라우터 네비게이션
const navigateToTab = (tab) => {
  if (tab.path && tab.path !== route.path) {
    router.push(tab.path)
  }
}

// 탭 전환 (라우터 네비게이션 포함)
const switchTab = (tabId) => {
  const tab = tabs.value.find(t => t.id === tabId)
  
  // 캐시된 탭인 경우 라우터 네비게이션 없이 전환
  if (tab && tab.path && tab.isCached) {
    originalSwitchTab(tabId)
    return
  }
  
  // 캐시되지 않은 탭인 경우 라우터 네비게이션
  if (tab && tab.path) {
    navigateToTab(tab)
  }
  originalSwitchTab(tabId)
}

// 모바일 감지
const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768 // md breakpoint
}

// 탭 전환 시 현재 페이지와 동기화
const syncWithCurrentPage = () => {
  const currentPath = route.path
  
  // 모바일에서는 탭 동기화 하지 않음
  if (isMobile.value) {
    return
  }
  
  // 탭 페이지 자체는 제외
  if (currentPath === '/tabs') {
    return
  }
  
  // 현재 경로에 해당하는 탭이 있는지 확인
  const existingTab = tabs.value.find(tab => tab.path === currentPath)
  
  if (existingTab) {
    // 이미 있는 탭으로 전환 (라우터 네비게이션 없이)
    if (activeTabId.value !== existingTab.id) {
      originalSwitchTab(existingTab.id)
    }
    // 탭 제목이 페이지와 다르면 업데이트
    const pageTitle = getPageTitle(currentPath)
    if (existingTab.title !== pageTitle && existingTab.title.includes('새 탭')) {
      existingTab.title = pageTitle
    }
  } else {
    // 활성 탭이 경로 정보가 없는 "새 탭"인 경우 해당 탭을 현재 페이지로 업데이트
    const activeTabData = tabs.value.find(tab => tab.id === activeTabId.value)
    if (activeTabData && !activeTabData.path && (activeTabData.title === '새 탭' || activeTabData.title.includes('새 탭'))) {
      const pageTitle = getPageTitle(currentPath)
      const tabType = getTabTypeFromPath(currentPath)
      activeTabData.path = currentPath
      activeTabData.title = pageTitle
      activeTabData.type = tabType
    } else {
      // 새 탭 생성
      const pageTitle = getPageTitle(currentPath)
      const tabType = getTabTypeFromPath(currentPath)
      const newTab = addTab(pageTitle, '', tabType)
      newTab.path = currentPath
      originalSwitchTab(newTab.id)
    }
  }
}

// 경로에서 페이지 제목 추출
const getPageTitle = (path) => {
  const titleMap = {
    '/': '홈',
    '/outliner': '아웃라이너',
    '/blog': '블로그',
    '/blog/index': '블로그',
    '/board': '게시판',
    '/board/index': '게시판',
    '/gallery': '갤러리',
    '/gallery/index': '갤러리',
    '/guestbook': '방명록',
    '/wiki': '위키',
    '/wiki/index': '위키',
    '/contact': '문의하기',
    '/about': '소개',
    '/services': '서비스',
    '/tabs': '탭 관리자',
    '/qna': '질문과 답변',
    '/qna/index': '질문과 답변',
    '/humor': '유머',
    '/humor/index': '유머',
    '/contactboard': '문의게시판',
    '/contactboard/index': '문의게시판',
    '/related-sites': '관련 사이트',
    '/personal-info': '개인정보처리방침',
    '/ai-chat': 'AI 채팅',
    '/youtube-gallery': 'YouTube 갤러리',
    '/search': '검색',
    '/english': '영어',
    '/japanese': '일본어',
    '/under-construction': '공사중',
    '/error-unauthorized': '접근 권한 없음'
  }
  
  // 관리자 페이지 처리
  if (path.startsWith('/adminpage')) {
    if (path === '/adminpage') return '관리자 페이지'
    if (path === '/adminpage/users') return '사용자 관리'
    if (path === '/adminpage/posts') return '게시물 관리'
    if (path === '/adminpage/gallery') return '갤러리 관리'
    if (path === '/adminpage/menus') return '메뉴 관리'
    if (path === '/adminpage/theme') return '테마 설정'
    if (path === '/adminpage/database') return '데이터베이스 관리'
    if (path === '/adminpage/relatedsites') return '관련 사이트 관리'
    return '관리자 페이지'
  }
  
  // 하위 경로 처리
  if (path.startsWith('/blog/')) return '블로그'
  if (path.startsWith('/board/')) return '게시판'
  if (path.startsWith('/wiki/')) return '위키'
  if (path.startsWith('/qna/')) return '질문과 답변'
  if (path.startsWith('/humor/')) return '유머'
  if (path.startsWith('/contactboard/')) return '문의게시판'
  if (path.startsWith('/adminboard/')) return '관리자 게시판'
  if (path.startsWith('/admingallery/')) return '관리자 갤러리'
  
  return titleMap[path] || path.split('/').filter(Boolean).pop() || '페이지'
}

// 경로에서 탭 타입 결정
const getTabTypeFromPath = (path) => {
  if (path === '/') return 'home'
  if (path === '/outliner') return 'outliner'
  if (path.includes('/blog') || path.includes('/board')) return 'editor'
  if (path.includes('/wiki')) return 'editor'
  if (path.includes('/admin')) return 'admin'
  if (path === '/tabs') return 'default'
  return 'page'
}

// 외부 클릭 감지
const handleOutsideClick = (event) => {
  if (showTabMenu.value) {
    showTabMenu.value = false
  }
  if (contextMenu.value.show) {
    hideContextMenu()
  }
}

// 키보드 단축키
const handleKeydown = (event) => {
  // Ctrl+T: 새 탭
  if (event.ctrlKey && event.key === 't') {
    event.preventDefault()
    addNewTab()
  }
  // Ctrl+W: 현재 탭 닫기
  else if (event.ctrlKey && event.key === 'w') {
    event.preventDefault()
    if (tabs.value.length > 1 && activeTabId.value) {
      removeTab(activeTabId.value)
    }
  }
  // Ctrl+Tab: 다음 탭
  else if (event.ctrlKey && event.key === 'Tab') {
    event.preventDefault()
    const currentIndex = tabs.value.findIndex(tab => tab.id === activeTabId.value)
    const nextIndex = (currentIndex + 1) % tabs.value.length
    switchTab(tabs.value[nextIndex].id)
  }
  // Ctrl+Shift+Tab: 이전 탭
  else if (event.ctrlKey && event.shiftKey && event.key === 'Tab') {
    event.preventDefault()
    const currentIndex = tabs.value.findIndex(tab => tab.id === activeTabId.value)
    const prevIndex = currentIndex === 0 ? tabs.value.length - 1 : currentIndex - 1
    switchTab(tabs.value[prevIndex].id)
  }
}

// 라이프사이클
onMounted(() => {
  initialize()
  
  // 모바일 감지 초기화
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  // 전역 탭 관리자에 등록
  globalTabManager.setTabManager({
    tabs,
    activeTabId,
    activeTab,
    addTab,
    removeTab,
    switchTab,
    updateTab: (tabId, updates) => {
      const tab = tabs.value.find(t => t.id === tabId)
      if (tab) {
        Object.assign(tab, updates)
      }
    },
    updateTabContent,
    closeAllTabs,
    closeOtherTabs,
    duplicateTab,
    markTabAsCached: (tabId) => {
      const tab = tabs.value.find(t => t.id === tabId)
      if (tab) {
        tab.isCached = true
      }
    }
  })
  
  // 현재 페이지와 동기화
  syncWithCurrentPage()
  
  // 이벤트 리스너 추가
  document.addEventListener('click', handleOutsideClick)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  // 이벤트 리스너 제거
  document.removeEventListener('click', handleOutsideClick)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', checkMobile)
})

// 라우트 변경 감지
watch(() => route.path, () => {
  syncWithCurrentPage()
})
</script>

<style scoped>
.global-tab-bar {
  height: 40px;
  min-height: 40px;
}

.tab-header {
  height: 100%;
}

.tab-ghost {
  opacity: 0.5;
}

.tab-item {
  height: 40px;
  min-width: 120px;
  max-width: 200px;
  transition: all 0.2s ease;
}

.tab-item:hover {
  transform: translateY(-1px);
}

/* 스크롤바 스타일링 */
.tab-header::-webkit-scrollbar {
  height: 4px;
}

.tab-header::-webkit-scrollbar-track {
  background: theme('colors.gray.100');
}

.tab-header::-webkit-scrollbar-thumb {
  background: theme('colors.gray.300');
  border-radius: 2px;
}

.dark .tab-header::-webkit-scrollbar-track {
  background: theme('colors.gray.800');
}

.dark .tab-header::-webkit-scrollbar-thumb {
  background: theme('colors.gray.600');
}
</style>