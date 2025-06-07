<template>
  <div class="">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Modal />
    <ReplyModal />
    <LoginModal />
    <RegisterModal />
    <div class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <Toast 
        v-for="toast in toasts"
        :key="toast.id"
        :message="toast.message"
        :type="toast.type"
        :duration="toast.duration"
        @close="removeToast(toast.id)"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, provide } from 'vue'
import Modal from '~/components/common/Modal.vue'
import ReplyModal from '~/components/common/ReplyModal.vue'
import LoginModal from '~/components/common/LoginModal.vue'
import RegisterModal from '~/components/common/RegisterModal.vue'
import Toast from '~/components/common/Toast.vue'
import { useAuth } from '~/composables/useAuth'
import { useMenuStore } from '~/stores/menu'
import { useToast } from '~/composables/useToast'

const { checkAuth } = useAuth()
const menuStore = useMenuStore()
const { toasts, removeToast } = useToast()

// 초기 앱 로드 시 실행
onMounted(async () => {
  // 인증 상태 확인
  checkAuth()
  
  // 메뉴 데이터 로드
  await menuStore.fetchMenus()
})
</script>
<style>
html {
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>