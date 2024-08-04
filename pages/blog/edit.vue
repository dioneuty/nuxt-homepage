<template>
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6 dark:text-white">블로그 포스트 수정</h1>
      <form v-if="post" @submit.prevent="updatePost" class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">제목</label>
          <input type="text" id="title" v-model="post.title" required
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>
        <div>
          <label for="content" class="block text-sm font-medium text-gray-700 dark:text-gray-300">내용</label>
          <textarea id="content" v-model="post.content" rows="10" required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
        </div>
        <div class="flex justify-between items-center">
          <button type="submit" 
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            포스트 수정
          </button>
          <NuxtLink :to="`/blog?view=${id}`"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700">
            취소
          </NuxtLink>
        </div>
      </form>
      <p v-else class="text-center text-gray-500 dark:text-gray-400">포스트를 불러오는 중...</p>
    </div>
  </template>
  
  <script setup>
  import { useRoute, useRouter } from 'vue-router'

  const route = useRoute()
  const router = useRouter()

  const id = route.query.id
  
  const { data: post } = await useFetch(`/api/blogPosts?id=${id}`)

  // 포스트 업데이트 함수
  const updatePost = async () => {
    const {error} = await useFetch(`/api/blogPosts/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        title: post.value.title,
        content: post.value.content,
        id: post.value.id
      }
    })
    
    if (error.value) {
      alert('포스트 수정에 실패했습니다.')
      return
    }
      
    alert('포스트가 성공적으로 수정되었습니다.')
    router.push(`/blog?view=${id}`)
  }
  </script>