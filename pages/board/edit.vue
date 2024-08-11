<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 dark:text-white">게시글 수정</h1>
    <form v-if="post" @submit.prevent="updatePost" class="space-y-4">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">제목</label>
        <input type="text" id="title" v-model="post.title" required
               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
      </div>
      <div>
        <label for="author" class="block text-sm font-medium text-gray-700 dark:text-gray-300">작성자</label>
        <input type="text" id="author" v-model="post.author" required
               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
      </div>
      <div class="overflow-scroll">
        <label for="content" class="block text-sm font-medium text-gray-700 dark:text-gray-300">내용</label>
        <client-only>
          <QuillEditor v-model:content="post.content" contentType="html" :options="editorOptions" ref="quillEditor" />
        </client-only>
      </div>
      <div>
        <button @click.prevent="insertHTML" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          HTML 삽입
        </button>
      </div>
      <div class="flex justify-between items-center">
        <button type="submit" 
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          게시글 수정
        </button>
        <button type="button" @click="goToList"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700">
          목록으로
        </button>
      </div>
    </form>
    <div v-else>로딩 중...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const route = useRoute()
const router = useRouter()
const id = route.query.id
const post = ref(null)

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
      ['clean']
    ]
  }
}

const quillEditor = ref(null)


const { data, error } = await useLazyAsyncData(`post-${id}`, () => $fetch(`/api/boardPosts`, {
  params: { id }
}))

watchEffect(() => {
  if (data.value) {
    post.value = data.value
  }
})

async function updatePost() {
  if (!post.value.title || !post.value.author || !post.value.content) {
    alert('제목, 작성자, 내용은 필수 입력 항목입니다.')
    return
  }

  const { error } = await useFetch('/api/boardPosts', {
    method: 'PUT',
    body: post.value
  })

  if (error.value) {
    console.error('게시글 수정 중 오류:', error.value)
    alert('게시글 수정에 실패했습니다.')
  } else {
    alert('게시글이 수정되었습니다.')
    await router.push('/board')
  }
}

function goToList() {
  router.push('/board')
}

function insertHTML() {
  const html = prompt('삽입할 HTML 코드를 입력하세요:')
  if (html) {
    const quill = quillEditor.value.getQuill()
    const range = quill.getSelection()
    if (range) {
      quill.clipboard.dangerouslyPasteHTML(range.index, html)
    } else {
      quill.clipboard.dangerouslyPasteHTML(quill.getLength(), html)
    }
  }
}
</script>