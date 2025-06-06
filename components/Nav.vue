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
          'relative overflow-hidden bg-blue-600 dark:bg-gray-800',
          navStore.isAlwaysOnTop ? 'h-16' : 'h-16'
        ]">
          <NuxtLink to="/" class="absolute inset-0 flex items-center justify-center">
            <div class="text-white text-3xl font-bold flex items-center">
              <WrenchScrewdriverIcon class="h-8 w-8 mr-2" />
              <span class="text-shadow-sm">{{ appName }}</span>
            </div>
          </NuxtLink>
        </div>
        <!-- 네비게이션 바 -->
        <div class="bg-blue-600 dark:bg-gray-800 text-white p-2 shadow-lg">
          <div class="container mx-auto flex justify-between items-center">
            <div class="space-x-4">
              <template v-for="item in filteredMenuItems" :key="item.name">
                <!-- 자식 메뉴가 있는 경우 -->
                <div v-if="item.children" class="relative inline-block group">
                  <NuxtLink v-if="item.path" :to="item.path" 
                            :class="['hover:text-blue-200 flex items-center py-2', 
                                     { 'text-yellow-300 font-bold': isActiveOrHasActiveChild(item) }]">
                    {{ item.name }}
                    <svg class="w-4 h-4 ml-1 transition-transform duration-200 transform group-hover:rotate-180" 
                         xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </NuxtLink>
                  <span v-else 
                        :class="['cursor-default hover:text-blue-200 flex items-center py-2',
                                 { 'text-yellow-300 font-bold': isActiveOrHasActiveChild(item) }]">
                    {{ item.name }}
                    <svg class="w-4 h-4 ml-1 transition-transform duration-200 transform group-hover:rotate-180" 
                         xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </span>
                  <!-- 자식 메뉴 노출 -->
                  <div class="absolute left-0 mt-0 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg hidden group-hover:block">
                    <div class="py-2">
                      <NuxtLink v-for="child in item.children" :key="child.path"
                                :to="child.path"
                                :class="['block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-500 hover:text-white',
                                         { 'bg-blue-500 text-white': isActive(child.path) }]">
                        {{ child.name }}
                      </NuxtLink>
                    </div>
                  </div>
                </div>
                <!-- 자식 메뉴가 없는 경우 -->
                <NuxtLink v-else :to="item.path" 
                          :class="['hover:text-blue-200 py-2', 
                                   { 'text-yellow-300 font-bold': isActive(item.path) }]">
                  {{ item.name }}
                </NuxtLink>
              </template>
            </div>
            <div class="flex items-center space-x-4">
              <!-- 상단 고정 토글 버튼 -->
              <button @click="toggleAlwaysOnTop" class="text-white hover:text-blue-200 p-2 rounded-full">
                <Icon :icon="navStore.isAlwaysOnTop ? 'mdi:pin-off' : 'mdi:pin'" class="h-6 w-6" />
              </button>
              <button @click="toggleColorMode" class="text-white hover:text-blue-200 p-2 rounded-full">
                <SunIcon v-if="$colorMode.value === 'light'" class="h-6 w-6" />
                <MoonIcon v-if="$colorMode.value === 'dark'" class="h-6 w-6" />
                <ComputerDesktopIcon v-if="$colorMode.value === 'system'" class="h-6 w-6" />
              </button>

              <div v-if="auth.isLoggedIn && auth.user" class="flex items-center space-x-2">
                <NuxtLink to="/personal-info" class="flex items-center space-x-2 text-white hover:text-blue-200">
                  <Icon icon="mdi:account-circle" class="h-6 w-6" />
                  <span>{{ auth.user.username }}</span>
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
      <div class="lg:hidden fixed top-0 left-0 right-0 z-50 bg-blue-600 dark:bg-gray-800 text-white px-4 py-2">
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
              <SunIcon v-if="$colorMode.value === 'light'" class="h-6 w-6" />
              <MoonIcon v-if="$colorMode.value === 'dark'" class="h-6 w-6" />
              <ComputerDesktopIcon v-if="$colorMode.value === 'system'" class="h-6 w-6" />
            </button>
            <div v-if="auth.isLoggedIn && auth.user" class="flex items-center space-x-2">
              <NuxtLink to="/personal-info" class="flex items-center space-x-2 text-white" :class="{ 'pointer-events-none': isMenuOpen }">
                <Icon icon="mdi:account-circle" class="h-6 w-6" />
                <span>{{ auth.user.username }}</span>
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
          <div class="flex-grow p-2 space-y-2 overflow-y-auto">
            <div v-for="item in filteredMenuItems" :key="item.name" class="relative">
              <div
                @click="handleItemClick(item)"
                :class="['flex justify-between items-center py-2 px-4 rounded-lg hover:bg-blue-500 transition duration-200 ease-in-out cursor-pointer',
                         { 'bg-blue-500 text-yellow-300 font-bold': isActiveOrHasActiveChild(item) }]"
              >
                {{ item.name }}
                <ChevronDownIcon
                  v-if="item.children"
                  :class="['h-5 w-5 transition-transform', item.isOpen ? 'transform rotate-180' : '']"
                />
              </div>
              <transition
                enter-active-class="transition duration-300 ease-out"
                enter-from-class="transform -translate-y-4 opacity-0"
                enter-to-class="transform translate-y-0 opacity-100"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="transform translate-y-0 opacity-100"
                leave-to-class="transform -translate-y-4 opacity-0"
              >
                <div v-if="item.children && item.isOpen" class="mt-2 ml-4 space-y-2 bg-blue-400 dark:bg-gray-600 rounded-lg pointer-events-auto">
                  <NuxtLink
                    v-for="child in item.children"
                    :key="child.path"
                    :to="child.path"
                    :class="['block py-2 px-4 rounded-lg hover:bg-blue-500 dark:hover:bg-gray-500 transition duration-200 ease-in-out',
                             { 'bg-blue-500 dark:bg-gray-500 text-yellow-300 font-bold': isActive(child.path) }]"
                    @click="closeMenu"
                  >
                    {{ child.name }}
                  </NuxtLink>
                </div>
              </transition>
            </div>
            <button @click="toggleColorMode" class="w-full text-left py-2 px-4 rounded-lg hover:bg-blue-500 dark:hover:bg-gray-600 transition duration-200 ease-in-out flex items-center">
              <SunIcon v-if="$colorMode.value === 'light'" class="h-6 w-6 mr-2" />
              <MoonIcon v-if="$colorMode.value === 'dark'" class="h-6 w-6 mr-2" />
              <ComputerDesktopIcon v-if="$colorMode.value === 'system'" class="h-6 w-6 mr-2" />
              {{ $colorMode.value === 'light' ? '다크 모드' : $colorMode.value === 'dark' ? '시스템 설정' : '라이트 모드' }}
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

