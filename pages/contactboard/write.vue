<template>
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6 dark:text-white">새 문의 작성</h1>
      <form @submit.prevent="submitMessage" class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">이름</label>
          <input type="text" id="name" v-model="form.name" required
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">이메일</label>
          <input type="email" id="email" v-model="form.email" required
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>
        <div>
          <label for="message" class="block text-sm font-medium text-gray-700 dark:text-gray-300">메시지</label>
          <textarea id="message" v-model="form.message" rows="4" required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
        </div>
        <button type="submit" class="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600">전송</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const form = ref({
    name: '',
    email: '',
    message: ''
  });
  
  // 문의 메시지 전송
  const submitMessage = async () => {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    });
  
    if (response.ok) {
      alert('문의가 성공적으로 전송되었습니다.');
      // 추가적인 성공 처리 로직
    } else {
      alert('문의 전송에 실패했습니다.');
    }
  };
  </script>