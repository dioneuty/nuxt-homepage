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
            <NuxtLink v-for="item in menuItems" :key="item.path" :to="item.path" class="hover:text-blue-200">
              {{ item.name }}
            </NuxtLink>
          </div>
          <button @click="toggleColorMode" class="text-white hover:text-blue-200 p-2 rounded-full">
            <SunIcon v-if="colorMode === 'light'" class="h-6 w-6" />
            <MoonIcon v-if="colorMode === 'dark'" class="h-6 w-6" />
            <ComputerDesktopIcon v-if="colorMode === 'system'" class="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- 모바일 및 태블릿 네비게이션 -->
    <div class="lg:hidden fixed top-0 left-0 right-0 z-50 bg-blue-600 dark:bg-gray-800 text-white p-4">
      <div class="flex items-center justify-between">
        <button @click="$emit('toggleMenu')" class="text-white">
          <Bars3Icon class="h-6 w-6" />
        </button>
        <NuxtLink to="/" class="text-xl font-bold text-white flex items-center">
          <WrenchScrewdriverIcon class="h-8 w-8 mr-2" />
          <span>{{ appName }}</span>
        </NuxtLink>
        <button @click="toggleColorMode" class="text-white p-2 rounded-full">
          <SunIcon v-if="colorMode === 'light'" class="h-6 w-6" />
          <MoonIcon v-if="colorMode === 'dark'" class="h-6 w-6" />
          <ComputerDesktopIcon v-if="colorMode === 'system'" class="h-6 w-6" />
        </button>
      </div>
    </div>

    <!-- 모바일 슬라이딩 메뉴 -->
    <div
      :class="[
        'fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-blue-700 to-blue-600 dark:from-gray-800 dark:to-gray-700 text-white transform transition-transform duration-300 ease-in-out shadow-lg',
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="flex flex-col h-full">
        <div class="bg-blue-800 dark:bg-gray-700 p-6 flex justify-between items-center">
          <NuxtLink to="/" class="text-2xl font-bold flex items-center" @click="$emit('closeMenu')">
            <WrenchScrewdriverIcon class="h-8 w-8 mr-2" />
            <span>{{ appName }}</span>
          </NuxtLink>
          <button @click="$emit('closeMenu')" class="text-white hover:text-blue-200">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        <div class="flex-grow p-6 space-y-4">
          <NuxtLink 
            v-for="item in menuItems" 
            :key="item.path" 
            :to="item.path" 
            class="block py-2 px-4 rounded-lg hover:bg-blue-500 transition duration-200 ease-in-out"
            @click="$emit('closeMenu')"
          >
            {{ item.name }}
          </NuxtLink>
          <button @click="toggleColorMode" class="w-full text-left py-2 px-4 rounded-lg hover:bg-blue-500 dark:hover:bg-gray-600 transition duration-200 ease-in-out flex items-center">
            <SunIcon v-if="colorMode === 'light'" class="h-6 w-6 mr-2" />
            <MoonIcon v-if="colorMode === 'dark'" class="h-6 w-6 mr-2" />
            <ComputerDesktopIcon v-if="colorMode === 'system'" class="h-6 w-6 mr-2" />
            {{ colorMode === 'light' ? '다크 모드' : colorMode === 'dark' ? '시스템 설정' : '라이트 모드' }}
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, inject } from 'vue'
import { WrenchScrewdriverIcon } from '@heroicons/vue/24/outline'
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/vue/24/solid'

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

const menuItems = [
  { name: '홈', path: '/' },
  { name: '블로그', path: '/blog' },
  { name: '소개', path: '/about' },
  { name: '서비스', path: '/services' },
  { name: '게시판', path: '/board' },
  { name: '문의', path: '/contact' },
  { name: 'Q&A' + constructionEmoji, path: '/under-construction' },
  { name: '관리자용 문의 게시판' + constructionEmoji, path: '/contactboard' },
  { name: '관리자용 게시판' + constructionEmoji, path: '/adminboard' },
  { name: '위키' + constructionEmoji, path: '/under-construction' }
]

const isDarkMode = inject('isDarkMode')
const toggleColorMode = inject('toggleColorMode')
const colorMode = inject('colorMode')

defineProps({
  isMenuOpen: Boolean
})

defineEmits(['toggleMenu', 'closeMenu'])
</script>

<style scoped>
.text-shadow-lg {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}
</style>