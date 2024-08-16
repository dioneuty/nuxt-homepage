<template>
  <BlogIndex
    apiEndpoint="/api/blogPosts"
    writeLink="/blog/write"
    postLink="/blog/view"
  />
</template>

<script setup>
import BlogIndex from '~/components/blog/BlogIndex.vue'
</script>