<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 dark:text-white">Our Services</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="service in services" :key="service.id" class="bg-white shadow-md rounded-lg p-6 dark:bg-gray-800 dark:text-white">
        <h2 class="text-xl font-semibold mb-2">{{ service.title }}</h2>
        <p class="text-gray-600 dark:text-white">{{ service.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default'
})

const services = ref([
  { id: 1, title: 'Web Development', description: '최신 기술을 활용한 웹 개발 서비스를 제공합니다.' },
  { id: 2, title: 'Mobile App Development', description: 'iOS 및 Android 앱 개발 서비스를 제공합니다.' },
  { id: 3, title: 'UI/UX Design', description: '사용자 중심의 디자인 서비스를 제공합니다.' },
  // 추가 서비스...
])
</script>