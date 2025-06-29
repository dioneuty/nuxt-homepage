<template>
    <div class="min-h-screen flex flex-col">
      <VerticalSidebar 
        :siteTitle="fetchedThemeSettings.siteTitle"
        :siteLogoIcon="fetchedThemeSettings.siteLogoIcon"
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
          :headerColor="currentHeaderColor"
        />
        <!-- 전역 탭 바 -->
        <GlobalTabBar />
        <div :class="{ 'lg:pt-0': !navStore.isAlwaysOnTop }">
          <slot />
        </div>
        <Footer :footerColor="currentFooterColor" />
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
  import { ref, onMounted, computed, watch } from 'vue'
  import Nav from '~/components/Nav.vue'
  import Footer from '~/components/Footer.vue'
  import ScrollToTop from '~/components/common/ScrollToTop.vue'
  import VerticalSidebar from '~/components/common/VerticalSidebar.vue'
  import GlobalTabBar from '~/components/tab/GlobalTabBar.vue'
  import { useNavStore } from '~/stores/navStore'
  import { useLayoutStore } from '~/stores/layout';
  
  const navStore = useNavStore()
  const layoutStore = useLayoutStore();
  
  const isMenuOpen = ref(false)
  
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
  
  // currentBackgroundColor가 변경될 때마다 body의 배경색을 업데이트합니다.
  onMounted(() => {
    watch(currentBackgroundColor, (newColor) => {
      document.body.style.backgroundColor = newColor;
    }, { immediate: true }); // 컴포넌트 마운트 시 즉시 실행
    layoutStore.initializeSidebarState(); // 사이드바 상태 초기화
  });

  function openMenu() {
    isMenuOpen.value = true
    document.body.classList.add('menu-open')
  }
  
  function closeMenu() {
    isMenuOpen.value = false
    document.body.classList.remove('menu-open')
  }
  </script>