<!-- 주요 네비게이션 컴포넌트 -->
<template>
  <div>
    <nav :key="navKey" :class="[
      'transition-all duration-300 ease-in-out',
      navStore.isAlwaysOnTop ? 'fixed top-0 left-0 right-0 z-50' : 'relative'
    ]">
      <!-- 데스크톱 네비게이션 -->
      <div class="hidden lg:block">
        <!-- 로고 영역 -->
        <div :class="[
          'relative overflow-hidden dark:bg-gray-800',
          navStore.isAlwaysOnTop ? 'h-16' : 'h-16'
        ]" :style="{ backgroundColor: headerColor }">
          <NuxtLink to="/" class="absolute inset-0 flex items-center justify-center">
            <div class="text-white text-3xl font-bold flex items-center">
              <WrenchScrewdriverIcon class="h-8 w-8 mr-2" />
              <span class="text-shadow-sm">{{ appName }}</span>
            </div>
          </NuxtLink>
        </div>
        <!-- 네비게이션 바 -->
        <div class="dark:bg-gray-800 text-white p-2 shadow-lg" :style="{ backgroundColor: headerColor }">
          <div class="container mx-auto flex justify-between items-center">
            <div class="space-x-4">
              <AppMenu />
            </div>
            <div class="flex items-center space-x-4">
              <!-- 상단 고정 토글 버튼 -->
              <button @click="toggleAlwaysOnTop" class="text-white hover:text-blue-200 p-2 rounded-full">
                <Icon :icon="navStore.isAlwaysOnTop ? 'mdi:pin-off' : 'mdi:pin'" class="h-6 w-6" />
              </button>
              <button @click="toggleColorMode" class="text-white hover:text-blue-200 p-2 rounded-full">
                <SunIcon v-if="colorMode.preference === 'light'" class="h-6 w-6" />
                <MoonIcon v-if="colorMode.preference === 'dark'" class="h-6 w-6" />
                <ComputerDesktopIcon v-if="colorMode.preference === 'system'" class="h-6 w-6" />
              </button>

              <div v-if="isLoggedIn && user" class="flex items-center space-x-2">
                <NuxtLink to="/personal-info" class="flex items-center space-x-2 text-white hover:text-blue-200">
                  <Icon icon="mdi:account-circle" class="h-6 w-6" />
                  <span>{{ user.username }}</span>
                </NuxtLink>
                <NuxtLink v-if="user.role.toLowerCase() === 'admin'" to="/adminpage" class="text-white hover:text-blue-200 p-2 rounded-full">
                  <Icon icon="mdi:shield-crown-outline" class="h-6 w-6" />
                </NuxtLink>
                <button @click="logout" class="text-white hover:text-blue-200 p-2 rounded-full">
                  <Icon icon="mdi:logout" class="h-6 w-6" />
                </button>
              </div>
              <div v-else class="flex items-center space-x-2">
                <button @click="openLoginModal" class="text-white hover:text-blue-200 p-2 rounded-full">
                  <Icon icon="mdi:login" class="h-6 w-6" />
                </button>
                <button @click="openRegisterModal" class="text-white hover:text-blue-200 p-2 rounded-full">
                  <Icon icon="mdi:account-plus" class="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 모바일 네비게이션 헤더 -->
      <div class="lg:hidden fixed top-0 left-0 right-0 z-50 dark:bg-gray-800 text-white px-4 py-2" :style="{ backgroundColor: headerColor }">
        <div class="flex items-center justify-between" :class="{ 'pointer-events-auto': isMenuOpen }">
          <button @click="openMenu" class="text-white" :class="{ 'pointer-events-none': isMenuOpen }">
            <Bars3Icon class="h-6 w-6" />
          </button>
          <NuxtLink to="/" class="text-xl font-bold text-white flex items-center" :class="{ 'pointer-events-none': isMenuOpen }">
            <WrenchScrewdriverIcon class="h-8 w-8 mr-2" />
            <span>{{ appName }}</span>
          </NuxtLink>
          <div class="flex items-center space-x-2">
            <button @click="toggleColorMode" class="text-white p-2 rounded-full" :class="{ 'pointer-events-none': isMenuOpen }">
              <SunIcon v-if="colorMode.preference === 'light'" class="h-6 w-6" />
              <MoonIcon v-if="colorMode.preference === 'dark'" class="h-6 w-6" />
              <ComputerDesktopIcon v-if="colorMode.preference === 'system'" class="h-6 w-6" />
            </button>
            <div v-if="isLoggedIn && user" class="flex items-center space-x-2">
              <NuxtLink to="/personal-info" class="flex items-center space-x-2 text-white" :class="{ 'pointer-events-none': isMenuOpen }">
                <Icon icon="mdi:account-circle" class="h-6 w-6" />
                <span>{{ user.username }}</span>
              </NuxtLink>
              <NuxtLink v-if="user.role.toLowerCase() === 'admin'" to="/adminpage" class="text-white p-2 rounded-full" :class="{ 'pointer-events-none': isMenuOpen }">
                <Icon icon="mdi:shield-crown-outline" class="h-6 w-6" />
              </NuxtLink>
              <button @click="logout" class="text-white p-2 rounded-full" :class="{ 'pointer-events-none': isMenuOpen }">
                <Icon icon="mdi:logout" class="h-6 w-6" />
              </button>
            </div>
            <div v-else class="flex items-center space-x-2">
              <button @click="openLoginModal" class="text-white p-2 rounded-full" :class="{ 'pointer-events-none': isMenuOpen }">
                <Icon icon="mdi:login" class="h-6 w-6" />
              </button>
              <button @click="openRegisterModal" class="text-white p-2 rounded-full" :class="{ 'pointer-events-none': isMenuOpen }">
                <Icon icon="mdi:account-plus" class="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 모바일 슬라이딩 메뉴 -->
      <div
        :class="[
          'fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-blue-700 to-blue-600 dark:from-gray-800 dark:to-gray-700 text-white transform transition-transform duration-300 ease-in-out shadow-lg pointer-events-auto',
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        ]"
      >
        <div class="flex flex-col h-full">
          <div class="bg-blue-800 dark:bg-gray-700 p-4 flex justify-between items-center">
            <NuxtLink to="/" class="text-2xl font-bold flex items-center" @click="closeMenu">
              <WrenchScrewdriverIcon class="h-8 w-8 mr-2" />
              <span>{{ appName }}</span>
            </NuxtLink>
            <button @click="closeMenu" class="text-white hover:text-blue-200">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
          <div class="flex-grow p-2 overflow-y-auto">
            <AppMenu />
            <!-- 화면 모드 토글 버튼 다시 추가 -->
            <button @click="toggleColorMode" class="w-full text-left py-2 px-4 rounded-lg hover:bg-blue-500 dark:hover:bg-gray-600 transition duration-200 ease-in-out flex items-center mt-4">
              <SunIcon v-if="colorMode.preference === 'light'" class="h-6 w-6 mr-2" />
              <MoonIcon v-if="colorMode.preference === 'dark'" class="h-6 w-6 mr-2" />
              <ComputerDesktopIcon v-if="colorMode.preference === 'system'" class="h-6 w-6 mr-2" />
              {{ colorMode.preference === 'light' ? '다크 모드' : colorMode.preference === 'dark' ? '시스템 설정' : '라이트 모드' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 오버레이 -->
      <div
        v-if="isMenuOpen"
        class="fixed inset-0 bg-black bg-opacity-50 z-40 pointer-events-auto"
        @click.self="closeMenu"
      ></div>
    </nav>
  </div>
</template>

<script setup>
// 필요한 의존성 import
import { ref, inject, watch, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { WrenchScrewdriverIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/vue/24/solid'
import { Icon } from '@iconify/vue'
import { useLoginModal } from '~/composables/useLoginModal'
import { useRegisterModal } from '~/composables/useRegisterModal'
import { useAuth } from '~/composables/useAuth'
import { useNavStore } from '~/stores/navStore'
import AppMenu from '~/components/common/AppMenu.vue'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

const router = useRouter()
const navKey = ref(0)

// NProgress 설정 및 라우터 네비게이션 진행률 표시 관련 함수
function startProgress() {
  NProgress.start()
}

function endProgress() {
  NProgress.done()
}

const removeBeforeEach = ref(false)
const removeAfterEach = ref(false)

onMounted(() => {
  removeBeforeEach.value = router.beforeEach(startProgress)
  removeAfterEach.value = router.afterEach(endProgress)
})

onUnmounted(() => {
  if (removeBeforeEach.value) removeBeforeEach.value()
  if (removeAfterEach.value) removeAfterEach.value()
})

const { isLoggedIn, user, setAuth } = useAuth()
const navStore = useNavStore()
const colorMode = useColorMode()
const appName = 'Dion'

const props = defineProps({
  isMenuOpen: Boolean,
  headerColor: {
    type: String,
    default: '#FFFFFF' // Default white if not provided
  }
})

const emit = defineEmits(['openMenu', 'closeMenu', 'updateNavFixedState'])

const { openModal: openLoginModal } = useLoginModal()
const { openModal: openRegisterModal } = useRegisterModal()

// 화면 모드 토글 함수
const toggleColorMode = () => {
  if (colorMode.preference === 'system') {
    colorMode.preference = 'light'
  } else if (colorMode.preference === 'light') {
    colorMode.preference = 'dark'
  } else {
    colorMode.preference = 'system'
  }
}

const isMenuOpen = ref(false)

function openMenu() {
  isMenuOpen.value = true
  document.body.style.overflow = 'hidden'
}

function closeMenu() {
  isMenuOpen.value = false
  document.body.style.overflow = ''
}

watch(isMenuOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const route = useRouter().currentRoute

function isActive(path) {
  return route.value.path === path
}

function isActiveOrHasActiveChild(item) {
  if (isActive(item.path)) {
    return true
  }
  if (item.children) {
    return item.children.some(child => isActive(child.path))
  }
  return false
}

// 로그아웃 처리 함수
async function logout() {
  try {
    const response = await fetch('/api/user?type=logout', {
      method: 'POST',
    })
    if (response.ok) {
      setAuth(false, null)
      // 로그아웃 후 메인 페이지로 리다이렉트
      router.push('/')
    } else {
      console.error('로그아웃 실패')
    }
  } catch (error) {
    console.error('로그아웃 중 오류 발생:', error)
  }
}

function toggleAlwaysOnTop() {
  updateBodyPadding()
  
  // navStore 업데이트
  navStore.toggleIsAlwaysOnTop()
}

const navHeight = ref(120)

// 네비게이션 고정 상태에 따른 body padding 조정
function updateBodyPadding() {
  // navStore의 값 사용
  if (navStore.isAlwaysOnTop) {
    document.body.style.paddingTop = `${navHeight.value}px`
  } else {
    document.body.style.paddingTop = '0px'
  }
}

onMounted(() => {
  updateBodyPadding()
  navKey.value++ // 네비게이션 강제 리렌더링
  window.addEventListener('resize', updateBodyPadding)
})

// isAlwaysOnTop watch 대신 navStore.isAlwaysOnTop watch
watch(() => navStore.isAlwaysOnTop, (newValue) => {
  emit('updateNavFixedState', newValue)
  updateBodyPadding()
})
</script>
<style scoped>
/* 네비게이션 시각적 효과 스타일 */
.text-shadow-lg {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

/* 드롭다운 메뉴 표시 관련 스타일 */
.group:hover .group-hover\:block {
  display: block;
}

/* NProgress 스타일 커스터마이징 */
#nprogress .bar {
  background: #29d;
  position: fixed;
  z-index: 1031;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
}

/* 항상 위에 표시될 때의 스타일 */
.fixed {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 필요 시 추가 스타일 */
nav {
  transition: transform 0.3s ease-in-out;
}

nav.fixed {
  transform: translateY(0);
}

nav.fixed.hidden {
  transform: translateY(-100%);
}

.text-shadow-sm {
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

nav {
  transition: all 0.3s ease-in-out;
}

nav.fixed {
  transform: translateY(0);
}

nav.fixed.hidden {
  transform: translateY(-100%);
}
</style>