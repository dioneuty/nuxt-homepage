<template>
    <div class="container mx-auto px-4 py-8">
      <div v-if="message" class="bg-white shadow-md rounded-lg overflow-hidden dark:bg-gray-800 dark:text-white">
        <div class="p-6">
          <h1 class="text-3xl font-bold mb-4">{{ message.name }}</h1>
          <p class="text-gray-600 dark:text-gray-300 mb-2">이메일: {{ message.email }}</p>
          <p class="text-gray-600 dark:text-gray-300 mb-4">메시지: {{ message.message }}</p>
        </div>
      </div>
      <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 dark:bg-gray-800 dark:text-red-400" role="alert">
        <p class="font-bold">에러</p>
        <p>{{ error.message }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  
  const route = useRoute();
  const message = ref(null);
  const error = ref(null);
  
  // 문의 상세 정보 가져오기
  const fetchMessage = async () => {
    const response = await fetch(`/api/contact?id=${route.query.id}`);
    if (response.ok) {
      message.value = await response.json();
    } else {
      error.value = await response.json();
    }
  };
  
  // 컴포넌트 마운트 시 문의 상세 정보 가져오기
  onMounted(fetchMessage);
  </script>