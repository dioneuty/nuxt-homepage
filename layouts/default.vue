<template>
  <div class="min-h-screen flex flex-col dark:bg-gray-900">
    <Nav :isMenuOpen="isMenuOpen" @toggleMenu="toggleMenu" @closeMenu="closeMenu" />
    <div class="flex-grow md:pt-0 pt-16">
      <slot />
    </div>
    <Footer />
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
import { ref } from 'vue'
import Nav from '~/components/Nav.vue'
import Footer from '~/components/Footer.vue'

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}
</script>