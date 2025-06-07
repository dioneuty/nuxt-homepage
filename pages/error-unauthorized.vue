<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-center px-4">
    <Icon icon="mdi:shield-lock-outline" class="w-24 h-24 text-red-500 mb-6" />
    <h1 class="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">접근 권한 없음</h1>
    <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
      이 페이지에 접근할 수 있는 권한이 없습니다. 관리자에게 문의하세요.
    </p>
    <NuxtLink 
      to="/" 
      class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
    >
      <Icon icon="mdi:home" class="w-5 h-5 mr-2" />
      메인 페이지로 돌아가기
    </NuxtLink>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'

definePageMeta({
  layout: 'default' // 또는 'empty'와 같은 특정 레이아웃 사용 가능
})

useHead({
  title: '접근 권한 없음',
  meta: [
    { name: 'description', content: '접근 권한이 없는 페이지입니다.' }
  ]
})
</script> 