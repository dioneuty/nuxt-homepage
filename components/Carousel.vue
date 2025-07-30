<template>
  <div class="carousel-wrapper" style="height: 0; padding-bottom: 56.25%;">
    <div class="carousel-slide">
      <transition-group name="fade" tag="div" class="h-full">
        <div v-for="(image, index) in images" :key="index" v-show="index === currentIndex" class="carousel-slide">
          <img :src="image" class="carousel-image" alt="Carousel image" />
        </div>
      </transition-group>
    </div>
    <button @click="prev" @mouseenter="pauseAutoSlide" @mouseleave="resumeAutoSlide" class="carousel-button-left">
      <Icon icon="mdi:chevron-left" class="icon-medium" />
    </button>
    <button @click="next" @mouseenter="pauseAutoSlide" @mouseleave="resumeAutoSlide" class="carousel-button-right">
      <Icon icon="mdi:chevron-right" class="icon-medium" />
    </button>
    <div class="carousel-indicators">
      <button 
        v-for="(_, index) in images" 
        :key="index" 
        @click="goToSlide(index)"
        @mouseenter="pauseAutoSlide"
        @mouseleave="resumeAutoSlide"
        class="carousel-dot" 
        :class="currentIndex === index ? 'carousel-dot-active' : 'carousel-dot-inactive'"
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

/**
 * 다음 슬라이드로 이동하는 함수입니다.
 * 현재 인덱스를 증가시키고 이미지 배열의 길이를 초과하면 처음으로 돌아갑니다.
 */
function next() {
  currentIndex.value = (currentIndex.value + 1) % props.images.length
}

/**
 * 이전 슬라이드로 이동하는 함수입니다.
 * 현재 인덱스를 감소시키고 음수가 되면 마지막으로 돌아갑니다.
 */
function prev() {
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length
}

/**
 * 특정 인덱스의 슬라이드로 직접 이동하는 함수입니다.
 * @param {number} index - 이동할 슬라이드의 인덱스.
 */
function goToSlide(index) {
  currentIndex.value = index
}

/**
 * 자동 슬라이드 기능을 시작하는 함수입니다.
 * 기존 타이머를 제거하고, 설정된 `autoSlideInterval`마다 `next()` 함수를 호출하는 새로운 타이머를 설정합니다.
 */
function startAutoSlide() {
  stopAutoSlide() // 기존 타이머 제거
  autoSlideTimer = setInterval(() => {
    if (!isAutoSlidePaused) {
      next()
    }
  }, props.autoSlideInterval)
}

/**
 * 자동 슬라이드 기능을 중지하는 함수입니다.
 * 현재 실행 중인 `autoSlideTimer`를 해제합니다.
 */
function stopAutoSlide() {
  if (autoSlideTimer) {
    clearInterval(autoSlideTimer)
  }
}

/**
 * 자동 슬라이드 기능을 일시 정지하는 함수입니다.
 * `isAutoSlidePaused` 상태를 `true`로 설정하여 자동 슬라이드를 멈춥니다.
 */
function pauseAutoSlide() {
  isAutoSlidePaused = true
}

/**
 * 일시 정지된 자동 슬라이드 기능을 재개하는 함수입니다.
 * `isAutoSlidePaused` 상태를 `false`로 설정하여 자동 슬라이드를 다시 시작합니다.
 */
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