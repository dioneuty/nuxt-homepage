<template>
    <div class="min-h-screen flex flex-col dark:bg-gray-900">
      <Nav 
        :isMenuOpen="isMenuOpen" 
        @openMenu="openMenu" 
        @closeMenu="closeMenu" 
      />
      <div :class="{ 'lg:pt-0': !navStore.isAlwaysOnTop }">
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
  import { ref, onMounted } from 'vue'
  import Nav from '~/components/Nav.vue'
  import Footer from '~/components/Footer.vue'
  import ScrollToTop from '~/components/common/ScrollToTop.vue'
  import { useNavStore } from '~/stores/navStore'

  const navStore = useNavStore()

  const isMenuOpen = ref(false)

  function openMenu() {
    isMenuOpen.value = true
    document.body.classList.add('menu-open')
  }
  
  function closeMenu() {
    isMenuOpen.value = false
    document.body.classList.remove('menu-open')
  }
  </script>