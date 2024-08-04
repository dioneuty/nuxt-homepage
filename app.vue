<template>
  <div :class="{ 'dark': isDarkMode }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, provide } from 'vue'

const isDarkMode = ref(false)

watch(isDarkMode, (newValue) => {
  if (newValue) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('darkMode', isDarkMode.value)
}

// 초기 다크 모드 상태 설정
onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode !== null) {
    isDarkMode.value = JSON.parse(savedDarkMode)
    document.documentElement.classList.toggle('dark', isDarkMode.value)
  }
})

// isDarkMode를 provide하여 모든 자식 컴포넌트에서 사용할 수 있게 함
provide('isDarkMode', isDarkMode)
provide('toggleDarkMode', toggleDarkMode)
</script>