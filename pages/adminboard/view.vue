<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="post" class="bg-white shadow-md rounded-lg p-6">
      <h1 class="text-3xl font-bold mb-4">{{ post.title }}</h1>
      <p class="text-gray-600 mb-2">내용: {{ post.content }}</p>
    </div>
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
      <p class="font-bold">에러</p>
      <p>{{ error.message }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
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

onMounted(fetchPost);
</script>