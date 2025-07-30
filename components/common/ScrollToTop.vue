<template>
  <transition name="fade">
    <button
      v-show="showButton"
      @click="scrollToTop"
      class="scroll-to-top-btn"
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
  
/**
 * 스크롤 위치를 확인하여 상단으로 이동 버튼의 가시성을 제어하는 함수입니다.
 * 페이지 상단으로부터 300px 이상 스크롤되면 버튼을 표시하고, 그렇지 않으면 숨깁니다.
 */
function checkScroll() {
  showButton.value = window.pageYOffset > 300
}
  
/**
 * 페이지를 최상단으로 부드럽게 스크롤하는 함수입니다.
 */
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