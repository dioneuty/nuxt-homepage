<!-- 
  메인 애플리케이션 컴포넌트
  - 전체 앱의 레이아웃과 전역 컴포넌트들을 관리
  - 모달, 토스트, 커맨드 팔레트 등 전역 UI 요소들을 포함
  - 초기 앱 로드 시 인증 상태 확인 및 메뉴 데이터 로드
-->
<template>
  <div class="">
    <!-- 메인 레이아웃 래퍼 -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    
    <!-- Stagewise Toolbar -->
    <ClientOnly>
      <StagewiseToolbar :config="stagewiseConfig" />
    </ClientOnly>

    <!-- 전역 모달 컴포넌트들 -->
    <Modal />
    <ReplyModal />
    <LoginModal />
    <RegisterModal />
    
    <!-- 커맨드 팔레트 (Ctrl+K 또는 Cmd+K로 호출) -->
    <CommandPalette />
    
    <!-- 플로팅 YouTube 플레이어 (전역) -->
    <FloatingYouTubePlayer />
    
    <!-- 플로팅 YouTube 버튼 (플레이어가 닫혀있을 때 표시) -->
    <FloatingPlayerButton />
    
    <!-- 토스트 알림 영역 (화면 상단 중앙에 고정) -->
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
// 전역 모달 컴포넌트 import
import Modal from '~/components/common/Modal.vue'
import ReplyModal from '~/components/common/ReplyModal.vue'
import LoginModal from '~/components/common/LoginModal.vue'
import RegisterModal from '~/components/common/RegisterModal.vue'
import CommandPalette from '~/components/common/CommandPalette.vue'
import Toast from '~/components/common/Toast.vue'
import FloatingYouTubePlayer from '~/components/FloatingYouTubePlayer.vue'
import FloatingPlayerButton from '~/components/FloatingPlayerButton.vue'

// 컴포저블 import
import { useAuth } from '~/composables/useAuth'
import { useMenuStore } from '~/stores/menu'
import { useToast } from '~/composables/useToast'
import { useCommandPalette } from '~/composables/useCommandPalette'

import { StagewiseToolbar } from '@stagewise/toolbar-nuxt';
import VuePlugin from '@stagewise-plugins/vue';

// Stagewise config
const stagewiseConfig = {
  plugins: [
    VuePlugin()
  ]
};

// 인증 관련 기능 사용
const { checkAuth }: any = useAuth()
// 메뉴 스토어 사용
const menuStore = useMenuStore()
// 토스트 알림 기능 사용
const { toasts, removeToast }: any = useToast()

// Command Palette 초기화 (전역 키보드 이벤트 등록)
// Ctrl+K 또는 Cmd+K로 커맨드 팔레트를 호출할 수 있음
useCommandPalette()

// 초기 앱 로드 시 실행되는 함수
onMounted(async () => {
  // 사용자 인증 상태 확인 (JWT 토큰 검증)
  checkAuth()
  
  // 네비게이션 메뉴 데이터 로드
  await menuStore.fetchMenus()
})
</script>

<style>
/* 전역 스타일 - 다크모드 전환 시 부드러운 애니메이션 효과 */
html {
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>