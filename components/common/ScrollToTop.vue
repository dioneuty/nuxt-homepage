<template>
  <transition name="fade">
    <button
      v-show="showButton"
      @click="scrollToTop"
      class="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-all duration-300 z-50"
      aria-label="페이지 상단으로 이동"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  </transition>
</template>
  
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
  
const showButton = ref(false)
  
function checkScroll() {
  showButton.value = window.pageYOffset > 300
}
  
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
  
onMounted(() => {
  window.addEventListener('scroll', checkScroll)
})
  
onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
})
</script>
  
<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>