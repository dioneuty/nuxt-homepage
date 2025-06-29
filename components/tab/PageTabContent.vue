<template>
  <div class="page-tab-content h-full">
    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="flex items-center justify-center h-full">
      <div class="text-center">
        <Icon icon="mdi:loading" class="w-8 h-8 animate-spin text-blue-500 mb-2" />
        <p class="text-gray-600 dark:text-gray-400">페이지를 로드하는 중...</p>
      </div>
    </div>
    
    <!-- 에러 상태 -->
    <div v-else-if="error" class="flex items-center justify-center h-full">
      <div class="text-center">
        <Icon icon="mdi:alert-circle" class="w-8 h-8 text-red-500 mb-2" />
        <p class="text-red-600 dark:text-red-400 mb-4">페이지를 로드할 수 없습니다</p>
        <button 
          @click="reload"
          class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
    
    <!-- 페이지 컨텐츠 -->
    <div v-else class="h-full">
      <!-- 홈페이지 -->
      <div v-if="tab.path === '/'" class="h-full overflow-auto">
        <HomePage />
      </div>
      
      <!-- 아웃라이너 -->
      <div v-else-if="tab.path === '/outliner'" class="h-full">
        <OutlinerPage />
      </div>
      
      <!-- 블로그 -->
      <div v-else-if="tab.path === '/blog'" class="h-full overflow-auto">
        <BlogIndex />
      </div>
      
      <!-- 게시판 -->
      <div v-else-if="tab.path === '/board'" class="h-full overflow-auto">
        <BoardIndex />
      </div>
      
      <!-- 갤러리 -->
      <div v-else-if="tab.path === '/gallery'" class="h-full overflow-auto">
        <GalleryIndex />
      </div>
      
      <!-- 방명록 -->
      <div v-else-if="tab.path === '/guestbook'" class="h-full overflow-auto">
        <GuestbookPage />
      </div>
      
      <!-- 위키 -->
      <div v-else-if="tab.path === '/wiki'" class="h-full overflow-auto">
        <WikiIndex />
      </div>
      
      <!-- 관리자 페이지들 -->
      <div v-else-if="tab.path.startsWith('/admin')" class="h-full overflow-auto">
        <AdminPage :path="tab.path" />
      </div>
      
      <!-- 기타 페이지들 -->
      <div v-else class="h-full overflow-auto">
        <GenericPage :path="tab.path" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { Icon } from '@iconify/vue'

// 컴포넌트 지연 로딩
const HomePage = defineAsyncComponent(() => import('~/pages/index.vue'))
const OutlinerPage = defineAsyncComponent(() => import('~/pages/outliner.vue'))
const BlogIndex = defineAsyncComponent(() => import('~/pages/blog/index.vue'))
const BoardIndex = defineAsyncComponent(() => import('~/pages/board/index.vue'))
const GalleryIndex = defineAsyncComponent(() => import('~/pages/gallery/index.vue'))
const GuestbookPage = defineAsyncComponent(() => import('~/pages/guestbook.vue'))
const WikiIndex = defineAsyncComponent(() => import('~/pages/wiki/index.vue'))

// Props
const props = defineProps({
  tab: {
    type: Object,
    required: true
  }
})

// 로컬 상태
const isLoading = ref(true)
const error = ref(null)

// 페이지 로드
const loadPage = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    // 페이지 로딩 시뮬레이션 (실제로는 컴포넌트 로딩 시간)
    await new Promise(resolve => setTimeout(resolve, 300))
    
    isLoading.value = false
  } catch (err) {
    error.value = err
    isLoading.value = false
  }
}

// 페이지 다시 로드
const reload = () => {
  loadPage()
}

// 마운트 시 페이지 로드
onMounted(() => {
  loadPage()
})

