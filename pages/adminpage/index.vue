<!-- pages/adminpage/index.vue -->
<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4 dark:text-white">관리자 대시보드</h2>
    <p class="dark:text-gray-300">이곳에서 사이트의 주요 현황을 확인할 수 있습니다.</p>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

useHead({
  title: '관리자 대시보드'
})
</script> 