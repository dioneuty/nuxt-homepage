<template>
  <div class="cached-tab-content h-full">
    <!-- 캐시된 컴포넌트가 있는 경우 -->
    <KeepAlive>
      <component
        v-if="shouldShowCached && cachedComponent"
        :is="cachedComponent"
        :key="tab.id"
        :tab="tab"
        @save-state="handleSaveState"
        @save-scroll="handleSaveScroll"
        @save-form="handleSaveForm"
        ref="cachedComponentRef"
      />
    </KeepAlive>
    
    <!-- 새로 로드해야 하는 경우 -->
    <div v-if="!shouldShowCached || !cachedComponent" class="h-full">
      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="flex items-center justify-center h-full">
        <div class="text-center">
          <Icon icon="mdi:loading" class="w-8 h-8 animate-spin text-blue-500 mb-2" />
          <p class="text-gray-600 dark:text-gray-400">페이지를 불러오는 중...</p>
        </div>
      </div>
      
      <!-- 실제 컴포넌트 -->
      <component
        v-else
        :is="currentComponent"
        :key="tab.id"
        :tab="tab"
        @save-state="handleSaveState"
        @save-scroll="handleSaveScroll"
        @save-form="handleSaveForm"
        @component-loaded="handleComponentLoaded"
        ref="currentComponentRef"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, defineAsyncComponent } from 'vue'
import { Icon } from '@iconify/vue'
import useTabCache from '~/composables/useTabCache.js'

