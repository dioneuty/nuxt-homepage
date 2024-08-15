<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">게시글 수정</h1>
    <form @submit.prevent="updatePost" v-if="post">
      <div class="mb-4">
        <label for="title" class="block text-gray-700">제목</label>
        <input type="text" id="title" v-model="post.title" class="w-full px-3 py-2 border rounded" required />
      </div>
      <div class="mb-4">
        <label for="content" class="block text-gray-700">내용</label>
        <textarea id="content" v-model="post.content" class="w-full px-3 py-2 border rounded" rows="5" required></textarea>
      </div>
      <div class="flex justify-end space-x-4">
        <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-8 rounded flex-grow">수정</button>
        <button @click="goToList" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-8 rounded flex-grow">취소</button>
      </div>
    </form>
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
      <p class="font-bold">에러</p>
      <p>{{ error.message }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const post = ref(null);
const error = ref(null);

const fetchPost = async () => {
  const response = await fetch(`/api/adminboard?id=${route.query.id}`);
  if (response.ok) {
    post.value = await response.json();
  } else {
    error.value = await response.json();
  }
};

const updatePost = async () => {
  const response = await fetch('/api/adminboard', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: route.query.id, ...post.value }),
  });

  if (response.ok) {
    alert('게시글이 수정되었습니다.');
    router.push('/adminboard');
  } else {
    error.value = await response.json();
  }
};

const goToList = () => {
  router.push('/adminboard');
};

onMounted(fetchPost);
</script>