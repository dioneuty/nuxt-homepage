<template>
  <div class="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
    <div class="max-w-3xl mx-auto md:max-w-4xl lg:max-w-5xl">
      <!-- 포스트가 존재하는 경우 -->
      <div v-if="post" class="bg-white shadow-lg rounded-lg overflow-hidden dark:bg-gray-800">
        <!-- 헤더 이미지 (옵션) -->
        <img v-if="post.image" :src="post.image" :alt="post.title" class="w-full h-64 object-cover md:h-80 lg:h-96">
        
        <!-- 포스트 내용 -->
        <div class="p-8 md:p-10 lg:p-12">
          <h1 class="text-3xl font-bold text-gray-900 mb-4 dark:text-white md:text-4xl lg:text-5xl">{{ post.title }}</h1>
          <div class="flex items-center text-sm text-gray-600 mb-6 md:text-base">
            <svg class="h-4 w-4 mr-2 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="dark:text-gray-200">{{ formatDate(post.createdAt) }}</span>
          </div>
          <div class="prose max-w-none text-gray-700 dark:text-white md:text-lg lg:text-xl">
            {{ post.content }}
          </div>
        </div>
      </div>

      <!-- 포스트를 찾을 수 없는 경우 -->
      <div v-else-if="!pending && !error && !post" class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">
              블로그 포스트를 찾을 수 없습니다.
            </p>
          </div>
        </div>
      </div>

      <!-- 에러 메시지 -->
      <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
        <p class="font-bold">에러 발생</p>
        <p>{{ error.message }}</p>
      </div>

      <!-- 로딩 상태 -->
      <div v-else class="flex flex-col justify-center items-center h-64 bg-white shadow-lg rounded-lg">
        <svg class="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-lg font-semibold text-gray-700">로딩 중...</p>
      </div>

      <!-- 네비게이션 버튼 -->
      <div class="mt-8 flex justify-center">
        <NuxtLink to="/blog" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out">
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          블로그 목록으로 돌아가기
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatDate } from '@/utils/dateFormatter'  // 날짜 포맷팅 유틸리티 함수 (별도로 구현 필요)

const route = useRoute()
const { data: post, error, pending } = await useFetch(`/api/blogPosts/${route.params.id}`)
</script>