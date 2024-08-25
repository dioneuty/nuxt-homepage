<template>
  <div class="mt-10">
    <select 
      v-model="selectedCategory" 
      @change="onCategoryChange"
      class="w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
    >
      <option value="0">전체 카테고리</option>
      <option v-for="category in categories" :key="category.id" :value="category.id"
              :class="{ 'font-bold': isSelected(category.id) }">
        {{ category.name }} ({{ category.post_count }})
      </option>
    </select>
    <NuxtLink 
      to="/blog/edit-categories"
      class="block w-full text-center py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 ease-in-out"
    >
      카테고리 편집
    </NuxtLink>
  </div>
</template>
  
<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
  
defineProps({
  categories: {
    type: Array,
    required: true
  }
})
  
const route = useRoute()
const router = useRouter()
  
const selectedCategory = ref(route.query.category || '0')
  
function onCategoryChange() {
  if (selectedCategory.value === '0') {
    router.push({ query: { ...route.query, category: undefined } })
  } else {
    router.push({ query: { ...route.query, category: selectedCategory.value } })
  }
}
  
watch(() => route.query.category, (newCategory) => {
  selectedCategory.value = newCategory || '0'
})

function isSelected(categoryId) {
  return selectedCategory.value === categoryId.toString()
}
</script>

<style scoped>
select option:checked {
  font-weight: bold;
  background-color: #3b82f6;
  color: white;
}
</style>