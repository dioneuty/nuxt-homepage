<template>
  <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
    <h2 class="text-2xl font-bold mb-4 dark:text-white flex items-center">
      <Icon icon="mdi:weather-partly-cloudy" class="mr-2" />
      일기예보
    </h2>
    <!-- 일기예보 내용 -->
    <p class="dark:text-gray-300">일기예보 데이터를 여기에 표시합니다.</p>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
</script>