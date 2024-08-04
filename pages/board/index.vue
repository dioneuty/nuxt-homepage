<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">게시판</h1>
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">번호</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작성일</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="post in posts" :key="post.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ post.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <NuxtLink :to="`/board/${post.id}`" class="text-sm font-medium text-blue-600 hover:text-blue-800">
                {{ post.title }}
              </NuxtLink>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ new Date().toLocaleDateString() }} <!-- 실제 데이터로 교체 필요 -->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-6">
      <NuxtLink to="/board/new" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        새 글 작성
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const { data: posts } = await useFetch('/api/boardPosts')
</script>