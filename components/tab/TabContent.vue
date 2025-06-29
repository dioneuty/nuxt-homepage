<template>
  <div class="tab-content-wrapper h-full">
    <!-- 기본 컨텐츠 타입 -->
    <div v-if="tab.type === 'default'" class="h-full p-4 overflow-auto">
      <div class="max-w-4xl mx-auto">
        <div class="mb-4">
          <input
            v-model="tab.title"
            class="text-2xl font-bold bg-transparent border-none outline-none w-full text-gray-900 dark:text-gray-100"
            placeholder="제목을 입력하세요..."
            @input="updateTitle"
          />
        </div>
        <div class="prose dark:prose-invert max-w-none">
          <textarea
            v-model="localContent"
            class="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="내용을 입력하세요..."
            @input="updateContent"
          />
        </div>
      </div>
    </div>
    
    <!-- 에디터 타입 -->
    <div v-else-if="tab.type === 'editor'" class="h-full">
      <CommonQuillEditor
        :value="localContent"
        @input="updateContent"
        :placeholder="`${tab.title}의 내용을 입력하세요...`"
        class="h-full"
      />
    </div>
    
    <!-- 아웃라이너 타입 -->
    <div v-else-if="tab.type === 'outliner'" class="h-full">
      <div class="p-4 h-full">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">{{ tab.title }}</h2>
        <div class="text-gray-600 dark:text-gray-400">
          아웃라이너 기능이 여기에 통합될 예정입니다.
        </div>
      </div>
    </div>
    
    <!-- 브라우저 타입 -->
    <div v-else-if="tab.type === 'browser'" class="h-full flex flex-col">
      <div class="flex items-center p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <input
          v-model="browserUrl"
          class="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="URL을 입력하세요..."
          @keydown.enter="loadUrl"
        />
        <button
          @click="loadUrl"
          class="ml-2 px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
        >
          이동
        </button>
      </div>
      <div class="flex-1 bg-white dark:bg-gray-900">
        <iframe
          v-if="tab.url"
          :src="tab.url"
          class="w-full h-full border-none"
          :title="tab.title"
        />
        <div v-else class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          URL을 입력하여 웹페이지를 로드하세요
        </div>
      </div>
    </div>
    
    <!-- 페이지 타입 -->
    <div v-else-if="tab.type === 'page'" class="h-full">
      <PageTabContent :tab="tab" />
    </div>
    
    <!-- 홈 타입 -->
    <div v-else-if="tab.type === 'home'" class="h-full p-6 overflow-auto">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">환영합니다!</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- 새 탭 생성 카드들 -->
          <div
            @click="createNewTab('default')"
            class="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <Icon icon="mdi:file-document" class="w-8 h-8 text-blue-500 mb-3" />
            <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">새 문서</h3>
            <p class="text-gray-600 dark:text-gray-400">텍스트 문서를 작성합니다</p>
          </div>
          
          <div
            @click="createNewTab('editor')"
            class="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <Icon icon="mdi:file-document-edit" class="w-8 h-8 text-green-500 mb-3" />
            <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">리치 에디터</h3>
            <p class="text-gray-600 dark:text-gray-400">서식이 있는 문서를 작성합니다</p>
          </div>
          
          <div
            @click="createNewTab('browser')"
            class="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <Icon icon="mdi:web" class="w-8 h-8 text-purple-500 mb-3" />
            <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">웹 브라우저</h3>
            <p class="text-gray-600 dark:text-gray-400">웹페이지를 열어봅니다</p>
          </div>
          
          <div
            @click="createNewTab('outliner')"
            class="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <Icon icon="mdi:format-list-bulleted-triangle" class="w-8 h-8 text-orange-500 mb-3" />
            <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">아웃라이너</h3>
            <p class="text-gray-600 dark:text-gray-400">구조화된 노트를 작성합니다</p>
          </div>
        </div>
        
        <!-- 최근 탭 목록 -->
        <div v-if="recentTabs.length > 0" class="mt-8">
          <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">최근 탭</h2>
          <div class="space-y-2">
            <div
              v-for="recentTab in recentTabs"
              :key="recentTab.id"
              @click="openRecentTab(recentTab)"
              class="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <div class="flex items-center">
                <Icon :icon="getTabIcon(recentTab.type)" class="w-4 h-4 mr-3 text-gray-500" />
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-gray-900 dark:text-gray-100 truncate">{{ recentTab.title }}</h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(recentTab.updatedAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, defineAsyncComponent } from 'vue'
import { Icon } from '@iconify/vue'
import PageTabContent from './PageTabContent.vue'

// 컴포넌트 지연 로딩
const CommonQuillEditor = defineAsyncComponent(() => import('~/components/CommonQuillEditor.vue'))

// Props
const props = defineProps({
  tab: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['update:content', 'update:title', 'create-tab'])

// 로컬 상태
const localContent = ref(props.tab.content || '')
const browserUrl = ref(props.tab.url || '')

// 최근 탭 목록 (임시 데이터)
const recentTabs = ref([])

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

// 내용 업데이트
const updateContent = () => {
  emit('update:content', localContent.value)
}

// 제목 업데이트
const updateTitle = () => {
  emit('update:title', props.tab.title)
}

// URL 로드
const loadUrl = () => {
  if (browserUrl.value) {
    // URL 형식 검증 및 수정
    let url = browserUrl.value
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    
    props.tab.url = url
    browserUrl.value = url
  }
}

// 새 탭 생성
const createNewTab = (type) => {
  const titles = {
    default: '새 문서',
    editor: '리치 에디터',
    browser: '웹 브라우저',
    outliner: '아웃라이너'
  }
  
  emit('create-tab', {
    title: titles[type] || '새 탭',
    type,
    content: ''
  })
}

// 최근 탭 열기
const openRecentTab = (recentTab) => {
  emit('create-tab', { ...recentTab })
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '방금 전'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`
  
  return date.toLocaleDateString()
}

// 콘텐츠 동기화
watch(() => props.tab.content, (newContent) => {
  localContent.value = newContent || ''
})

watch(() => props.tab.url, (newUrl) => {
  browserUrl.value = newUrl || ''
})

// 최근 탭 로드
onMounted(() => {
  // 로컬스토리지에서 최근 탭 목록 로드
  try {
    const saved = localStorage.getItem('recentTabs')
    if (saved) {
      recentTabs.value = JSON.parse(saved).slice(0, 5) // 최근 5개만
    }
  } catch (error) {
    console.error('최근 탭 로드 실패:', error)
  }
})
</script>

<style scoped>
.tab-content-wrapper {
  background: theme('colors.gray.50');
}

.dark .tab-content-wrapper {
  background: theme('colors.gray.900');
}
</style>