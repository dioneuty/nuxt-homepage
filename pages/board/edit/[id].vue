<template>
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6 dark:text-white">게시글 수정</h1>
      <form @submit.prevent="updatePost" class="space-y-4">
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
        <div class="flex justify-between items-center">
          <button type="submit" 
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            게시글 수정
          </button>
          <button type="button" @click="goToList"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700">
            목록으로
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  
  const route = useRoute()
  const router = useRouter()
  const title = ref('')
  const content = ref('')
  
  onMounted(async () => {
    const postId = route.params.id
    try {
      const response = await fetch(`/api/getBoardPost/${postId}`)
      if (response.ok) {
        const post = await response.json()
        title.value = post.title
        content.value = post.content
      } else {
        throw new Error('게시글을 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert(error.message)
    }
  })
  
  async function updatePost() {
    const postId = route.params.id
    try {
      const response = await fetch(`/api/updateBoardPost/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.value,
          content: content.value,
        }),
      })
  
      if (response.ok) {
        alert('게시글이 성공적으로 수정되었습니다.')
        router.push('/board')
      } else {
        throw new Error('게시글 수정에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert(error.message)
    }
  }

  function goToList() {
    router.push('/board')
  }
  </script>