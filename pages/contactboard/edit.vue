<template>
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6 dark:text-white">문의 수정</h1>
      <form @submit.prevent="updateMessage" class="space-y-4">
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
        <button type="submit" class="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600">수정</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  
  const route = useRoute();
  const form = ref({
    name: '',
    email: '',
    message: ''
  });
  
  // 문의 메시지 수정
  const fetchMessage = async () => {
    const response = await fetch(`/api/contact?id=${route.query.id}`);
    if (response.ok) {
      const message = await response.json();
      form.value = { name: message.name, email: message.email, message: message.message };
    }
  };
  
  const updateMessage = async () => {
    const response = await fetch('/api/contact', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: route.query.id, ...form.value })
    });
  
    if (response.ok) {
      alert('메시지가 성공적으로 수정되었습니다.');
    } else {
      alert('메시지 수정에 실패했습니다.');
    }
  };
  
  onMounted(fetchMessage);
</script>
  