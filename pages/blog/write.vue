<template>
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6 dark:text-white">새 블로그 글 작성</h1>
      <form @submit.prevent="submitPost" class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">제목</label>
          <input type="text" id="title" v-model="post.title" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>
        <div>
          <label for="content" class="block text-sm font-medium text-gray-700 dark:text-gray-300">내용</label>
          <textarea id="content" v-model="post.content" rows="10" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
        </div>
        <div class="flex justify-between items-center space-x-4">
          <button type="submit" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            글 작성
          </button>
          <button type="button" @click="goToList" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700">
            목록으로
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  
//   definePageMeta({
//     layout: 'default',
//     // 이 페이지에서 자동 데이터 가져오기를 비활성화합니다
//     fetchOnServer: false
// })

  const router = useRouter()
  const post = ref({
    title: '',
    content: ''
  })
  
  const submitPost = async () => {
    try {
      const response = await fetch('/api/addBlogPost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post.value),
      })
  
      if (response.ok) {
        router.push('/blog')
      } else {
        console.error('Failed to submit post')
      }
    } catch (error) {
      console.error('Error submitting post:', error)
    }
  }

  const goToList = () => {
    router.push('/blog')
  }
  </script>