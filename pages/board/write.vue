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
        <CommonQuillEditor v-model="content" @change="onEditorChange" />
      </div>
      <div class="flex justify-between items-center">
        <button type="submit" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          게시글 작성
        </button>
        <NuxtLink to="/board" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700">
          목록
        </NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CommonQuillEditor from '~/components/CommonQuillEditor.vue'

const router = useRouter()

const title = ref('')
const author = ref('')
const content = ref('')

const onEditorChange = ({ html, text, quill }) => {
  console.log('Editor content changed:', html);
  // 필요한 경우 여기에서 추가 로직을 수행할 수 있습니다.
}

async function submitPost() {
  console.log('Content:', content.value)
  if (!title.value || !author.value || !content.value) {
    alert('제목, 작성자, 내용은 필수 입력 항목입니다.')
    return
  }

  const { data, error } = await useFetch('/api/boardPosts', {
    method: 'POST',
    body: {
      title: title.value,
      author: author.value,
      content: content.value
    }
  })

  if (error.value) {
    console.error('게시글 작성 중 오류:', error.value)
    alert('게시글 작성이 실패했습니다.')
  } else if (data.value) {
    alert('게시글이 작성되었습니다.')
    router.push('/board')
  } else {
    alert('게시글 작성 결과를 확인할 수 없습니다.')
  }
}
</script>