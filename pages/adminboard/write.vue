<template>
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">게시글 작성</h1>
      <form @submit.prevent="submitPost">
        <div class="mb-4">
          <label for="title" class="block text-gray-700">제목</label>
          <input type="text" id="title" v-model="post.title" class="w-full px-3 py-2 border rounded" required />
        </div>
        <div class="mb-4">
          <label for="content" class="block text-gray-700">내용</label>
          <textarea id="content" v-model="post.content" class="w-full px-3 py-2 border rounded" rows="5" required></textarea>
        </div>
        <div class="flex justify-end space-x-4">
          <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-8 rounded flex-grow">작성</button>
          <button @click="goToList" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-8 rounded flex-grow">취소</button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const post = ref({ title: '', content: '' });
  
  const submitPost = async () => {
    const response = await fetch('/api/adminboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post.value),
    });
  
    if (response.ok) {
      alert('게시글이 작성되었습니다.');
      router.push('/adminboard');
    } else {
      alert('게시글 작성에 실패했습니다.');
    }
  };

  const goToList = () => {
    router.push('/adminboard');
  };
  </script>