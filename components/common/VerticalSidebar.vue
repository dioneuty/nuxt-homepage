<template>
  <aside
    class="vertical-sidebar"
    :style="{ backgroundColor: backgroundColor }"
  >
    <div class="p-4">
      <!-- 🏠 클릭 가능한 로고와 사이트 제목 -->
      <NuxtLink to="/" class="vertical-sidebar-logo">
        <Icon v-if="siteLogoIcon" :icon="siteLogoIcon" class="vertical-sidebar-logo-icon" />
        {{ siteTitle }}
      </NuxtLink>
    </div>
    <!-- 현재 시간 표시 -->
    <div class="vertical-sidebar-time">
      {{ currentTime }}
    </div>
    <nav class="vertical-sidebar-nav">
      <AppMenu :isVertical="true" />
    </nav>

    <!-- 테마 모드 전환, 레이아웃 전환, 사용자 관련 버튼 -->
    <div class="vertical-sidebar-bottom" :style="{ borderColor: backgroundColor }">
      <div class="vertical-sidebar-bottom-content">
        <!-- 상단 고정 토글 버튼 -->
        <button @click="navStore.toggleAlwaysOnTop" class="vertical-sidebar-btn">
          <Icon :icon="navStore.isAlwaysOnTop ? 'mdi:pin-off' : 'mdi:pin'" class="vertical-sidebar-btn-icon" />
        </button>
        <!-- 테마 모드 전환 버튼 -->
        <button @click="toggleColorMode" class="vertical-sidebar-btn">
          <Icon :icon="colorModeIcon" class="vertical-sidebar-btn-icon" />
        </button>
        <!-- 레이아웃 전환 버튼 -->
        <button @click="layoutStore.toggleSidebar" class="vertical-sidebar-btn">
          <Icon icon="mdi:menu-open" class="vertical-sidebar-btn-icon" />
        </button>

        <div v-if="isLoggedIn && user" class="vertical-sidebar-user-section">
          <!-- 개인 정보 버튼 -->
          <NuxtLink to="/personal-info" class="vertical-sidebar-btn">
            <Icon icon="mdi:account-circle" class="vertical-sidebar-btn-icon" />
          </NuxtLink>
          <!-- 관리자 페이지 버튼 -->
          <button v-if="user.role.toLowerCase() === 'admin'" @click="onClickAdminPage" class="vertical-sidebar-btn">
            <Icon icon="mdi:shield-crown-outline" class="vertical-sidebar-btn-icon" />
          </button>
          <!-- 로그아웃 버튼 -->
          <button @click="logout" class="vertical-sidebar-btn">
            <Icon icon="mdi:logout" class="vertical-sidebar-btn-icon" />
          </button>
        </div>
        <div v-else class="vertical-sidebar-user-section">
          <!-- 로그인 버튼 -->
          <button @click="handleLoginClick" class="vertical-sidebar-btn">
            <Icon icon="mdi:login" class="vertical-sidebar-btn-icon" />
          </button>
          <!-- 회원가입 버튼 -->
          <button @click="handleRegisterClick" class="vertical-sidebar-btn">
            <Icon icon="mdi:account-plus" class="vertical-sidebar-btn-icon" />
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
import { useCurrentTime } from '~/composables/useCurrentTime';

const router = useRouter();
const { isAdmin, isLoggedIn, user, logout } = useAuth();
const layoutStore = useLayoutStore();
const navStore = useNavStore();
const { openModal: openLoginModal } = useLoginModal();
const { openModal: openRegisterModal } = useRegisterModal();
const { currentTime } = useCurrentTime();

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

/* 링크 기본 스타일 제거 */
a {
  text-decoration: none !important;
  outline: none !important;
  box-shadow: none !important;
}

a:focus {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
}

a:active {
  outline: none !important;
  box-shadow: none !important;
}
</style> 