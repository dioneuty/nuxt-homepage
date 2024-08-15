<template>
  <div class="container mx-auto px-4 py-8 dark:bg-gray-800 dark:text-white">
    <h1 class="text-3xl font-bold mb-6 flex items-center">
      <Icon icon="mdi:pencil" class="mr-2" />
      문의 수정
    </h1>
    <form @submit.prevent="updateMessage" class="space-y-4 max-w-2xl mx-auto">
      <div>
        <label for="name" class="block text-sm font-medium mb-2 flex items-center">
          <Icon icon="mdi:account" class="mr-2" />
          이름
        </label>
        <input type="text" id="name" v-model="form.name" required
               class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
      </div>
      <div>
        <label for="email" class="block text-sm font-medium mb-2 flex items-center">
          <Icon icon="mdi:email" class="mr-2" />
          이메일
        </label>
        <input type="email" id="email" v-model="form.email" required
               class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
      </div>
      <div>
        <label for="message" class="block text-sm font-medium mb-2 flex items-center">
          <Icon icon="mdi:message-text" class="mr-2" />
          메시지
        </label>
        <textarea id="message" v-model="form.message" rows="4" required
                  class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"></textarea>
      </div>
      <div class="flex justify-between">
        <button type="submit" class="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 flex items-center">
          <Icon icon="mdi:content-save" class="mr-2" />
          수정
        </button>
        <NuxtLink to="/contactboard" class="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 flex items-center">
          <Icon icon="mdi:arrow-left" class="mr-2" />
          목록으로
        </NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';

const route = useRoute();
const router = useRouter();
const form = ref({
  name: '',
  email: '',
  message: ''
});

// ... 기존 스크립트 코드 ...

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
    router.push('/contactboard');
  } else {
    alert('메시지 수정에 실패했습니다.');
  }
};

onMounted(fetchMessage);
</script>