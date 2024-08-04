<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8 max-w-4xl mx-auto">
      <Carousel :images="images" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <PostList 
        title="Latest Blog Posts" 
        :posts="blogPosts" 
        type="blog"
        headerColorClass="bg-blue-600"
      />
      <PostList 
        title="Latest Board Posts" 
        :posts="boardPosts" 
        type="board"
        headerColorClass="bg-green-600"
      />
    </div>
  </div>
</template>

<script setup>
import Carousel from '@/components/Carousel.vue'
import PostList from '@/components/PostList.vue'

// 각 API에서 데이터 가져오기
const { data: blogPosts } = await useFetch('/api/blogPosts')
const { data: boardPosts } = await useFetch('/api/boardPosts')
const { data: images } = await useFetch('/api/images')
//const { data: posts } = await useFetch('/api/posts')

definePageMeta({
  layout: 'default'
})

</script>