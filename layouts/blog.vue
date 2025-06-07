<template>
  <div class="flex flex-col min-h-screen">
    <Nav :isMenuOpen="isMenuOpen" @toggleMenu="toggleMenu" @closeMenu="closeMenu" :headerColor="currentHeaderColor" />
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
    <Footer :footerColor="currentFooterColor" />
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
import { ref, computed } from 'vue'
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
const showMobileCategory = ref(true)

const colorMode = useColorMode();

const { data: fetchedThemeSettings } = await useFetch('/api/theme-settings', {
  default: () => ({
    lightHeaderColor: '#FFFFFF',
    darkHeaderColor: '#1A202C',
    lightFooterColor: '#F7FAFC',
    darkFooterColor: '#1A202C',
    lightBackgroundColor: '#FFFFFF',
    darkBackgroundColor: '#1A202C',
  }),
  transform: (data) => ({
    lightHeaderColor: data?.lightHeaderColor || '#FFFFFF',
    darkHeaderColor: data?.darkHeaderColor || '#1A202C',
    lightFooterColor: data?.lightFooterColor || '#F7FAFC',
    darkFooterColor: data?.darkFooterColor || '#1A202C',
    lightBackgroundColor: data?.lightBackgroundColor || '#FFFFFF',
    darkBackgroundColor: data?.darkBackgroundColor || '#1A202C',
  }),
});

const currentHeaderColor = computed(() => {
  return colorMode.value === 'dark' ? fetchedThemeSettings.value.darkHeaderColor : fetchedThemeSettings.value.lightHeaderColor;
});

const currentFooterColor = computed(() => {
  return colorMode.value === 'dark' ? fetchedThemeSettings.value.darkFooterColor : fetchedThemeSettings.value.lightFooterColor;
});

const currentBackgroundColor = computed(() => {
  return colorMode.value === 'dark' ? fetchedThemeSettings.value.darkBackgroundColor : fetchedThemeSettings.value.lightBackgroundColor;
});

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

// 초기 카테고리 로드 및 색상 모드 감지
onMounted(() => {
  fetchCategories();
});

// 카테고리 갱신 함수를 제공
provide('refreshCategories', fetchCategories)
</script>