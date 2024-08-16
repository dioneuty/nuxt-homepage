<template>
  <BoardWrite
    api-endpoint="/api/boardPosts"
    :fields="fields"
    list-path="/board"
  />
</template>

<script setup>
import BoardWrite from '~/components/board/BoardWrite.vue'

const fields = [
  { name: 'title', label: '제목', icon: 'mdi:format-title', component: 'input', placeholder: '제목을 입력하세요', required: true },
  { name: 'author', label: '작성자', icon: 'mdi:account', component: 'input', placeholder: '작성자 이름을 입력하세요', required: true },
  { name: 'content', label: '내용', icon: 'mdi:text-box-outline', component: 'CommonQuillEditor', required: true }
]

</script>