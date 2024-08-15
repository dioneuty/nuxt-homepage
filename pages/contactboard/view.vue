<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="message" class="bg-white shadow-md rounded-lg overflow-hidden dark:bg-gray-800 dark:text-white mb-6">
      <div class="p-6">
        <h1 class="text-3xl font-bold mb-4 flex items-center">
          <Icon icon="mdi:eye" class="mr-2" />
          {{ message.name }}
        </h1>
        <p class="text-gray-600 dark:text-gray-300 mb-2 flex items-center">
          <Icon icon="mdi:email" class="mr-2" />
          이메일: {{ message.email }}
        </p>
        <p class="text-gray-600 dark:text-gray-300 mb-4 flex items-center">
          <Icon icon="mdi:message-text" class="mr-2" />
          메시지: {{ message.message }}
        </p>
      </div>
    </div>
    <div v-if="message" class="flex justify-end mt-6 space-x-4">
      <button @click="goToList" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-8 rounded flex-grow">
        <Icon icon="mdi:format-list-bulleted" class="mr-2" />
        목록
      </button>
      <button @click="deleteMessage" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-8 rounded flex-grow">
        <Icon icon="mdi:delete" class="mr-2" />
        삭제
      </button>
    </div>
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 dark:bg-gray-800 dark:text-red-400" role="alert">
      <p class="font-bold">에러</p>
      <p>{{ error.message }}</p>
    </div>
  </div>
</template>
  
<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
  
const route = useRoute();
const router = useRouter();
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

// 목록 페이지로 이동
const goToList = () => {
  router.push('/contactboard');
};

// 메시지 삭제
const deleteMessage = async () => {
  if (confirm('정말로 이 메시지를 삭제하시겠습니까?')) {
    const response = await fetch(`/api/contact?id=${route.query.id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      alert('메시지가 삭제되었습니다.');
      router.push('/contactboard');
    } else {
      error.value = await response.json();
    }
  }
};
</script>