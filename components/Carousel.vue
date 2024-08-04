<template>
    <div class="relative w-full overflow-hidden" style="height: 0; padding-bottom: 56.25%;"> <!-- 16:9 비율 유지 -->
      <div class="absolute inset-0">
        <transition-group name="fade" tag="div" class="h-full">
          <div v-for="(image, index) in images" :key="index" v-show="index === currentIndex" class="absolute inset-0">
            <img :src="image" class="w-full h-full object-cover" alt="Carousel image" />
          </div>
        </transition-group>
      </div>
      <button @click="prev" class="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 z-10">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button @click="next" class="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 z-10">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        <button v-for="(_, index) in images" :key="index" @click="goToSlide(index)" class="w-3 h-3 rounded-full" :class="currentIndex === index ? 'bg-white' : 'bg-gray-300'"></button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const props = defineProps({
    images: {
      type: Array,
      required: true
    }
  })
  
  const currentIndex = ref(0)
  
  const next = () => {
    currentIndex.value = (currentIndex.value + 1) % props.images.length
  }
  
  const prev = () => {
    currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length
  }
  
  const goToSlide = (index) => {
    currentIndex.value = index
  }
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