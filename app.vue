<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Modal />
    <ReplyModal />
    <LoginModal />
    <RegisterModal />
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, provide } from 'vue'
import Modal from '~/components/common/Modal.vue'
import ReplyModal from '~/components/common/ReplyModal.vue'
import LoginModal from '~/components/common/LoginModal.vue'
import RegisterModal from '~/components/common/RegisterModal.vue'
import { useAuth } from '~/composables/useAuth'

const { checkAuth } = useAuth()

// 초기 컬러 모드 설정
onMounted(() => {

  // 인증 확인
  checkAuth()
})

</script>
<style>
html {
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>