<template>
  <div class="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <Nav />
    <div class="container mx-auto px-4 py-8 flex-grow flex flex-col md:flex-row">
      <aside class="w-full md:w-1/4 pr-0 md:pr-8 mb-8 md:mb-0 hidden md:block">
        <BlogSidebar :categories="categories" />
      </aside>
      <main class="w-full md:w-3/4">
        <MobileCategoryDropdown :categories="categories" class="md:hidden" />
        <slot />
      </main>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import Nav from '~/components/Nav.vue'
import Footer from '~/components/Footer.vue'
import BlogSidebar from '~/components/BlogSidebar.vue'
import MobileCategoryDropdown from '~/components/MobileCategoryDropdown.vue'
import { ref, provide } from 'vue'

const categories = ref([])

const fetchCategories = async () => {
  try {
    const response = await fetch('/api/categories?include=uncategorized_all')
    if (!response.ok) {
      throw new Error('Failed to fetch categories')
    }
    categories.value = await response.json()
  } catch (error) {
    console.error('카테고리를 불러오는 데 실패했습니다:', error)
  }
}

// 초기 카테고리 로드
onMounted(fetchCategories)

// 카테고리 갱신 함수를 제공
provide('refreshCategories', fetchCategories)
</script>