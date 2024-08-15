<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="post" class="bg-white shadow-md rounded-lg p-6 mb-6">
      <h1 class="text-3xl font-bold mb-4">{{ post.title }}</h1>
      <p class="text-gray-600 mb-2">내용: {{ post.content }}</p>
    </div>
    <div v-if="post" class="flex justify-end space-x-4">
      <button @click="goToList" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-8 rounded flex-grow">
        목록
      </button>
      <button @click="goToEdit" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-8 rounded flex-grow">
        수정
      </button>
      <button @click="deletePost" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-8 rounded flex-grow">
        삭제
      </button>
    </div>
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
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

const goToList = () => {
  router.push('/adminboard');
};

const goToEdit = () => {
  router.push(`/adminboard/edit?id=${route.query.id}`);
};

const deletePost = async () => {
  if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
    const response = await fetch(`/api/adminboard?id=${route.query.id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      alert('게시글이 삭제되었습니다.');
      router.push('/adminboard');
    } else {
      error.value = await response.json();
    }
  }
};

onMounted(fetchPost);
</script>