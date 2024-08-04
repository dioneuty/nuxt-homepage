<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="post" class="bg-white shadow-md rounded-lg overflow-hidden dark:bg-gray-800 dark:text-white">
      <div class="p-6">
        <h1 class="text-3xl font-bold mb-4">{{ post.title }}</h1>
        <p class="text-gray-600 dark:text-gray-300 mb-2">작성일: {{ new Date(post.created_at).toLocaleDateString() }}</p>
        <div class="prose max-w-none dark:prose-invert">
          {{ post.content }}
        </div>
      </div>
    </div>
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 dark:bg-gray-800 dark:text-red-400" role="alert">
      <p class="font-bold">에러</p>
      <p>{{ error.message }}</p>
    </div>
    
    <!-- 버튼 그룹 -->
    <div class="mt-6 flex justify-between items-center">
      <div class="space-x-4">
        <NuxtLink :to="`/board/edit?id=${id}`" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          수정하기
        </NuxtLink>
        <button @click="deletePost" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
          삭제하기
        </button>
      </div>
      <NuxtLink to="/board" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700">
        목록으로
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const id = route.query.id

const { data: post, error, pending } = await useFetch(`/api/boardPosts?id=${id}`)

const deletePost = async () => {
  if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
    const {error} = await useFetch(`/api/boardPosts`, { 
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        id: post.value.id
      }
    })

    if(error.value) {
      alert('게시글 삭제 중 오류가 발생했습니다.')
      console.error('Error deleting post:', error)
      return
    } 

    alert('게시글이 삭제되었습니다.')
    await router.push('/board')
  }
}
</script>