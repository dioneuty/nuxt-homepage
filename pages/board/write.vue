<template>
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6 dark:text-white">새 게시글 작성</h1>
      <form @submit.prevent="submitPost" class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">제목</label>
          <input type="text" id="title" v-model="title" required
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>
        <div>
          <label for="content" class="block text-sm font-medium text-gray-700 dark:text-gray-300">내용</label>
          <textarea id="content" v-model="content" rows="5" required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
        </div>
        <div>
          <button type="submit" 
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            게시글 작성
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  const title = ref('')
  const content = ref('')
  
  async function submitPost() {
      const {error} = await useFetch('/api/boardPosts', {
        method: 'POST',
        body: {
            title: title.value,
            content: content.value,
        }
      })

      if (error.value) {
        console.error('Error:', error)
        alert('게시글 작성에 실패했습니다.')
        return
      }

      alert('게시글이 성공적으로 작성되었습니다.')
      await router.push('/board')
  }
  </script>