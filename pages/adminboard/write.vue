<template>
  <BoardWrite
    v-if="isAdmin"
    api-endpoint="/api/adminboard"
    :fields="fields"
    list-path="/adminboard"
  />
</template>

<script setup>
import BoardWrite from '~/components/board/BoardWrite.vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

const { auth } = useAuth()
const router = useRouter()
const isAdmin = ref(false)

onMounted(() => {
  if (!auth.value.isLoggedIn || auth.value.user?.role !== 'ADMIN') {
    router.push('/')
  } else {
    isAdmin.value = true
  }
})

const fields = [
  { name: 'title', label: '제목', icon: 'mdi:format-title', component: 'input', placeholder: '제목을 입력하세요', required: true },
  { name: 'content', label: '내용', icon: 'mdi:text-box-outline', component: 'CommonQuillEditor', required: true }
]
</script>