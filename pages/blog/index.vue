<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold dark:text-white">블로그 포스트</h1>
      <NuxtLink to="/blog/new" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        새 글 작성
      </NuxtLink>
    </div>

    <!-- 로딩 상태 표시 -->
    <p v-if="pending">로딩 중...</p>
    
    <!-- 에러 메시지 표시 -->
    <p v-else-if="error">에러 발생: {{ error.message }}</p>

    <!-- 블로그 포스트 목록 -->
    <template v-else-if="blogPosts.length">
      <ul class="space-y-4">
        <li v-for="post in blogPosts" :key="post.id" class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 hover:shadow-lg transition duration-300">
          <NuxtLink :to="`/blog/${post.id}`" class="block">
            <h2 class="text-xl font-semibold mb-2 text-blue-600 hover:text-blue-800 dark:text-gray-300">{{ post.title }}</h2>
            <p class="text-gray-600 mb-4 dark:text-gray-500">{{ getExcerpt(post.content) }}</p>
            <div class="flex justify-between items-center text-sm text-gray-500">
              <span>{{ post.date }}</span>
              <span>{{ post.author }}</span>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default'
})

// 포스트 데이터를 가져오는 로직을 여기에 추가하세요
// const posts = ref([
//   // 예시 데이터
//   { id: 1, title: '첫 번째 포스트', excerpt: '이것은 첫 번째 포스트의 요약입니다.', date: '2023-04-01', author: '홍길동' },
//   { id: 2, title: '두 번째 포스트', excerpt: '이것은 두 번째 포스트의 요약입니다.', date: '2023-04-02', author: '김철수' },
//   // 추가 포스트...
// ])

// API에서 블로그 포스트 데이터 가져오기
const { data: blogPosts = [], pending, error } = await useFetch('/api/blogPosts')

const getExcerpt = (content) => {
  const words = content.split(' ');
  return words.length > 20 ? words.slice(0, 20).join(' ') + '...' : content;
};

</script>