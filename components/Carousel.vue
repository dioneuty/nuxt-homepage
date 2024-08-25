<template>
  <div class="relative w-full overflow-hidden" style="height: 0; padding-bottom: 56.25%;">
    <div class="absolute inset-0">
      <transition-group name="fade" tag="div" class="h-full">
        <div v-for="(image, index) in images" :key="index" v-show="index === currentIndex" class="absolute inset-0">
          <img :src="image" class="w-full h-full object-cover" alt="Carousel image" />
        </div>
      </transition-group>
    </div>
    <button @click="prev" @mouseenter="pauseAutoSlide" @mouseleave="resumeAutoSlide" class="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 z-10">
      <Icon icon="mdi:chevron-left" class="w-6 h-6" />
    </button>
    <button @click="next" @mouseenter="pauseAutoSlide" @mouseleave="resumeAutoSlide" class="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 z-10">
      <Icon icon="mdi:chevron-right" class="w-6 h-6" />
    </button>
    <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
      <button 
        v-for="(_, index) in images" 
        :key="index" 
        @click="goToSlide(index)"
        @mouseenter="pauseAutoSlide"
        @mouseleave="resumeAutoSlide"
        class="w-3 h-3 rounded-full" 
        :class="currentIndex === index ? 'bg-white' : 'bg-gray-300'"
      ></button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  images: {
    type: Array,
    required: true
  },
  autoSlideInterval: {
    type: Number,
    default: 2000 // 5초마다 슬라이드 변경
  }
})

const currentIndex = ref(0)
let autoSlideTimer = null
let isAutoSlidePaused = false

function next() {
  currentIndex.value = (currentIndex.value + 1) % props.images.length
}

function prev() {
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length
}

function goToSlide(index) {
  currentIndex.value = index
}

function startAutoSlide() {
  stopAutoSlide() // 기존 타이머 제거
  autoSlideTimer = setInterval(() => {
    if (!isAutoSlidePaused) {
      next()
    }
  }, props.autoSlideInterval)
}

function stopAutoSlide() {
  if (autoSlideTimer) {
    clearInterval(autoSlideTimer)
  }
}

function pauseAutoSlide() {
  isAutoSlidePaused = true
}

function resumeAutoSlide() {
  isAutoSlidePaused = false
}

onMounted(() => {
  startAutoSlide()
})

onUnmounted(() => {
  stopAutoSlide()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>