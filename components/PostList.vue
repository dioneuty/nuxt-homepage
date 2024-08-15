<template>
  <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
    <div :class="['p-4 text-white flex items-center', headerColorClass]">
      <slot name="icon"></slot>
      <h2 class="text-xl font-semibold">{{ title }}</h2>
    </div>
    <ul class="divide-y divide-gray-200 dark:divide-gray-700">
      <li v-for="post in posts" :key="post.id" class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
        <NuxtLink :to="`/${type}/${post.id}`" class="block">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ post.title }}</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ post.excerpt }}</p>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  posts: Array,
  type: {
    type: String,
    required: true,
    validator: (value) => ['blog', 'board'].includes(value)
  },
  headerColorClass: {
    type: String,
    default: 'bg-blue-600'
  }
})
</script>