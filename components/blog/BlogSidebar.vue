<template>
  <div class="sidebar">
    <h2 class="sidebar-title">
      <Icon icon="icon-park-outline:category" class="mr-2" />
      카테고리
    </h2>
    <ul class="sidebar-list">
      <li v-for="(category, index) in categories" :key="index">
        <NuxtLink 
          :to="category.id === '0' ? '/blog?category=0' : `/blog?category=${category.id}`" 
          class="sidebar-link"
          :class="$route.query.category == category.id ? 'sidebar-link-active' : 'sidebar-link-inactive'"
        >
          <span>{{ category.name }}</span>
          <span class="sidebar-badge">
            {{ category.post_count }}
          </span>
        </NuxtLink>
      </li>
    </ul>
    <NuxtLink 
      to="/blog/edit-categories"
      class="sidebar-action-button"
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