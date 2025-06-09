<template>
  <div 
    class="min-h-screen flex flex-col"
  >
    <Nav 
      :isMenuOpen="isMenuOpen" 
      @openMenu="openMenu" 
      @closeMenu="closeMenu"
    />
    <div class="flex-grow">
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Nav from '~/components/Nav.vue'
import Footer from '~/components/Footer.vue'
import ScrollToTop from '~/components/common/ScrollToTop.vue'

const isMenuOpen = ref(false)

const colorMode = useColorMode();

// useFetch를 사용하여 서버 및 클라이언트에서 테마 설정 데이터를 미리 가져옵니다.
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

// 컴포넌트 마운트 시 CSS 변수 초기 설정
onMounted(() => {
  updateCssVariables();
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