<template>
  <BoardWrite
    api-endpoint="/api/adminboard"
    :fields="fields"
    list-path="/adminboard"
  />
</template>

<script setup>
import BoardWrite from '~/components/board/BoardWrite.vue'

const fields = [
  { name: 'title', label: '제목', icon: 'mdi:format-title', component: 'input', placeholder: '제목을 입력하세요', required: true },
  { name: 'content', label: '내용', icon: 'mdi:text-box-outline', component: 'textarea', placeholder: '내용을 입력하세요', required: true }
]


</script>