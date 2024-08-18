<template>
  <div :class="{ 'dark': isDarkMode }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Modal />
    <ReplyModal />
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, provide } from 'vue'
import Modal from '~/components/common/Modal.vue'
import ReplyModal from '~/components/common/ReplyModal.vue'

const colorMode = ref('system') // 'light', 'dark', 'system' 중 하나

const isDarkMode = ref(false)

watch(colorMode, (newValue) => {
  if (newValue === 'system') {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  } else {
    isDarkMode.value = newValue === 'dark'
  }
})

watch(isDarkMode, (newValue) => {
  if (newValue) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})

const toggleColorMode = () => {
  if (colorMode.value === 'light') colorMode.value = 'dark' // 라이트 모드
  else if (colorMode.value === 'dark') colorMode.value = 'system' // 다크 모드
  else colorMode.value = 'light' // 시스템 설정
  localStorage.setItem('colorMode', colorMode.value)
}

// 초기 컬러 모드 설정
onMounted(() => {
  const savedColorMode = localStorage.getItem('colorMode')
  if (savedColorMode) {
    colorMode.value = savedColorMode
  }
  if (colorMode.value === 'system') {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  document.documentElement.classList.toggle('dark', isDarkMode.value)

  // 시스템 설정 변경 감지
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (e) => {
    if (colorMode.value === 'system') {
      isDarkMode.value = e.matches
    }
  })
})

provide('isDarkMode', isDarkMode)
provide('toggleColorMode', toggleColorMode)
provide('colorMode', colorMode)
</script>
<style>
html {
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>