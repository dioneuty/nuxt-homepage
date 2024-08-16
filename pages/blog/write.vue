<template>
  <BlogWrite
    :apiEndpoint="apiEndpoint"
    :listPath="listPath"
  />
</template>

<script setup>
import BlogWrite from '~/components/blog/BlogWrite.vue'

const apiEndpoint = '/api/blogPosts'
const listPath = '/blog'
</script>