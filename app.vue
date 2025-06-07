<template>
  <div class="bg-white dark:bg-gray-900">
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
import { useMenuStore } from '~/stores/menu'

const { checkAuth } = useAuth()
const menuStore = useMenuStore()

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