// 관리자 페이지 컴포넌트
const AdminPage = defineAsyncComponent({
  loader: () => {
    const path = props.tab.path
    if (path === '/adminpage') return import('~/pages/adminpage/index.vue')
    if (path === '/adminpage/users') return import('~/pages/adminpage/users.vue')
    if (path === '/adminpage/posts') return import('~/pages/adminpage/posts.vue')
    if (path === '/adminpage/gallery') return import('~/pages/adminpage/gallery/index.vue')
    if (path === '/adminpage/menus') return import('~/pages/adminpage/menus.vue')
    if (path === '/adminpage/theme') return import('~/pages/adminpage/theme.vue')
    if (path === '/adminpage/database') return import('~/pages/adminpage/database.vue')
    if (path === '/adminpage/relatedsites') return import('~/pages/adminpage/relatedsites.vue')
    
    // 기본 관리자 페이지
    return import('~/pages/adminpage/index.vue')
  },
  loadingComponent: () => ({
    template: '<div class="flex items-center justify-center h-full"><Icon icon="mdi:loading" class="w-8 h-8 animate-spin text-blue-500" /></div>'
  }),
  errorComponent: () => ({
    template: '<div class="flex items-center justify-center h-full text-red-500">관리자 페이지를 로드할 수 없습니다</div>'
  })
})

// 일반 페이지 컴포넌트
const GenericPage = defineAsyncComponent({
  loader: () => {
    const path = props.tab.path
    
    // 경로에 따른 동적 컴포넌트 로딩
    if (path === '/contact') return import('~/pages/contact.vue')
    if (path === '/about') return import('~/pages/about.vue')
    if (path === '/services') return import('~/pages/services.vue')
    if (path === '/related-sites') return import('~/pages/related-sites.vue')
    if (path === '/personal-info') return import('~/pages/personal-info.vue')
    if (path === '/ai-chat') return import('~/pages/ai-chat.vue')
    if (path === '/youtube-gallery') return import('~/pages/youtube-gallery.vue')
    if (path === '/search') return import('~/pages/search.vue')
    if (path === '/english') return import('~/pages/english.vue')
    if (path === '/japanese') return import('~/pages/japanese.vue')
    
    // 하위 경로들
    if (path.startsWith('/blog/')) return import('~/pages/blog/index.vue')
    if (path.startsWith('/board/')) return import('~/pages/board/index.vue')
    if (path.startsWith('/wiki/')) return import('~/pages/wiki/index.vue')
    if (path.startsWith('/qna/')) return import('~/pages/qna/index.vue')
    if (path.startsWith('/humor/')) return import('~/pages/humor/index.vue')
    if (path.startsWith('/contactboard/')) return import('~/pages/contactboard/index.vue')
    
    // 기본 404 페이지
    return Promise.resolve({
      template: `
        <div class="flex items-center justify-center h-full">
          <div class="text-center">
            <Icon icon="mdi:file-question" class="w-16 h-16 text-gray-400 mb-4" />
            <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">페이지를 찾을 수 없습니다</h2>
            <p class="text-gray-500 dark:text-gray-400">경로: ${path}</p>
          </div>
        </div>
      `
    })
  },
  loadingComponent: () => ({
    template: '<div class="flex items-center justify-center h-full"><Icon icon="mdi:loading" class="w-8 h-8 animate-spin text-blue-500" /></div>'
  }),
  errorComponent: () => ({
    template: '<div class="flex items-center justify-center h-full text-red-500">페이지를 로드할 수 없습니다</div>'
  })
})
</script>

<style scoped>
.page-tab-content {
  width: 100%;
  height: 100%;
  background: theme('colors.gray.50');
}

.dark .page-tab-content {
  background: theme('colors.gray.900');
}

/* 페이지 컨텐츠 스타일 */
.page-tab-content >>> .container {
  max-width: none;
  padding: 0;
}

.page-tab-content >>> .max-w-6xl {
  max-width: none;
}

/* 스크롤바 스타일 */
.page-tab-content::-webkit-scrollbar {
  width: 8px;
}

.page-tab-content::-webkit-scrollbar-track {
  background: theme('colors.gray.100');
}

.page-tab-content::-webkit-scrollbar-thumb {
  background: theme('colors.gray.300');
  border-radius: 4px;
}

.dark .page-tab-content::-webkit-scrollbar-track {
  background: theme('colors.gray.800');
}

.dark .page-tab-content::-webkit-scrollbar-thumb {
  background: theme('colors.gray.600');
}
</style>