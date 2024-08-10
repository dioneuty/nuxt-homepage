<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 dark:text-white">새 게시글 작성</h1>
    <form @submit.prevent="submitPost" class="space-y-4">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">제목 *</label>
        <input type="text" id="title" v-model="title" required
               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
      </div>
      <div>
        <label for="author" class="block text-sm font-medium text-gray-700 dark:text-gray-300">작성자 *</label>
        <input type="text" id="author" v-model="author" required
               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
      </div>
      <div>
        <label for="content" class="block text-sm font-medium text-gray-700 dark:text-gray-300">내용</label>
        <client-only>
          <QuillEditor v-model:content="content" contentType="html" :options="editorOptions" />
        </client-only>
      </div>
      <div class="flex justify-between items-center">
        <button type="submit" 
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          게시글 작성
        </button>
        <button type="button" @click="goToList"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700">
          목록으로
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const router = useRouter()
const title = ref('')
const author = ref('')
const content = ref('')

const editorOptions = {
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      ['link', 'image'],
    ]
  }
}

async function submitPost() {
  if (!title.value || !author.value) {
    alert('제목과 작성자는 필수 입력 항목입니다.')
    return
  }

  try {
    await $fetch('/api/boardPosts', {
      method: 'POST',
      body: {
        title: title.value,
        author: author.value,
        content: content.value,
      }
    })

    alert('게시글이 성공적으로 작성되었습니다.')
    await router.push('/board')
  } catch (error) {
    console.error('Error:', error)
    alert('게시글 작성에 실패했습니다.')
  }
}

function goToList() {
  router.push('/board')
}

</script>