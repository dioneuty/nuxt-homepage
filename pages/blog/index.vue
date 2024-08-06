<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 dark:text-white">블로그</h1>
    <div class="w-full">
      <div v-if="pending">로딩 중...</div>
      <div v-else-if="error">에러 발생: {{ error }}</div>
      <div v-else>
        <div v-if="posts.length === 0" class="text-center text-gray-600 dark:text-gray-400">
          이 카테고리에는 글이 존재하지 않습니다.
        </div>
        <div v-else>
          <div v-for="post in posts" :key="post.id" class="mb-6 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div class="p-6">
              <h2 class="text-xl font-semibold mb-2 dark:text-white">
                <NuxtLink :to="`/blog/view?id=${post.id}`" class="hover:text-blue-500">{{ post.title }}</NuxtLink>
              </h2>
              <p class="text-gray-600 dark:text-gray-300">{{ post.content.substring(0, 150) }}...</p>
            </div>
          </div>
        </div>
        <div class="mt-8 text-right">
          <NuxtLink to="/blog/write" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            글쓰기
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const category = computed(() => route.query.category)

const { data: posts, pending, error } = await useFetch(() => `/api/blogPosts${category.value ? `?category=${category.value}` : ''}`)

definePageMeta({
  layout: 'blog'
})
</script>