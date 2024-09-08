<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <PostList 
      title="최신 블로그 포스트" 
      :posts="blogPosts" 
      type="blog/view"
      headerColorClass="bg-blue-600"
    >
      <template #icon>
        <Icon icon="mdi:post-outline" class="w-6 h-6 mr-2" />
      </template>
    </PostList>
    <PostList 
      title="최신 게시판 글" 
      :posts="boardPosts.posts" 
      type="board/view"
      headerColorClass="bg-green-600"
    >
      <template #icon>
        <Icon icon="mdi:forum-outline" class="w-6 h-6 mr-2" />
      </template>
    </PostList>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import PostList from '@/components/PostList.vue'

const { data: blogPosts } = await useFetch('/api/blogPosts')
const { data: boardPosts } = await useFetch('/api/boardPosts')
</script>