<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold"> {{ pageTitle }} </h1>
    <p class="mt-4">현재 경로: {{ $route.path }}</p>
    <p class="mt-2">이 페이지는 동적으로 생성되었습니다.</p>
    <!-- 여기에 각 메뉴 경로에 맞는 컴포넌트나 콘텐츠를 렌더링하는 로직을 추가할 수 있습니다. -->
    <!-- 예: <component :is="componentForRoute" /> -->
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