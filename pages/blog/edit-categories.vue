<template>
  <BlogEditCategory
    :writeLink="`/blog/write`"
    :listLink="`/blog?category=${currentCategoryId}`"
    apiEndpoint="/api/categories"
  />
</template>

<script setup>
import { useCategoryStore } from '~/stores/categoryStore'
import { storeToRefs } from 'pinia'
import BlogEditCategory from '~/components/blog/BlogEditCategory.vue';

const categoryStore = useCategoryStore()
const { currentCategoryId } = storeToRefs(categoryStore)
</script>