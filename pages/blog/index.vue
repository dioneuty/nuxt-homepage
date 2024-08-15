<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-8 dark:text-white flex items-center">
      <Icon icon="mdi:post-outline" class="mr-3 text-blue-500" width="40" height="40" />
      블로그
    </h1>
    
    <div v-if="pending" class="flex justify-center items-center h-64">
      <Icon icon="eos-icons:loading" class="text-blue-500" width="48" height="48" />
    </div>
    
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
      <p class="font-bold">에러 발생</p>
      <p>{{ error }}</p>
    </div>
    
    <div v-else>
      <div v-if="posts.length === 0" class="text-center text-gray-600 dark:text-gray-400 py-12">
        <Icon icon="mdi:folder-open-outline" class="mx-auto mb-4" width="64" height="64" />
        <p>게시물이 존재하지 않습니다.</p>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="post in posts" :key="post.id" class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg">
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-3 dark:text-white group">
              <NuxtLink :to="`/blog/view?id=${post.id}`" class="hover:text-blue-500 transition-colors duration-200 flex items-center">
                <Icon icon="mdi:file-document-outline" class="mr-2 group-hover:text-blue-500" />
                {{ post.title }}
              </NuxtLink>
            </h2>
            <p class="text-gray-600 dark:text-gray-300 mb-4 text-sm">{{ post.content.substring(0, 100) }}...</p>
            <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Icon icon="mdi:calendar" class="mr-1" />
              <span>{{ new Date(post.createdAt).toLocaleDateString() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mt-8 text-right">
      <NuxtLink to="/blog/write" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center transition-colors duration-200">
        <Icon icon="mdi:pencil" class="mr-2" />
        글쓰기
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'

const route = useRoute()
const category = computed(() => route.query.category)

const { data: posts, pending, error } = useAsyncData(
  'blogPosts',
  () => $fetch(`/api/blogPosts${category.value ? `?category=${category.value}` : ''}`),
  {
    watch: [category]
  }
)

definePageMeta({
  layout: 'blog'
})
</script>