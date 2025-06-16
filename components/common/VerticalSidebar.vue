<template>
  <aside
    :class="{
      'w-64': true,
      'fixed h-full top-0 left-0': true,
      'bg-blue-900 dark:bg-blue-950 shadow-md flex-shrink-0': true,
      'hidden md:block': true, // 모바일에서 숨김, 데스크톱에서 보임
    }"
    :style="{ backgroundColor: backgroundColor }"
  >
    <div class="p-4 text-2xl font-bold text-blue-100 flex items-center">
      <Icon v-if="siteLogoIcon" :icon="siteLogoIcon" class="w-7 h-7 mr-2" />
      {{ siteTitle }}
    </div>
    <nav class="mt-4">
      <AppMenu :isVertical="true" />
    </nav>

    <!-- 테마 모드 전환, 레이아웃 전환, 사용자 관련 버튼 -->
    <div class="absolute bottom-0 left-0 w-full p-4 border-t" :style="{ borderColor: backgroundColor }">
      <div class="flex items-center justify-between">
        <!-- 상단 고정 토글 버튼 -->
        <button @click="navStore.toggleAlwaysOnTop" class="p-2 rounded-full bg-blue-800 dark:bg-blue-700 text-blue-100 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <Icon :icon="navStore.isAlwaysOnTop ? 'mdi:pin-off' : 'mdi:pin'" class="w-5 h-5" />
        </button>
        <!-- 테마 모드 전환 버튼 -->
        <button @click="toggleColorMode"
          class="p-2 rounded-full bg-blue-800 dark:bg-blue-700 text-blue-100 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <Icon :icon="colorModeIcon" class="w-5 h-5" />
        </button>
        <!-- 레이아웃 전환 버튼 -->
        <button @click="layoutStore.toggleSidebar" class="p-2 rounded-full bg-blue-800 dark:bg-blue-700 text-blue-100 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <Icon icon="mdi:menu-open" class="w-5 h-5" />
        </button>

        <div v-if="isLoggedIn && user" class="flex items-center space-x-2">
          <!-- 개인 정보 버튼 -->
          <NuxtLink to="/personal-info" class="p-2 rounded-full bg-blue-800 dark:bg-blue-700 text-blue-100 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Icon icon="mdi:account-circle" class="w-5 h-5" />
          </NuxtLink>
          <!-- 관리자 페이지 버튼 -->
          <button v-if="user.role.toLowerCase() === 'admin'" @click="onClickAdminPage" class="p-2 rounded-full bg-blue-800 dark:bg-blue-700 text-blue-100 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Icon icon="mdi:shield-crown-outline" class="w-5 h-5" />
          </button>
          <!-- 로그아웃 버튼 -->
          <button @click="logout" class="p-2 rounded-full bg-blue-800 dark:bg-blue-700 text-blue-100 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Icon icon="mdi:logout" class="w-5 h-5" />
          </button>
        </div>
        <div v-else class="flex items-center space-x-2">
          <!-- 로그인 버튼 -->
          <button @click="handleLoginClick" class="p-2 rounded-full bg-blue-800 dark:bg-blue-700 text-blue-100 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Icon icon="mdi:login" class="w-5 h-5" />
          </button>
          <!-- 회원가입 버튼 -->
          <button @click="handleRegisterClick" class="p-2 rounded-full bg-blue-800 dark:bg-blue-700 text-blue-100 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Icon icon="mdi:account-plus" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

  </aside>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '~/composables/useAuth';
import AppMenu from '~/components/common/AppMenu.vue';
import { useLayoutStore } from '~/stores/layout';
import { useNavStore } from '~/stores/navStore';
import { useLoginModal } from '~/composables/useLoginModal';
import { useRegisterModal } from '~/composables/useRegisterModal';

const router = useRouter();
const { isAdmin, isLoggedIn, user, logout } = useAuth();
const layoutStore = useLayoutStore();
const navStore = useNavStore();
const { openModal: openLoginModal } = useLoginModal();
const { openModal: openRegisterModal } = useRegisterModal();

const props = defineProps({
  siteTitle: {
    type: String,
    default: 'Admin',
  },
  siteLogoIcon: {
    type: String,
    default: 'mdi:account',
  },
  backgroundColor: {
    type: String,
    default: '#1E293B',
  },
});

const colorMode = useColorMode();

const colorModeIcon = computed(() => {
  switch (colorMode.preference) {
    case 'light':
      return 'mdi:white-balance-sunny';
    case 'dark':
      return 'mdi:moon-waning-gibbous';
    case 'system':
      return 'mdi:brightness-auto';
    default:
      return 'mdi:white-balance-sunny';
  }
});

/**
 * 색상 모드를 전환하는 함수입니다.
 * 'system', 'light', 'dark' 순서로 순환하며 변경합니다.
 */
const toggleColorMode = () => {
  const modes = ['light', 'dark', 'system'];
  const currentIndex = modes.indexOf(colorMode.preference);
  const nextIndex = (currentIndex + 1) % modes.length;
  colorMode.preference = modes[nextIndex];
};

/**
 * 관리자 페이지로 이동하는 함수입니다.
 * 사이드바를 닫고 지정된 경로로 라우팅합니다.
 */
const onClickAdminPage = () => {
  layoutStore.toggleSidebar(false);
  router.push('/adminpage');
};

/**
 * 로그인 모달을 여는 함수입니다.
 */
const handleLoginClick = () => {
  openLoginModal();
};

/**
 * 회원가입 모달을 여는 함수입니다.
 */
const handleRegisterClick = () => {
  openRegisterModal();
};
</script>

<style scoped>
/* 활성 링크 스타일 */
.router-link-exact-active {
  @apply bg-blue-800 dark:bg-blue-800 border-r-4 border-blue-500 font-semibold text-blue-100;
}
</style> 