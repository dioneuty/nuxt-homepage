<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">질문 작성하기</h1>
    <form @submit.prevent="submitQuestion" class="max-w-2xl mx-auto">
      <div class="mb-4">
        <label for="questionTitle" class="block mb-2 font-bold">제목</label>
        <input v-model="questionTitle" id="questionTitle" type="text" class="w-full p-2 border rounded" required>
      </div>
      <div class="mb-4">
        <label for="questionContent" class="block mb-2 font-bold">내용</label>
        <textarea v-model="questionContent" id="questionContent" rows="5" class="w-full p-2 border rounded" required></textarea>
      </div>
      <div class="flex justify-between">
        <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          질문 등록
        </button>
        <NuxtLink to="/qna" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
          목록으로
        </NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const questionTitle = ref('')
const questionContent = ref('')

const submitQuestion = async () => {
  const { data } = await useFetch('/api/qna', {
    method: 'POST',
    body: {
      questionTitle: questionTitle.value,
      questionContent: questionContent.value,
      author: '현재 로그인한 사용자' // 실제 구현 시 로그인 사용자 정보를 사용해야 합니다.
    }
  })
  if (data.value && data.value.success) {
    router.push('/qna')
  }
}
</script>