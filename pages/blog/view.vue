<template>
  <BlogView
    :editLink="`/blog/write?id=${$route.query.id}`"
    :listLink="`/blog?category=${currentCategoryId}`"
    apiEndpoint="/api/blogPosts"
    :id="$route.query.id"
  />
</template>

<script setup>
import { useCategoryStore } from '~/stores/categoryStore'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import BlogView from '~/components/blog/BlogView.vue'

const route = useRoute()
const categoryStore = useCategoryStore()
const { currentCategoryId } = storeToRefs(categoryStore)
</script>