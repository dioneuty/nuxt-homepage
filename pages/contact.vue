<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Contact Us</h1>
    <form @submit.prevent="submitForm" class="max-w-lg mx-auto">
      <div class="mb-4">
        <label for="name" class="block text-gray-700 dark:text-gray-300 font-bold mb-2">Name</label>
        <input type="text" id="name" v-model="form.name" class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
      </div>
      <div class="mb-4">
        <label for="email" class="block text-gray-700 dark:text-gray-300 font-bold mb-2">Email</label>
        <input type="email" id="email" v-model="form.email" class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
      </div>
      <div class="mb-4">
        <label for="message" class="block text-gray-700 dark:text-gray-300 font-bold mb-2">Message</label>
        <textarea id="message" v-model="form.message" class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" rows="4" required></textarea>
      </div>
      <button type="submit" class="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">Send Message</button>
    </form>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default'
})

const form = ref({
  name: '',
  email: '',
  message: ''
})

const submitForm = () => {
  // 여기에 폼 제출 로직을 구현합니다.
  console.log('Form submitted:', form.value)
  // API 호출 또는 다른 처리를 수행할 수 있습니다.
}
</script>