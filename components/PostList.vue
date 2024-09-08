<template>
  <div class="post-list bg-white dark:bg-gray-800">
    <div :class="['post-list-header text-white flex items-center', headerColorClass]">
      <slot name="icon"></slot>
      <h2 class="font-semibold">{{ title }}</h2>
    </div>
    <ul class="divide-y divide-gray-100 dark:divide-gray-700">
      <li v-for="post in posts" :key="post.id" class="post-list-item hover:bg-gray-50 dark:hover:bg-gray-700">
        <NuxtLink :to="`/${type}?id=${post.id}`" class="block">
          <div class="flex justify-between items-center">
            <span class="text-gray-900 dark:text-gray-100 truncate">{{ post.title }}</span>
            <span class="text-gray-500 dark:text-gray-400 text-xs">{{ formatDate(post.createdAt) }}</span>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  posts: Array,
  type: String,
  headerColorClass: String
})

function formatDate(date) {
  return new Date(date).toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}
</script>

<style scoped>
.post-list-header {
  @apply px-3 py-2 text-sm;
}
.post-list-item {
  @apply px-3 py-2;
}
.post-list-item a {
  @apply block;
}
</style>