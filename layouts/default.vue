<template>
  <div class="min-h-screen flex flex-col dark:bg-gray-900">
    <Nav 
      :isMenuOpen="isMenuOpen" 
      @openMenu="openMenu" 
      @closeMenu="closeMenu" 
    />
    <div class="flex-grow pt-16">
      <slot />
    </div>
    <Footer />
    <!-- 배경 오버레이 -->
    <div
      v-if="isMenuOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40"
      @click.self="closeMenu"
    ></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Nav from '~/components/Nav.vue'
import Footer from '~/components/Footer.vue'

const isMenuOpen = ref(false)

const openMenu = () => {
  isMenuOpen.value = true
  document.body.classList.add('menu-open')
}

const closeMenu = () => {
  isMenuOpen.value = false
  document.body.classList.remove('menu-open')
}
</script>