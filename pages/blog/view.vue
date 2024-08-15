<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="pending">로딩 중...</div>
    <div v-else-if="error">에러 발생: {{ error }}</div>
    <div v-else-if="post">
      <h1 class="text-3xl font-bold mb-4 dark:text-white">{{ post.title }}</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-2">작성일: {{ formatDate(post.createdAt) }}</p>
      <p class="text-gray-600 dark:text-gray-400 mb-4">카테고리: {{ post.category?.name || '없음' }}</p>
      <div class="prose dark:prose-invert max-w-none" v-html="post.content"></div>
      
      <!-- 버튼 그룹 -->
      <div class="mt-8 flex justify-between items-center">
        <div class="space-x-4">
          <NuxtLink :to="`/blog/write?id=${id}`" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            수정하기
          </NuxtLink>
          <button @click="deletePost" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
            삭제하기
          </button>
        </div>
        <NuxtLink :to="`/blog?category=${currentCategoryId}`" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700">
          목록으로
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCategoryStore } from '~/stores/categoryStore'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useModal } from '~/composables/useModal'

const route = useRoute()
const router = useRouter()
const { openModal } = useModal()

const categoryStore = useCategoryStore()
const { currentCategoryId } = storeToRefs(categoryStore)

const id = route.query.id

const { data: post, error, pending } = await useFetch(() => `/api/blogPosts?id=${id}&include=category`)

// 날짜 포맷 함수
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 삭제 함수
async function deletePost() {
  openModal('확인', '정말로 이 게시글을 삭제하시겠습니까?', async (confirmed) => {
    if (confirmed) {
      try {
        const { error } = await useFetch(`/api/blogPosts?id=${id}`, {
          method: 'DELETE'
        })

        if (error.value) {
          openModal('오류', '게시글 삭제에 실패했습니다.')
          return
        }

        openModal('성공', '게시글이 성공적으로 삭제되었습니다.', () => {
          router.push('/blog')
        })
      } catch (error) {
        openModal('오류', '서버 오류가 발생했습니다.')
      }
    }
  }, true)
}

// 페이지 메타 정의
definePageMeta({
  layout: 'blog'
})
</script>