// Props
const props = defineProps({
  tab: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['component-cached', 'cache-restored'])

// 탭 캐시 사용
const {
  setCachedComponent,
  getCachedComponent,
  hasCachedComponent,
  removeCachedComponent,
  saveState,
  restoreState,
  saveScrollPosition,
  restoreScrollPosition,
  saveFormData,
  restoreFormData
} = useTabCache()

// 로컬 상태
const isLoading = ref(false)
const cachedComponentRef = ref(null)
const currentComponentRef = ref(null)

// 캐시된 컴포넌트 확인
const cachedComponent = computed(() => {
  return getCachedComponent(props.tab.id)
})

// 캐시된 컴포넌트를 사용할지 여부
const shouldShowCached = computed(() => {
  return hasCachedComponent(props.tab.id) && props.isActive
})

// 현재 컴포넌트 결정
const currentComponent = computed(() => {
  if (!props.tab.path) return null
  
  return defineAsyncComponent({
    loader: () => getComponentLoader(props.tab.path),
    loadingComponent: () => ({
      template: `
        <div class="flex items-center justify-center h-full">
          <div class="text-center">
            <Icon icon="mdi:loading" class="w-8 h-8 animate-spin text-blue-500 mb-2" />
            <p class="text-gray-600 dark:text-gray-400">컴포넌트를 로드하는 중...</p>
          </div>
        </div>
      `
    }),
    errorComponent: () => ({
      template: `
        <div class="flex items-center justify-center h-full">
          <div class="text-center">
            <Icon icon="mdi:alert-circle" class="w-8 h-8 text-red-500 mb-2" />
            <p class="text-red-600 dark:text-red-400">컴포넌트를 로드할 수 없습니다</p>
          </div>
        </div>
      `
    }),
    delay: 200,
    timeout: 10000
  })
})

// 컴포넌트 로더 함수
const getComponentLoader = (path) => {
  // 홈페이지
  if (path === '/') return () => import('~/pages/index.vue')
  
  // 아웃라이너
  if (path === '/outliner') return () => import('~/pages/outliner.vue')
  
  // 블로그
  if (path === '/blog' || path.startsWith('/blog/')) {
    return () => import('~/pages/blog/index.vue')
  }
  
  // 게시판
  if (path === '/board' || path.startsWith('/board/')) {
    return () => import('~/pages/board/index.vue')
  }
  
  // 갤러리
  if (path === '/gallery' || path.startsWith('/gallery/')) {
    return () => import('~/pages/gallery/index.vue')
  }
  
  // 방명록
  if (path === '/guestbook') return () => import('~/pages/guestbook.vue')
  
  // 위키
  if (path === '/wiki' || path.startsWith('/wiki/')) {
    return () => import('~/pages/wiki/index.vue')
  }
  
  // AI 채팅
  if (path === '/ai-chat') return () => import('~/pages/ai-chat.vue')
  
  // 질문과 답변
  if (path === '/qna' || path.startsWith('/qna/')) {
    return () => import('~/pages/qna/index.vue')
  }
  
  // 유머
  if (path === '/humor' || path.startsWith('/humor/')) {
    return () => import('~/pages/humor/index.vue')
  }
  
  // 기타 페이지들
  if (path === '/contact') return () => import('~/pages/contact.vue')
  if (path === '/about') return () => import('~/pages/about.vue')
  if (path === '/services') return () => import('~/pages/services.vue')
  
  // 관리자 페이지들
  if (path.startsWith('/adminpage')) {
    if (path === '/adminpage') return () => import('~/pages/adminpage/index.vue')
    if (path === '/adminpage/users') return () => import('~/pages/adminpage/users.vue')
    if (path === '/adminpage/posts') return () => import('~/pages/adminpage/posts.vue')
    if (path === '/adminpage/gallery') return () => import('~/pages/adminpage/gallery/index.vue')
    if (path === '/adminpage/menus') return () => import('~/pages/adminpage/menus.vue')
    if (path === '/adminpage/theme') return () => import('~/pages/adminpage/theme.vue')
    if (path === '/adminpage/database') return () => import('~/pages/adminpage/database.vue')
    if (path === '/adminpage/relatedsites') return () => import('~/pages/adminpage/relatedsites.vue')
    return () => import('~/pages/adminpage/index.vue')
  }
  
  // 기본 404 컴포넌트
  return () => Promise.resolve({
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
}

// 컴포넌트 로드 완료 처리
const handleComponentLoaded = () => {
  if (currentComponentRef.value) {
    // 컴포넌트를 캐시에 저장
    setCachedComponent(props.tab.id, currentComponentRef.value)
    
    // 이전 상태 복원
    restorePreviousState()
    
    emit('component-cached', props.tab.id)
  }
}

// 상태 저장 처리
const handleSaveState = (state) => {
  saveState(props.tab.id, state)
}

// 스크롤 저장 처리
const handleSaveScroll = (scrollData) => {
  saveScrollPosition(props.tab.id, scrollData)
}

// 폼 데이터 저장 처리
const handleSaveForm = (formData) => {
  saveFormData(props.tab.id, formData)
}

// 이전 상태 복원
const restorePreviousState = async () => {
  await nextTick()
  
  // 상태 복원
  const savedState = restoreState(props.tab.id)
  if (savedState) {
    const component = currentComponentRef.value || cachedComponentRef.value
    if (component && typeof component.restoreState === 'function') {
      component.restoreState(savedState)
    }
  }
  
  // 스크롤 위치 복원
  const scrollPos = restoreScrollPosition(props.tab.id)
  if (scrollPos.top > 0 || scrollPos.left > 0) {
    const scrollContainer = document.querySelector('.cached-tab-content')
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollPos.top
      scrollContainer.scrollLeft = scrollPos.left
    }
  }
  
  // 폼 데이터 복원
  const formData = restoreFormData(props.tab.id)
  if (formData) {
    const component = currentComponentRef.value || cachedComponentRef.value
    if (component && typeof component.restoreFormData === 'function') {
      component.restoreFormData(formData)
    }
  }
  
  emit('cache-restored', props.tab.id)
}

// 현재 상태 저장
const saveCurrentState = () => {
  const component = currentComponentRef.value || cachedComponentRef.value
  if (component) {
    // 컴포넌트 상태 저장
    if (typeof component.getCurrentState === 'function') {
      const state = component.getCurrentState()
      if (state) {
        handleSaveState(state)
      }
    }
    
    // 스크롤 위치 저장
    const scrollContainer = document.querySelector('.cached-tab-content')
    if (scrollContainer) {
      handleSaveScroll({
        scrollTop: scrollContainer.scrollTop,
        scrollLeft: scrollContainer.scrollLeft
      })
    }
    
    // 폼 데이터 저장
    if (typeof component.getCurrentFormData === 'function') {
      const formData = component.getCurrentFormData()
      if (formData) {
        handleSaveForm(formData)
      }
    }
  }
}

// 탭이 비활성화될 때 상태 저장
watch(() => props.isActive, (newActive, oldActive) => {
  if (oldActive && !newActive) {
    // 탭이 비활성화되면 현재 상태 저장
    saveCurrentState()
  } else if (!oldActive && newActive) {
    // 탭이 활성화되면 상태 복원
    nextTick(() => {
      restorePreviousState()
    })
  }
})

// 컴포넌트 언마운트 시 상태 저장
onBeforeUnmount(() => {
  if (props.isActive) {
    saveCurrentState()
  }
})

// 마운트 시 캐시된 상태 복원
onMounted(() => {
  if (props.isActive && hasCachedComponent(props.tab.id)) {
    nextTick(() => {
      restorePreviousState()
    })
  }
})
</script>

<style scoped>
.cached-tab-content {
  width: 100%;
  height: 100%;
  overflow: auto;
}

/* 부드러운 전환 효과 */
.cached-tab-content > * {
  transition: opacity 0.2s ease-in-out;
}
</style>