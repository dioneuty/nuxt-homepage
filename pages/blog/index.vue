<template>
  <BlogIndex
    apiEndpoint="/api/blogPosts"
    writeLink="/blog/write"
    postLink="/blog/view"
  />
</template>

<script setup>
import BlogIndex from '~/components/blog/BlogIndex.vue'

definePageMeta ({
  title: '블로그 - Dion',
  meta: [
    { name: 'description', content: 'Dion의 블로그 글 목록입니다.' },
    { name: 'keywords', content: 'Dion, 블로그, 글 목록' }
  ]
})
</script>