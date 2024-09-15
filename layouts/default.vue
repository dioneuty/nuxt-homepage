<template>
  <div class="min-h-screen flex flex-col dark:bg-gray-900">
    <Nav 
      :isMenuOpen="isMenuOpen" 
      @openMenu="openMenu" 
      @closeMenu="closeMenu" 
    />
    <div class="flex-grow" :class="{ 'pt-28': isAlwaysOnTop }">
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

const isMenuOpen = ref(false)
const isAlwaysOnTop = ref(false)

onMounted(() => {
  if (process.client) {
    isAlwaysOnTop.value = localStorage.getItem('isAlwaysOnTop') === 'true'
  }
})

// ... 나머지 코드 ...
</script>