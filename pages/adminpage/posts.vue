<!-- pages/adminpage/posts.vue -->
<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4">게시글 관리</h2>
    <p>이곳에서 사이트의 게시글을 관리합니다.</p>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

useHead({
  title: '게시글 관리'
})
</script> 