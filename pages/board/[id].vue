<template>
    <div class="container mx-auto px-4 py-8">
      <div v-if="post" class="bg-white shadow-md rounded-lg overflow-hidden">
        <div class="px-6 py-4">
          <h1 class="text-2xl font-bold text-gray-800 mb-2">{{ post.title }}</h1>
          <p class="text-sm text-gray-600 mb-4">작성일: {{ formatDate(post.createdAt) }}</p>
          <div class="prose max-w-none">
            {{ post.content }}
          </div>
        </div>
      </div>
      <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
        <p class="font-bold">에러 발생</p>
        <p>{{ error.message }}</p>
      </div>
      <div class="mt-6 flex space-x-4">
        <NuxtLink to="/board" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          목록으로 돌아가기
        </NuxtLink>
        <button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          수정하기
        </button>
        <button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
          삭제하기
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
import { formatDate } from '@/utils/dateFormatter'  // 날짜 포맷팅 유틸리티 함수 (별도로 구현 필요)

  const route = useRoute()
  const { data: post, error } = await useFetch(`/api/boardPosts/${route.params.id}`)
  </script>