<template>
  <div class="prose dark:prose-invert max-w-none" v-html="content"></div>
</template>

<script setup>
const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
/* Tailwind prose 클래스가 대부분의 스타일을 처리합니다. */
/* 필요한 경우 추가 스타일을 여기에 정의할 수 있습니다. */
</style> 