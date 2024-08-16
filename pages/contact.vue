<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white text-center">문의하기</h1>
    <form @submit.prevent="submitForm" class="max-w-lg mx-auto">
      <div class="mb-4">
        <label for="name" class="block text-gray-700 dark:text-gray-300 font-bold mb-2">이름</label>
        <input type="text" id="name" v-model="form.name" class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
      </div>
      <div class="mb-4">
        <label for="email" class="block text-gray-700 dark:text-gray-300 font-bold mb-2">이메일</label>
        <input type="email" id="email" v-model="form.email" class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
      </div>
      <div class="mb-4">
        <label for="message" class="block text-gray-700 dark:text-gray-300 font-bold mb-2">메시지</label>
        <textarea id="message" v-model="form.message" class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" rows="4" required></textarea>
      </div>
      <button type="submit" class="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">메시지 전송</button>
      <button type="button" @click="goBack" class="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500">이전</button>
    </form>
  </div>
</template>

<script setup>
const form = ref({
  name: '',
  email: '',
  message: ''
})

// 이전 버튼 클릭 시 호출되는 함수
const goBack = () => {
  // 이전 페이지로 이동
  window.history.back();
}

const submitForm = async () => {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value) // 폼 데이터 전송
    });

    if (response.ok) {
      console.log('문의가 성공적으로 전송되었습니다.');
    } else {
      console.error('문의 전송에 실패했습니다.');
    }
  } catch (error) {
    console.error('오류 발생:', error);
  }
}
</script>