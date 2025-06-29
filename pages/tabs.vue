<template>
  <div class="tabs-page h-screen flex flex-col">
    <TabContainer
      ref="tabContainer"
      @tab-changed="handleTabChanged"
      @tab-added="handleTabAdded"
      @tab-removed="handleTabRemoved"
    >
      <template #default="{ tab, isActive }">
        <TabContent
          :tab="tab"
          @update:content="(content) => updateTabContent(tab.id, content)"
          @update:title="(title) => updateTabTitle(tab.id, title)"
          @create-tab="createNewTab"
        />
      </template>
    </TabContainer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TabContainer from '~/components/tab/TabContainer.vue'
import TabContent from '~/components/tab/TabContent.vue'
import useGlobalTabManager from '~/composables/useGlobalTabManager.js'

// 메타 데이터
definePageMeta({
  title: '탭 관리자 - Dion',
  meta: [
    { name: 'description', content: '탭 관리자 - 여러 문서와 도구를 탭으로 관리하세요' },
    { name: 'keywords', content: 'Dion, 탭, 관리자, 문서' }
  ]
})

// 탭 컨테이너 참조
const tabContainer = ref(null)

// 전역 탭 관리자
const globalTabManager = useGlobalTabManager()

// 탭 변경 이벤트 처리
const handleTabChanged = (tab) => {
  console.log('탭 변경됨:', tab)
}

// 탭 추가 이벤트 처리
const handleTabAdded = (tab) => {
  console.log('탭 추가됨:', tab)
}

// 탭 제거 이벤트 처리
const handleTabRemoved = (tabId) => {
  console.log('탭 제거됨:', tabId)
}

// 탭 내용 업데이트
const updateTabContent = (tabId, content) => {
  if (tabContainer.value) {
    // TabContainer의 updateTabContent 메서드 호출
    const tabManager = tabContainer.value
    if (tabManager && tabManager.updateTabContent) {
      tabManager.updateTabContent(tabId, content)
    }
  }
}

// 탭 제목 업데이트
const updateTabTitle = (tabId, title) => {
  if (tabContainer.value) {
    // TabContainer의 updateTabTitle 메서드 호출
    const tabManager = tabContainer.value
    if (tabManager && tabManager.updateTabTitle) {
      tabManager.updateTabTitle(tabId, title)
    }
  }
}

// 새 탭 생성
const createNewTab = (tabData) => {
  if (tabContainer.value) {
    tabContainer.value.addTab(
      tabData.title || '새 탭',
      tabData.content || '',
      tabData.type || 'default'
    )
  }
}

// 컴포넌트 마운트 시
onMounted(() => {
  // 전역 탭 관리자에 현재 탭 컨테이너 등록
  if (tabContainer.value) {
    globalTabManager.setTabManager(tabContainer.value)
  }
  
  console.log('탭 페이지가 로드되었습니다.')
})
</script>

<style scoped>
.tabs-page {
  background: theme('colors.gray.50');
}

.dark .tabs-page {
  background: theme('colors.gray.900');
}
</style>