// stores/categoryStore.js
import { defineStore } from 'pinia'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
    currentCategory: null
  }),
  actions: {
    async fetchCategories() {
      //$fetch 사용
      const categories = await $fetch('/api/categories')
      this.categories = categories
    },
    updateCategoryCount(categoryId, increment = true) {
      const category = this.categories.find(c => c.id === categoryId)
      if (category) {
        category.post_count += increment ? 1 : -1
      }
    },
    setCurrentCategory(category) {
      this.currentCategory = category
    }
  }
})