<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 dark:text-white flex items-center">
      <Icon icon="mdi:translate" class="mr-2" />
      영어 학습
    </h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4 dark:text-white">영어 학습 자료</h2>
        <ul class="list-disc list-inside dark:text-gray-300">
          <li>기초 문법</li>
          <li>단어장</li>
          <li>회화 연습</li>
          <li>리스닝 자료</li>
        </ul>
      </div>
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4 dark:text-white">추천 학습 방법</h2>
        <p class="dark:text-gray-300">
          매일 30분씩 영어 공부를 하는 것이 효과적입니다. 듣기, 말하기, 읽기, 쓰기를 골고루 연습하세요.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'

definePageMeta({
  title: '영어 학습 - Dion',
  meta: [
    { name: 'description', content: 'Dion - 영어 학습 페이지' },
    { name: 'keywords', content: 'Dion, 영어, 학습, 외국어' }
  ]
})
</script>