const appName = ref('Dion')

// 메뉴 아이템 배열
// 홈, 블로그, 소개, 서비스, 게시판, 문의, Q&A, 관리자용 문의 게시판, 관리자용 게시판, 위키
// 공사중 emoji 추가 
// 집 공사 관련 이모지
const constructionEmoji = '🏗️'
const hammerEmoji = '🔨'
const wrenchEmoji = '🔧'
const brickEmoji = '🧱'
const paintbrushEmoji = '🖌️'

const menuItems = ref([
  { name: '홈', path: '/' },
  { name: '블로그', path: '/blog' },
  { 
    name: '소개', 
    children: [
      { name: '개인소개', path: '/about' },
      { name: '서비스', path: '/services' }
    ],
    isOpen: false
  },
  { 
    name: '게시판', 
    children: [
      { name: '자유게시판', path: '/board' },
      { name: '질문과답변', path: '/qna' },
      { name: '유머게시판', path: '/humor' },
      { name: '방명록', path: '/guestbook' }
    ],
    isOpen: false
  },
  { name: '문의', path: '/contact' },
  { name: '갤러리', path: '/gallery' },
  { name: '위키', path: '/wiki' },
  { name: '관련 사이트', path: '/related-sites' },
  { name: '종합 검색', path: '/search' },
  { name: '아웃라이너', path: '/outliner' },
  { 
    name: '외국어 학습', 
    children: [
      { name: '영어', path: '/english' },
      { name: '일본어', path: '/japanese' }
    ],
    isOpen: false
  },
  { 
    name: '관리자', 
    children: [
      { name: '관리자용 문의 게시판', path: '/contactboard' },
      { name: '관리자용 게시판', path: '/adminboard' },
      { name: '관리자용 갤러리', path: '/admingallery' },
    ],
    isOpen: false,
    adminOnly: true
  },
  { name: 'AI 채팅', path: '/ai-chat' },
  { name: '유튜브 갤러리', path: '/youtube-gallery' }
])

// 사용자 권한에 따른 메뉴 필터링
const filteredMenuItems = computed(() => {
  return menuItems.value.filter(item => {
    if (item.adminOnly) {
      return auth.value.isLoggedIn && auth.value.user && auth.value.user.role === 'ADMIN'
    }
    return true
  })
})

function handleItemClick(item) {
  if (item.children) {
    item.isOpen = !item.isOpen
  } else if (item.path) {
    router.push(item.path)
    closeMenu()
  }
}

const colorMode = useColorMode()

// 다크모드/라이트모드 토글 함수
function toggleColorMode() {
  if (colorMode.value === 'light') colorMode.value = 'dark' // 라이트 모드
  else if (colorMode.value === 'dark') colorMode.value = 'system' // 다크 모드
  else colorMode.value = 'light' // 시스템 설정
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

defineProps({
  isMenuOpen: Boolean,
})

const emit = defineEmits(['openMenu', 'closeMenu', 'updateNavFixedState'])

const { openModal: openLoginModal } = useLoginModal()
const { openModal: openRegisterModal } = useRegisterModal()
const { auth, setAuth } = useAuth()

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

const navStore = useNavStore()

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

// ... (기존 코드 유지)

// isAlwaysOnTop watch 대신 navStore.isAlwaysOnTop watch
watch(() => navStore.isAlwaysOnTop, (newValue) => {
  emit('updateNavFixedState', newValue)
  updateBodyPadding()
})

// ... (나머지 기존 코드 유지)
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