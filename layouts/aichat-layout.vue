<template>
    <div class="min-h-screen flex flex-col dark:bg-gray-900">
      <Nav 
        :isMenuOpen="isMenuOpen" 
        @openMenu="openMenu" 
        @closeMenu="closeMenu" 
      />
      <div :class="{ 'pt-[2.5rem]': isNavFixed, 'lg:pt-0': !isNavFixed }">
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
  import { ref, computed } from 'vue'
  import Nav from '~/components/Nav.vue'
  import Footer from '~/components/Footer.vue'
  import ScrollToTop from '~/components/common/ScrollToTop.vue'
  import { useNavStore } from '~/stores/navStore'

  const isMenuOpen = ref(false)
  const navStore = useNavStore()
  const isNavFixed = computed(() => navStore.isAlwaysOnTop)

  function openMenu() {
    isMenuOpen.value = true
    document.body.classList.add('menu-open')
  }
  
  function closeMenu() {
    isMenuOpen.value = false
    document.body.classList.remove('menu-open')
  }
  </script>