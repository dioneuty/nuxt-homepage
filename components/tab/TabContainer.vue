<template>
  <div class="tab-container w-full h-full flex flex-col bg-white dark:bg-gray-900">
    <!-- 탭 헤더 -->
    <div class="tab-header flex items-center bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
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
                { 'bg-white dark:bg-gray-900 border-b-2 border-blue-500': element.id === activeTabId }
              ]"
              @click="switchTab(element.id)"
              @contextmenu.prevent="showTabContextMenu(element.id, $event)"
            >
              <div class="flex items-center px-3 py-2 min-w-0 flex-1">
                <!-- 탭 아이콘 -->
                <Icon
                  :icon="getTabIcon(element.type)"
                  class="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0"
                />
                
                <!-- 탭 제목 -->
                <span
                  v-if="!element.isEditing"
                  :class="[
                    'text-sm truncate',
                    element.id === activeTabId 
                      ? 'text-gray-900 dark:text-gray-100 font-medium' 
                      : 'text-gray-600 dark:text-gray-300'
                  ]"
                  @dblclick="startEditingTitle(element.id)"
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
              >
                <Icon icon="mdi:close" class="w-3 h-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
              </button>
            </div>
          </template>
        </draggable>
      </div>
      
      <!-- 새 탭 추가 버튼 -->
      <button
        @click="addTab()"
        class="flex-shrink-0 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title="새 탭 추가"
      >
        <Icon icon="mdi:plus" class="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>
      
      <!-- 탭 메뉴 -->
      <div class="relative">
        <button
          @click="showTabMenu = !showTabMenu"
          class="flex-shrink-0 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
            class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            다른 탭 모두 닫기
          </button>
          <button
            @click="closeAllTabs(); showTabMenu = false"
            class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            모든 탭 닫기
          </button>
          <button
            v-if="activeTab"
            @click="duplicateTab(activeTabId); showTabMenu = false"
            class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            현재 탭 복제
          </button>
        </div>
      </div>
    </div>
    
    <!-- 탭 컨텐츠 -->
    <div class="tab-content flex-1 min-h-0 overflow-hidden">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        v-show="tab.id === activeTabId"
        class="h-full"
      >
        <slot :tab="tab" :isActive="tab.id === activeTabId">
          <!-- 캐싱된 탭 컨텐츠 사용 -->
          <CachedTabContent
            v-if="tab.path"
            :tab="tab"
            :isActive="tab.id === activeTabId"
            @component-cached="handleComponentCached"
            @cache-restored="handleCacheRestored"
          />
          
          <!-- 기본 탭 컨텐츠 (경로가 없는 경우) -->
          <div v-else class="h-full p-4 overflow-auto">
            <div class="max-w-4xl mx-auto">
              <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{{ tab.title }}</h2>
              <div class="prose dark:prose-invert max-w-none">
                <textarea
                  v-model="tab.content"
                  class="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="내용을 입력하세요..."
                  @input="updateTabContent(tab.id, tab.content)"
                />
              </div>
            </div>
          </div>
        </slot>
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
        class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        탭 복제
      </button>
      <button
        v-if="tabs.length > 1"
        @click="removeTab(contextMenu.tabId); hideContextMenu()"
        class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-600"
      >
        탭 닫기
      </button>
      <button
        @click="closeOtherTabs(contextMenu.tabId); hideContextMenu()"
        class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        다른 탭 모두 닫기
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import draggable from 'vuedraggable'
import useTabManager from '~/composables/useTabManager.js'
import CachedTabContent from './CachedTabContent.vue'

// Props
const props = defineProps({
  initialTabs: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['tab-changed', 'tab-added', 'tab-removed', 'tab-cached', 'cache-restored'])

// 탭 관리자 사용
const {
  tabs,
  activeTabId,
  activeTab,
  addTab,
  removeTab,
  switchTab,
  updateTabContent,
  closeAllTabs,
  closeOtherTabs,
  duplicateTab,
  reorderTabs,
  initialize
} = useTabManager()

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
    default: 'mdi:file-document'
  }
  return iconMap[type] || iconMap.default
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

// 캐시 이벤트 핸들러
const handleComponentCached = (tabId) => {
  console.log(`탭 ${tabId} 컴포넌트가 캐시되었습니다.`)
  emit('tab-cached', tabId)
}

const handleCacheRestored = (tabId) => {
  console.log(`탭 ${tabId} 캐시가 복원되었습니다.`)
  emit('cache-restored', tabId)
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
    addTab()
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
  
  // 초기 탭이 제공된 경우
  if (props.initialTabs.length > 0) {
    tabs.value = [...props.initialTabs]
    if (tabs.value.length > 0) {
      activeTabId.value = tabs.value[0].id
    }
  }
  
  // 이벤트 리스너 추가
  document.addEventListener('click', handleOutsideClick)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  // 이벤트 리스너 제거
  document.removeEventListener('click', handleOutsideClick)
  document.removeEventListener('keydown', handleKeydown)
})

// 외부 접근을 위한 메서드 노출
defineExpose({
  addTab,
  removeTab,
  switchTab,
  activeTab,
  tabs
})
</script>

<style scoped>
.tab-ghost {
  opacity: 0.5;
}

.tab-item {
  transition: all 0.2s ease;
}

.tab-item:hover {
  transform: translateY(-1px);
}

.tab-content {
  background: theme('colors.gray.50');
}

.dark .tab-content {
  background: theme('colors.gray.900');
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