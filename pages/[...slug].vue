<template>
  <div class="container mx-auto p-4 md:p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-8">
    <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
      {{ pageTitle }}
    </h1>
    <p class="text-lg text-gray-700 dark:text-gray-300 mb-2">
      현재 경로: <span class="font-medium text-blue-600 dark:text-blue-400">{{ $route.path }}</span>
    </p>
    <p class="text-gray-600 dark:text-gray-400 mb-6">
      이 페이지는 동적으로 생성되었으며, 특정 메뉴 항목에 대한 콘텐츠를 표시할 예정입니다.
    </p>

    <hr class="my-6 border-gray-300 dark:border-gray-700" />

    <!-- 여기에 각 메뉴 경로에 맞는 컴포넌트나 콘텐츠를 렌더링하는 로직을 추가할 수 있습니다. -->
    <!-- 예: <component :is="componentForRoute" /> -->
    <div class="flex items-center justify-center p-8 text-gray-500 dark:text-gray-400">
      <svg class="h-16 w-16 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
      </svg>
      <p class="text-xl">여기에 콘텐츠가 로드됩니다.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useMenuStore } from '~/stores/menu';

const route = useRoute();
const menuStore = useMenuStore();

// 현재 경로에 맞는 메뉴 아이템 찾기
const currentMenuItem = computed(() => {
  const findMenu = (menus, path) => {
    for (const menu of menus) {
      if (menu.path === path) return menu;
      if (menu.children) {
        const found = findMenu(menu.children, path);
        if (found) return found;
      }
    }
    return null;
  };
  return findMenu(menuStore.menus, route.path);
});

// 페이지 타이틀 설정
const pageTitle = computed(() => {
  return currentMenuItem.value ? currentMenuItem.value.name : '페이지를 찾을 수 없음';
});

useHead({
  title: pageTitle,
});
</script> 