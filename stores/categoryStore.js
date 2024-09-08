// stores/categoryStore.js
import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref([])
  const currentCategory = ref(null)

  async function fetchCategories() {
    categories.value = await $fetch('/api/categories')
  }

  function updateCategoryCount(categoryId, increment = true) {
    const category = categories.value.find(c => c.id === categoryId)
    if (category) {
      category.post_count += increment ? 1 : -1
    }
  }

  function setCurrentCategory(category) {
    currentCategory.value = category
  }

  return {
    categories,
    currentCategory,
    fetchCategories,
    updateCategoryCount,
    setCurrentCategory
  }
})