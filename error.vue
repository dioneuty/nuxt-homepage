<template>
    <NuxtLayout>
      <div class="container mx-auto px-4 py-8">
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 text-center">
          <h1 class="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
            {{ error.statusCode === 404 ? '페이지를 찾을 수 없습니다' : '오류가 발생했습니다' }}
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300 mb-8">
            {{ error.message }}
          </p>
          <button @click="handleError" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            이전 페이지로 돌아가기
          </button>
        </div>
      </div>
    </NuxtLayout>
  </template>
  
  <script setup>
  const props = defineProps({
    error: Object
  })
  
  const handleError = () => clearError({ redirect: '/' })
  </script>