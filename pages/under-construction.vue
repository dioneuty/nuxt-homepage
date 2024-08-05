<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div class="text-center">
        <div class="mb-8">
          <svg class="mx-auto h-24 w-24 text-blue-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
        <h1 class="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
          집 공사 중입니다
        </h1>
        <p class="text-xl mb-8 text-gray-600 dark:text-gray-300">
          더 나은 서비스를 위해 준비 중입니다. 곧 돌아오겠습니다!
        </p>
        <div class="flex justify-center space-x-4">
          <NuxtLink to="/" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300">
            홈으로 돌아가기
          </NuxtLink>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  definePageMeta({
    layout: 'default'
  })
  </script>