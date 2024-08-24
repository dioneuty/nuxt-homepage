<template>
  <nav>
    <!-- 데스크톱 네비게이션 -->
    <div class="hidden lg:block">
      <!-- 배경 이미지를 위한 공간 -->
      <div class="relative h-60 overflow-hidden">
        <img src="/images/background/eveningspa.webp" alt="Home Repair" class="absolute inset-0 w-full h-full object-cover object-center">
        <div class="absolute inset-0 bg-black bg-opacity-40"></div>
        <!-- 중앙에 로고 추가 및 클릭 가능하게 수정 -->
        <NuxtLink to="/" class="absolute inset-0 flex items-center justify-center">
          <div class="text-white text-5xl font-bold flex items-center drop-shadow-lg cursor-pointer">
            <WrenchScrewdriverIcon class="h-16 w-16 mr-4" />
            <span class="text-shadow-lg">{{ appName }}</span>
          </div>
        </NuxtLink>
      </div>
      <!-- 네비게이션 바 -->
      <div class="bg-blue-600 dark:bg-gray-800 text-white p-4 shadow-lg">
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
            <button @click="toggleColorMode" class="text-white hover:text-blue-200 p-2 rounded-full">
              <SunIcon v-if="colorMode === 'light'" class="h-6 w-6" />
              <MoonIcon v-if="colorMode === 'dark'" class="h-6 w-6" />
              <ComputerDesktopIcon v-if="colorMode === 'system'" class="h-6 w-6" />
            </button>
            <div v-if="auth.isLoggedIn && auth.user" class="flex items-center space-x-2">
              <span class="text-white">{{ auth.user.username }}</span>
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
    <div class="lg:hidden fixed top-0 left-0 right-0 z-50 bg-blue-600 dark:bg-gray-800 text-white p-4">
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
            <SunIcon v-if="colorMode === 'light'" class="h-6 w-6" />
            <MoonIcon v-if="colorMode === 'dark'" class="h-6 w-6" />
            <ComputerDesktopIcon v-if="colorMode === 'system'" class="h-6 w-6" />
          </button>
          <div v-if="auth.isLoggedIn && auth.user" class="flex items-center space-x-2">
            <span class="text-white">{{ auth.user.username }}</span>
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
        <div class="bg-blue-800 dark:bg-gray-700 p-6 flex justify-between items-center">
          <NuxtLink to="/" class="text-2xl font-bold flex items-center" @click="closeMenu">
            <WrenchScrewdriverIcon class="h-8 w-8 mr-2" />
            <span>{{ appName }}</span>
          </NuxtLink>
          <button @click="closeMenu" class="text-white hover:text-blue-200">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        <div class="flex-grow p-6 space-y-4 overflow-y-auto">
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
            <SunIcon v-if="colorMode === 'light'" class="h-6 w-6 mr-2" />
            <MoonIcon v-if="colorMode === 'dark'" class="h-6 w-6 mr-2" />
            <ComputerDesktopIcon v-if="colorMode === 'system'" class="h-6 w-6 mr-2" />
            {{ colorMode === 'light' ? '다크 모드' : colorMode === 'dark' ? '시스템 설정' : '라이트 모드' }}
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
</template>

<script setup>
import { ref, inject, watch, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { WrenchScrewdriverIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/vue/24/solid'
import { Icon } from '@iconify/vue'
import { useLoginModal } from '~/composables/useLoginModal'
import { useRegisterModal } from '~/composables/useRegisterModal'
import { useAuth } from '~/composables/useAuth'

const router = useRouter()

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
      { name: '질문과답변', path: '/qna' }
    ],
    isOpen: false
  },
  { name: '문의', path: '/contact' },
  { name: '갤러리', path: '/gallery' },
  { name: '위키' + constructionEmoji, path: '/under-construction' },
  { 
    name: '관리자', 
    children: [
      { name: '관리자용 문의 게시판' + constructionEmoji, path: '/contactboard' },
      { name: '관리자용 게시판' + constructionEmoji, path: '/adminboard' },
      { name: '관리자용 갤러리' + constructionEmoji, path: '/admingallery' },
    ],
    isOpen: false,
    adminOnly: true
  }
])

const filteredMenuItems = computed(() => {
  return menuItems.value.filter(item => {
    if (item.adminOnly) {
      return auth.value.isLoggedIn && auth.value.user && auth.value.user.role === 'ADMIN'
    }
    return true
  })
})

const handleItemClick = (item) => {
  if (item.children) {
    item.isOpen = !item.isOpen
  } else if (item.path) {
    router.push(item.path)
    closeMenu()
  }
}

const isDarkMode = inject('isDarkMode')
const toggleColorMode = inject('toggleColorMode')
const colorMode = inject('colorMode')

const isMenuOpen = ref(false)

const openMenu = () => {
  isMenuOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeMenu = () => {
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

const isActive = (path) => {
  return route.value.path === path
}

const isActiveOrHasActiveChild = (item) => {
  if (isActive(item.path)) {
    return true
  }
  if (item.children) {
    return item.children.some(child => isActive(child.path))
  }
  return false
}

defineProps({
  isMenuOpen: Boolean
})

defineEmits(['openMenu', 'closeMenu'])

const { openModal: openLoginModal } = useLoginModal()
const { openModal: openRegisterModal } = useRegisterModal()
const { auth, setAuth } = useAuth()

const logout = async () => {
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
</script>

<style scoped>
.text-shadow-lg {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.group:hover .group-hover\:block {
  display: block;
}
</style>