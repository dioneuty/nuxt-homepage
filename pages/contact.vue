<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white text-center">
      <Icon icon="mdi:email-outline" class="inline-block mr-2 text-blue-500" />
      문의하기
    </h1>
    <form @submit.prevent="submitForm" class="max-w-lg mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <!--제목-->
      <div class="mb-4">
        <label for="title" class="block text-gray-700 dark:text-gray-300 font-bold mb-2">
          <Icon icon="mdi:form-textbox" class="inline-block mr-2" />
          제목 <span class="text-red-500">*</span>
        </label>
        <input type="text" id="title" v-model="form.title" class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
      </div>
      <!--이름-->
      <div class="mb-4">
        <label for="author" class="block text-gray-700 dark:text-gray-300 font-bold mb-2">
          <Icon icon="mdi:account" class="inline-block mr-2" />
          이름 <span class="text-red-500">*</span>
        </label>
        <input type="text" id="author" v-model="form.author" class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
      </div>
      <!--이메일-->
      <div class="mb-4">
        <label for="email" class="block text-gray-700 dark:text-gray-300 font-bold mb-2">
          <Icon icon="mdi:email" class="inline-block mr-2" />
          이메일 <span class="text-red-500">*</span>
        </label>
        <input type="email" id="email" v-model="form.email" class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
      </div>
      <!--메시지-->
      <div class="mb-4">
        <label for="content" class="block text-gray-700 dark:text-gray-300 font-bold mb-2">
          <Icon icon="mdi:message-text" class="inline-block mr-2" />
          메시지 <span class="text-red-500">*</span>
        </label>
        <textarea id="content" v-model="form.content" class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" rows="4" required></textarea>
      </div>
      <!--버튼-->
      <div class="flex justify-between">
        <button type="submit" class="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
          <Icon icon="mdi:send" class="inline-block mr-2" />
          메시지 전송
        </button>
        <button type="button" @click="goBack" class="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500">
          <Icon icon="mdi:arrow-left" class="inline-block mr-2" />
          이전
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';

const form = ref({
  name: '',
  email: '',
  message: ''
})

// 이전 버튼 클릭 시 호출되는 함수
function goBack() {
  // 이전 페이지로 이동
  window.history.back();
}

async function submitForm() {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value) // 폼 데이터 전송
    });
    const { openModal } = useModal();
    const router = useRouter();

    if (response.ok) {
      openModal('성공', '문의가 성공적으로 전송되었습니다.', () => {
        router.push('/');
      });
    } else {
      openModal('오류', '문의 전송에 실패했습니다. 다시 시도해 주세요.');
    }
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

definePageMeta ({
  title: '문의하기 - Dion',
  meta: [
    { name: 'description', content: '문의 - Dion' },
    { name: 'keywords', content: 'Dion, 문의' }
  ]
})
</script>