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
        <label for="youtubeUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300">유튜브 URL</label>
        <input type="text" id="youtubeUrl" v-model="youtubeUrl" 
               @input="handleYoutubeInput"
               placeholder="유튜브 또는 쇼츠 URL을 입력하세요"
               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
      </div>
      <div>
        <label for="content" class="block text-sm font-medium text-gray-700 dark:text-gray-300">내용</label>
        <client-only>
          <QuillEditor v-model:content="content" contentType="html" :options="editorOptions" ref="quillEditor" />
        </client-only>
      </div>
      <div>
        <button type="submit" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          게시글 작성
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const title = ref('')
const author = ref('')
const content = ref('')
const youtubeUrl = ref('')

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

const handleYoutubeInput = () => {
  const url = youtubeUrl.value
  const videoId = extractYouTubeId(url)
  if (videoId) {
    const isShorts = url.includes('shorts')
    const html = isShorts
      ? `<div class="aspect-w-9 aspect-h-16 my-4 mx-auto"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
      : `<div class="aspect-w-16 aspect-h-9 my-4"><iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
    insertHTML(html)
    youtubeUrl.value = '' // URL 입력 필드 초기화
  }
}

const extractYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

const insertHTML = (html) => {
  const quill = quillEditor.value.getQuill()
  const range = quill.getSelection()
  if (range) {
    quill.clipboard.dangerouslyPasteHTML(range.index, html)
  } else {
    quill.clipboard.dangerouslyPasteHTML(quill.getLength(), html)
  }
}

async function submitPost() {
  if (!title.value || !author.value || !content.value) {
    alert('제목, 작성자, 내용은 필수 입력 항목입니다.')
    return
  }

  const { error } = await useFetch('/api/boardPosts', {
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
  } else {
    alert('게시글이 작성되었습니다.')
    await navigateTo('/board')
  }
}
</script>