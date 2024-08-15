<template>
    <div class="container mx-auto px-4 py-8 dark:bg-gray-800 dark:text-white">
      <h1 class="text-3xl font-bold mb-6 flex items-center">
        <Icon icon="mdi:eye" class="mr-2" />
        문의 보기
      </h1>
      <div class="bg-white dark:bg-gray-700 shadow-md rounded-lg overflow-hidden">
        <div class="p-4">
          <h2 class="text-xl font-semibold mb-2 flex items-center">
            <Icon icon="mdi:account" class="mr-2" />
            이름: {{ message.name }}
          </h2>
          <p class="text-gray-600 dark:text-gray-300 mb-2 flex items-center">
            <Icon icon="mdi:email" class="mr-2" />
            이메일: {{ message.email }}
          </p>
          <div class="mb-4">
            <h3 class="text-lg font-semibold mb-2 flex items-center">
              <Icon icon="mdi:message-text" class="mr-2" />
              메시지
            </h3>
            <p class="dark:text-gray-300">{{ message.message }}</p>
          </div>
          <div class="flex justify-between">
            <NuxtLink to="/contactboard" class="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 flex items-center">
              <Icon icon="mdi:arrow-left" class="mr-2" />
              목록으로
            </NuxtLink>
            <NuxtLink :to="`/contactboard/edit?id=${message.id}`" class="bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-600 flex items-center">
              <Icon icon="mdi:pencil" class="mr-2" />
              수정
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { Icon } from '@iconify/vue';

  const route = useRoute();
  const message = ref({});

  onMounted(async () => {
    const response = await fetch(`/api/contact/${route.query.id}`);
    message.value = await response.json();
  });
  </script>