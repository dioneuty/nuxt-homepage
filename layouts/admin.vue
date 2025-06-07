<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
    <!-- 사이드바 -->
    <aside class="w-64 bg-white dark:bg-gray-800 shadow-md flex-shrink-0">
      <div class="p-4 text-2xl font-bold text-gray-800 dark:text-gray-200">
        Admin
      </div>
      <nav class="mt-4">
        <ul>
          <li>
            <NuxtLink to="/adminpage" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
              <Icon icon="mdi:view-dashboard-outline" class="w-5 h-5 mr-3" />
              대시보드
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/adminpage/menus" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
              <Icon icon="mdi:menu" class="w-5 h-5 mr-3" />
              메뉴 관리
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/adminpage/users" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
              <Icon icon="mdi:account-group-outline" class="w-5 h-5 mr-3" />
              사용자 관리
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/adminpage/posts" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
              <Icon icon="mdi:post-outline" class="w-5 h-5 mr-3" />
              게시글 관리
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/adminpagenpm /database" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
              <Icon icon="mdi:database-outline" class="w-5 h-5 mr-3" />
              DB 관리
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- 메인 콘텐츠 -->
    <div class="flex-1 flex flex-col">
      <!-- 상단 헤더 -->
      <header class="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
        <h1 class="text-xl font-semibold text-gray-800 dark:text-gray-200">관리자 페이지</h1>
        <NuxtLink to="/" class="text-sm text-blue-500 hover:underline">사이트로 돌아가기</NuxtLink>
      </header>
      
      <!-- 페이지 콘텐츠가 렌더링될 부분 -->
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
</script>

<style scoped>
/* 활성 링크 스타일 */
.router-link-exact-active {
  @apply bg-blue-100 dark:bg-blue-900 border-r-4 border-blue-500 font-semibold;
}
</style> 