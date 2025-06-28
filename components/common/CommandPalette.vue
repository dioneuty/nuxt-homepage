<template>
  <div v-if="isCommandPaletteOpen" class="command-palette-overlay">
    <!-- 오버레이 배경 -->
    <div 
      class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50"
      @click="closeCommandPalette"
    ></div>
    
    <!-- Command Palette 메인 모달 -->
    <div class="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div class="command-palette-container max-w-2xl w-full mx-4">
        <!-- 글래스모피즘 카드 -->
        <div class="
          bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 
          rounded-2xl shadow-2xl overflow-hidden
          dark:bg-gray-900/60 dark:border-gray-600/50
        ">
          <!-- 검색 입력 섹션 -->
          <div class="flex items-center px-4 py-3 border-b border-gray-600/30">
            <!-- 검색 아이콘 -->
            <div class="flex-shrink-0 w-5 h-5 text-gray-300 mr-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <!-- 검색 입력창 -->
            <input
              ref="searchInput"
              v-model="searchQuery"
              @input="handleSearchInput"
              class="
                command-palette-input flex-1 bg-transparent 
                text-white 
                placeholder-gray-300
                outline-none text-lg
              "
              placeholder="명령어를 입력하거나 검색하세요..."
              autocomplete="off"
            />
            
            <!-- 로딩 스피너 -->
            <div v-if="isLoading" class="flex-shrink-0 ml-3">
              <div class="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            </div>
            
            <!-- 단축키 힌트 -->
            <div class="flex-shrink-0 ml-3 text-xs text-gray-300">
              <kbd class="px-2 py-1 bg-gray-700/60 text-white rounded text-xs font-mono">ESC</kbd>
            </div>
          </div>
          
          <!-- 결과 목록 -->
          <div class="max-h-96 overflow-y-auto">
            <!-- 검색 결과가 없는 경우 -->
            <div v-if="searchResults.length === 0 && !isLoading" class="p-4 text-center text-gray-200">
              <div class="text-4xl mb-2">🔍</div>
              <p>검색 결과가 없습니다</p>
              <p class="text-sm mt-1">다른 키워드로 검색해보세요</p>
            </div>
            
            <!-- 검색 결과 목록 -->
            <div v-else class="py-2">
              <div
                v-for="(result, index) in searchResults"
                :key="result.id"
                @click="selectCommand(index)"
                @mouseenter="selectedIndex = index"
                :class="[
                  'flex items-center px-4 py-3 cursor-pointer transition-all duration-150',
                  index === selectedIndex 
                    ? 'bg-blue-500/20 border-r-2 border-blue-500' 
                    : 'hover:bg-white/5'
                ]"
              >
                <!-- 아이콘 -->
                <div class="flex-shrink-0 w-8 h-8 mr-3 flex items-center justify-center">
                  <div v-if="result.icon" class="text-xl">
                    {{ getIconEmoji(result.icon) }}
                  </div>
                  <div v-else class="w-6 h-6 bg-gray-300/20 rounded-full"></div>
                </div>
                
                <!-- 메인 콘텐츠 -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <h3 class="text-white font-medium truncate">
                      {{ result.title }}
                    </h3>
                    <span v-if="result.type" class="
                      ml-2 px-2 py-1 text-xs rounded-full bg-white/10 
                      text-gray-300 flex-shrink-0
                    ">
                      {{ result.type }}
                    </span>
                  </div>
                  <p v-if="result.description" class="
                    text-sm text-gray-300 
                    truncate mt-1
                  ">
                    {{ result.description }}
                  </p>
                </div>
                
                <!-- 실행 힌트 -->
                <div v-if="index === selectedIndex" class="flex-shrink-0 ml-3">
                  <kbd class="px-2 py-1 bg-gray-900 text-white rounded text-xs font-mono font-semibold border border-gray-600">↵</kbd>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 푸터 힌트 -->
          <div class="px-4 py-2 border-t border-gray-600/30 bg-gray-900/20">
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center space-x-4">
                <span class="flex items-center text-gray-200">
                  <kbd class="px-2 py-1 bg-gray-900 text-white rounded mr-1 font-mono text-xs font-semibold border border-gray-600">↑↓</kbd>
                  탐색
                </span>
                <span class="flex items-center text-gray-200">
                  <kbd class="px-2 py-1 bg-gray-900 text-white rounded mr-1 font-mono text-xs font-semibold border border-gray-600">↵</kbd>
                  선택
                </span>
                <span class="flex items-center text-gray-200">
                  <kbd class="px-2 py-1 bg-gray-900 text-white rounded mr-1 font-mono text-xs font-semibold border border-gray-600">ESC</kbd>
                  닫기
                </span>
              </div>
              <span class="text-gray-300">{{ searchResults.length }}개 결과</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, nextTick } from 'vue'
import { useCommandPalette } from '~/composables/useCommandPalette'

/**
 * Command Palette 컴포넌트
 * 키보드 단축키 기반의 빠른 명령 실행 및 검색 인터페이스를 제공합니다.
 */

const {
  isCommandPaletteOpen,
  searchQuery,
  searchResults,
  selectedIndex,
  isLoading,
  closeCommandPalette,
  performSearch,
  executeSelectedCommand
}: any = useCommandPalette()

/**
 * 검색 입력 처리 (디바운싱 적용)
 */
let searchTimeout: NodeJS.Timeout | null = null

function handleSearchInput() {
  // 이전 타이머 취소
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  // 300ms 디바운싱으로 검색 실행
  searchTimeout = setTimeout(() => {
    performSearch(searchQuery.value)
  }, 300)
}

/**
 * 명령 선택 및 실행
 * @param {number} index - 선택할 명령의 인덱스
 */
function selectCommand(index: number) {
  selectedIndex.value = index
  executeSelectedCommand()
}

/**
 * 아이콘 이름을 이모지로 변환
 * @param {string} iconName - 아이콘 이름
 * @returns {string} 해당 이모지
 */
function getIconEmoji(iconName: string): string {
  const iconMap: Record<string, string> = {
    'mdi:home': '🏠',
    'mdi:pencil-plus': '✏️',
    'mdi:clipboard-text-plus': '📝',
    'mdi:book-plus': '📖',
    'mdi:image-multiple': '🖼️',
    'mdi:magnify': '🔍',
    'mdi:format-list-bulleted-type': '📋',
    'mdi:clipboard-text-outline': '📄',
    'mdi:post-outline': '📰',
    'mdi:book-open-page-variant': '📚',
    'mdi:help-circle-outline': '❓',
    'mdi:emoticon-happy-outline': '😄',
    'mdi:file-document-outline': '📄'
  }
  
  return iconMap[iconName] || '📄'
}

// Command Palette가 열릴 때마다 기본 명령어로 초기화
watch(isCommandPaletteOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      performSearch('')
    })
  }
})
</script>

<style scoped>
/* 추가적인 스타일링이 필요한 경우 여기에 정의 */
.command-palette-overlay {
  /* 오버레이 관련 스타일 */
}

.command-palette-container {
  /* 컨테이너 관련 스타일 */
}

/* 키보드 힌트 스타일 */
kbd {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

/* 스크롤바 스타일링 */
.max-h-96::-webkit-scrollbar {
  width: 6px;
}

.max-h-96::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-96::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.max-h-96::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style> 