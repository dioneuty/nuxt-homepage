<template>
  <div class="grid-posts">
    <PostList 
      title="최신 블로그 포스트" 
      :posts="blogPosts" 
      type="blog/view"
      headerColorClass="bg-blue-600"
    >
      <template #icon>
        <Icon icon="mdi:post-outline" class="icon-medium mr-2" />
      </template>
    </PostList>
    <PostList 
      title="최신 게시판 글" 
      :posts="boardPosts.posts" 
      type="board/view"
      headerColorClass="bg-green-600"
    >
      <template #icon>
        <Icon icon="mdi:forum-outline" class="icon-medium mr-2" />
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