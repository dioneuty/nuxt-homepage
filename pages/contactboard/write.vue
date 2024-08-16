<template>
  <BoardWrite
    api-endpoint="/api/contact"
    :fields="fields"
    list-path="/contactboard"
  />
</template>

<script setup>
import BoardWrite from '~/components/board/BoardWrite.vue'

const fields = [
  { name: 'author', label: '이름', icon: 'mdi:account', component: 'input', placeholder: '이름을 입력하세요', required: true },
  { name: 'title', label: '이메일', icon: 'mdi:email', component: 'input', placeholder: '이메일을 입력하세요', required: true },
  { name: 'content', label: '메시지', icon: 'mdi:message-text', component: 'textarea', placeholder: '메시지를 입력하세요', required: true }
]
</script>