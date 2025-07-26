<template>
  <div 
    class="min-h-screen flex flex-col bg-white dark:bg-gray-900"
  >
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
        @openMenu="openMenu" 
        @closeMenu="closeMenu"
      />
      <!-- 모바일에서 fixed 헤더를 위한 패딩 추가 -->
      <div class="flex-grow pb-12 pt-16 lg:pt-0">
        <slot />
      </div>
      <Footer />
      <ScrollToTop />
      
      <!-- 배경 오버레이 -->
      <div
        v-if="isMenuOpen"
        class="fixed inset-0 bg-black bg-opacity-50 z-40"
        @click.self="closeMenu"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Nav from '~/components/Nav.vue'
import Footer from '~/components/Footer.vue'
import ScrollToTop from '~/components/common/ScrollToTop.vue'
import VerticalSidebar from '~/components/common/VerticalSidebar.vue'
import { useLayoutStore } from '~/stores/layout'
import { useThemeSettings } from '~/composables/useThemeSettings';

const layoutStore = useLayoutStore()

const isMenuOpen = ref(false)

const colorMode = useColorMode();

// useThemeSettings 컴포저블을 사용하여 테마 설정 데이터를 가져옵니다.
const { data: fetchedThemeSettings } = await useThemeSettings();

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

// 컴포넌트 마운트 시 CSS 변수 초기 설정
onMounted(() => {
  updateCssVariables();
  layoutStore.initializeSidebarState(); // 사이드바 상태 초기화
});

// 테마 색상 또는 모드가 변경될 때 CSS 변수 업데이트
watch([currentHeaderColor, currentFooterColor, currentBackgroundColor, colorMode], () => {
  updateCssVariables();
}, { immediate: true });

function openMenu() {
  isMenuOpen.value = true
  document.body.classList.add('menu-open')
}

function closeMenu() {
  isMenuOpen.value = false
  document.body.classList.remove('menu-open')
}
</script>

<style>
html {
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>