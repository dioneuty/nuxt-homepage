<template>
  <div class="min-h-screen flex flex-col dark:bg-gray-900">
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
import { ref, onMounted } from 'vue'
import Nav from '~/components/Nav.vue'
import Footer from '~/components/Footer.vue'
import ScrollToTop from '~/components/common/ScrollToTop.vue'

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