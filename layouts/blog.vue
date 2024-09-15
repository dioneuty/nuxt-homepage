<template>
  <div class="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <Nav :isMenuOpen="isMenuOpen" @toggleMenu="toggleMenu" @closeMenu="closeMenu" />
    <div class="container mt-8 md:mt-16 mx-auto px-4 py-8 flex-grow flex flex-col md:flex-row" :class="{ 'pt-28': navStore.isAlwaysOnTop }">
      <aside class="w-full md:w-1/4 pr-0 md:pr-8 mb-8 md:mb-0 hidden md:block">
        <BlogSidebar :categories="categories" />
      </aside>
      <main class="w-full md:w-3/4">
        <MobileCategoryDropdown 
          v-if="showMobileCategory" 
          :categories="categories" 
          class="md:hidden" 
        />
        <slot />
      </main>
    </div>
    <Footer />
    <ScrollToTop />
    <!-- 배경 오버레이 -->
    <Transition name="fade">
      <div 
        v-if="isMenuOpen" 
        class="fixed inset-0 bg-black bg-opacity-50 z-40"
        @click="closeMenu"
      ></div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Nav from '~/components/Nav.vue'
import Footer from '~/components/Footer.vue'
import BlogSidebar from '~/components/blog/BlogSidebar.vue'
import MobileCategoryDropdown from '~/components/MobileCategoryDropdown.vue'
import ScrollToTop from '~/components/common/ScrollToTop.vue'
import { useRoute } from 'vue-router'
import { useNavStore } from '~/stores/navStore'

const route = useRoute()
const categories = ref([])
const isMenuOpen = ref(false)
const navStore = useNavStore()


async function fetchCategories() {
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

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

// 초기 카테고리 로드
onMounted(fetchCategories)

// 카테고리 갱신 함수를 제공
provide('refreshCategories', fetchCategories)
</script>