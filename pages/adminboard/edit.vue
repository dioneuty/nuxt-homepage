<template>
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">게시글 수정</h1>
      <form @submit.prevent="updatePost">
        <div class="mb-4">
          <label for="title" class="block text-gray-700">제목</label>
          <input type="text" id="title" v-model="post.title" class="w-full px-3 py-2 border rounded" required />
        </div>
        <div class="mb-4">
          <label for="content" class="block text-gray-700">내용</label>
          <textarea id="content" v-model="post.content" class="w-full px-3 py-2 border rounded" rows="5" required></textarea>
        </div>
        <button type="submit" class="bg-blue-500 text-white py-2 px-4 rounded">수정</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  
  const route = useRoute();
  const post = ref({ title: '', content: '' });
  
  const fetchPost = async () => {
    const response = await fetch(`/api/adminboard?id=${route.query.id}`);
    if (response.ok) {
      post.value = await response.json();
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
    } else {
      alert('게시글 수정에 실패했습니다.');
    }
  };
  
  onMounted(fetchPost);
  </script>