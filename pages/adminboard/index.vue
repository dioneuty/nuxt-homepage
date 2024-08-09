<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">게시판 목록</h1>
    <table class="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th class="px-6 py-3 text-left">제목</th>
          <th class="px-6 py-3 text-left">작성자</th>
          <th class="px-6 py-3 text-left">작성일</th>
          <th class="px-6 py-3 text-left">작업</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="post in posts.posts" :key="post.id">
          <td class="px-6 py-4">{{ post.title }}</td>
          <td class="px-6 py-4">{{ post.author }}</td>
          <td class="px-6 py-4">{{ post.createdAt }}</td>
          <td class="px-6 py-4">
            <NuxtLink :to="`/adminboard/view?id=${post.id}`" class="text-blue-500">보기</NuxtLink>
            <NuxtLink :to="`/adminboard/edit?id=${post.id}`" class="text-blue-500 ml-2">수정</NuxtLink>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const { data: posts, error } = await useAsyncData('adminPosts', () => 
  $fetch('/api/adminboard')
)

if (error.value) {
  console.error('게시글을 불러오는 데 실패했습니다:', error.value)
}
</script>