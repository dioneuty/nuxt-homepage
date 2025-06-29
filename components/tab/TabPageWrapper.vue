<template>
  <div class="tab-page-wrapper h-full">
    <!-- 활성 탭의 페이지 컨텐츠 표시 -->
    <div v-if="activeTab && activeTab.path && activeTab.path !== route.path" class="h-full">
      <!-- 다른 페이지를 탭으로 보는 경우, 실제 페이지로 리다이렉트 -->
      <div class="flex items-center justify-center h-full">
        <div class="text-center">
          <Icon icon="mdi:loading" class="w-8 h-8 animate-spin text-blue-500 mb-2" />
          <p class="text-gray-600 dark:text-gray-400">페이지로 이동 중...</p>
        </div>
      </div>
    </div>
    
    <!-- 현재 페이지 컨텐츠 -->
    <div v-else class="h-full">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import useGlobalTabManager from '~/composables/useGlobalTabManager.js'

const route = useRoute()
const globalTabManager = useGlobalTabManager()

// 활성 탭 정보
const activeTab = computed(() => {
  return globalTabManager.tabManagerInstance.value?.activeTab || null
})
</script>

<style scoped>
.tab-page-wrapper {
  width: 100%;
  height: 100%;
}
</style>