<template>
  <div class="flex flex-col min-h-screen">
    <VerticalSidebar 
      :siteTitle="fetchedThemeSettings.siteTitle"
      :siteLogoIcon="fetchedThemeSettings.siteLogoIcon"
      :backgroundColor="currentHeaderColor"
      v-if="layoutStore.isSidebarOpen"
    />
    <div 
      class="flex-grow transition-all duration-300 ease-in-out"
      :class="{ 'md:ml-64': layoutStore.isSidebarOpen }"
    >
      <Nav 
        :isMenuOpen="isMenuOpen" 
        @toggleMenu="toggleMenu" 
        @closeMenu="closeMenu" 
        v-if="!layoutStore.isSidebarOpen || isMobile"
      />
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import Nav from '~/components/Nav.vue'
import Footer from '~/components/Footer.vue'
import BlogSidebar from '~/components/blog/BlogSidebar.vue'
import MobileCategoryDropdown from '~/components/MobileCategoryDropdown.vue'
import ScrollToTop from '~/components/common/ScrollToTop.vue'
import VerticalSidebar from '~/components/common/VerticalSidebar.vue'
import { useRoute } from 'vue-router'
import { useNavStore } from '~/stores/navStore'
import { useLayoutStore } from '~/stores/layout';

const route = useRoute()
const categories = ref([])
const isMenuOpen = ref(false)
const navStore = useNavStore()
const layoutStore = useLayoutStore();
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
    siteTitle: 'My Website',
    siteLogoUrl: '/images/logo.png',
    siteLogoIcon: null,
  }),
  transform: (data) => ({
    lightHeaderColor: data?.lightHeaderColor || '#FFFFFF',
    darkHeaderColor: data?.darkHeaderColor || '#1A202C',
    lightFooterColor: data?.lightFooterColor || '#F7FAFC',
    darkFooterColor: data?.darkFooterColor || '#1A202C',
    lightBackgroundColor: data?.lightBackgroundColor || '#FFFFFF',
    darkBackgroundColor: data?.darkBackgroundColor || '#1A202C',
    siteTitle: data?.siteTitle || 'My Website',
    siteLogoUrl: data?.siteLogoUrl || '/images/logo.png',
    siteLogoIcon: data?.siteLogoIcon || null,
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

// CSS 변수를 동적으로 업데이트하는 함수
function updateCssVariables() {
  if (process.client) { // 클라이언트 사이드에서만 실행
    document.documentElement.style.setProperty('--header-bg-color', currentHeaderColor.value);
    document.documentElement.style.setProperty('--footer-bg-color', currentFooterColor.value);
  }
}

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

// 카테고리 갱신 함수를 제공
provide('refreshCategories', fetchCategories)

// isMobile 반응형 상태 및 checkMobile 함수 정의
const isMobile = ref(false);
const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024; // Tailwind CSS의 lg 브레이크포인트 기준
};

onMounted(() => {
  fetchCategories();
  updateCssVariables();
  layoutStore.initializeSidebarState(); // 사이드바 상태 초기화
  checkMobile(); // 마운트 시 초기 모바일 상태 확인
  window.addEventListener('resize', checkMobile); // 리사이즈 이벤트 리스너 추가
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile); // 언마운트 시 이벤트 리스너 제거
});

// 테마 색상 또는 모드가 변경될 때 CSS 변수 업데이트
watch([currentHeaderColor, currentFooterColor, currentBackgroundColor, colorMode], () => {
  updateCssVariables();
}, { immediate: true });
</script>