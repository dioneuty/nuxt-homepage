<template>
  <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 sticky top-4">
    <h2 class="text-2xl font-bold mb-6 text-gray-800 dark:text-white border-b pb-2 flex items-center">
      <Icon icon="icon-park-outline:category" class="mr-2" />
      카테고리
    </h2>
    <ul class="space-y-2">
      <li v-for="(category, index) in categories" :key="index">
        <NuxtLink 
          :to="category.id === '0' ? '/blog?category=0' : `/blog?category=${category.id}`" 
          class="block py-2 px-4 rounded-md transition-colors duration-200 ease-in-out flex items-center justify-between"
          :class="[
            $route.query.category == category.id
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900'
          ]"
        >
          <span>{{ category.name }}</span>
          <span class="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs">
            {{ category.post_count }}
          </span>
        </NuxtLink>
      </li>
    </ul>
    <NuxtLink 
      to="/blog/edit-categories"
      class="block w-full text-center py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 ease-in-out mt-6 flex items-center justify-center"
    >
      <Icon icon="icon-park-outline:edit" class="mr-2" />
      카테고리 편집
    </NuxtLink>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';

defineProps({
  categories: {
    type: Array,
    required: true
  }
})
</script>