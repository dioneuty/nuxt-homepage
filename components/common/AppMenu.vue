<template>
  <nav class="relative" style="z-index: 9999;">
    <!-- 모바일에서는 세로, 데스크톱에서는 가로 메뉴 -->
    <ul :class="[
      'flex flex-col relative',
      isVertical ? '' : 'lg:flex-row lg:space-x-1' // isVertical prop에 따라 데스크톱 레이아웃 변경
    ]" style="z-index: 9999;">
      <li v-for="menu in accessibleMenus" :key="menu.id" class="relative group" style="z-index: 9999;">
        <div 
          @click="handleMenuClick(menu)"
          :class="[
            'flex justify-between items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer',
            'text-blue-100 hover:bg-blue-700 dark:text-blue-100 dark:hover:bg-blue-700',
            isActive(menu) ? 'bg-blue-800 dark:bg-blue-800' : ''
          ]"
        >
          <NuxtLink v-if="menu.path" :to="menu.path" class="flex-grow flex items-center">
            <Icon v-if="menu.icon" :icon="menu.icon" class="mr-1" />
            <span>{{ menu.name }}</span>
          </NuxtLink>
          <div v-else class="flex-grow flex items-center">
            <Icon v-if="menu.icon" :icon="menu.icon" class="mr-1" />
            <span>{{ menu.name }}</span>
          </div>
          <Icon v-if="menu.other_Menu && menu.other_Menu.length" 
                icon="mdi:chevron-down" 
                :class="['ml-1 transition-transform duration-200', menu.isOpen ? 'rotate-180' : '', 'lg:group-hover:rotate-180']" />
        </div>
        
        <!-- 하위 메뉴 -->
        <div v-if="menu.other_Menu && menu.other_Menu.length" 
             :class="[
               // 세로 메뉴(사이드바)에서는 static 포지셔닝으로 자연스럽게 아래로 펼침
               isVertical 
                 ? 'relative w-full' 
                 : 'lg:absolute lg:left-0 w-full lg:w-48 lg:bg-blue-800 lg:dark:bg-blue-900 rounded-md lg:shadow-lg',
               
               // hover 동작도 세로 메뉴에서는 비활성화
               isVertical ? '' : 'lg:hidden lg:group-hover:block',
               
               // z-index는 가로 메뉴(드롭다운)에서만 필요
               isVertical ? '' : 'z-[9999]',
               
               // 표시/숨김 상태
               { 'block': menu.isOpen, 'hidden': !menu.isOpen }
             ]"
             :style="isVertical ? '' : 'z-index: 9999 !important;'">
          <AppSubMenu :menus="menu.other_Menu" @close-parent="closeAllMenus" :is-vertical="isVertical" />
        </div>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMenuStore } from '~/stores/menu';
import { useAuth } from '~/composables/useAuth';
import { Icon } from '@iconify/vue';
import AppSubMenu from './AppSubMenu.vue';

const menuStore = useMenuStore();
const { user, isAdmin } = useAuth();
const route = useRoute();
const router = useRouter();

const props = defineProps({
  isVertical: {
    type: Boolean,
    default: false,
  },
});

const userRole = computed(() => {
  if (isAdmin && isAdmin.value) return 'admin';
  if (user && user.value) return 'user';
  return 'public';
});

// 메뉴 데이터에 isOpen 상태를 ref로 관리
const accessibleMenus = ref([]);

function isMenuActive(menu) {
  if (menu.path && (route.path === menu.path || route.path.startsWith(menu.path + '/'))) {
    return true;
  }
  if (menu.other_Menu) {
    // 재귀적으로 자식 메뉴 확인
    return menu.other_Menu.some(child => isMenuActive(child));
  }
  return false;
}

watch(() => [menuStore.getAccessibleMenus(userRole.value), route.path], ([newMenus, _]) => {
  accessibleMenus.value = newMenus.map(menu => ({
    ...menu,
    // 현재 경로에 따라 메뉴의 초기 열림 상태를 설정합니다.
    isOpen: isMenuActive(menu) || false
  }));
}, { immediate: true, deep: true });

/**
 * 메뉴 클릭을 처리하는 통합 함수입니다.
 * 경로가 있으면 네비게이션하고, 자식 메뉴가 있으면 토글합니다.
 * @param {object} clickedMenu - 클릭된 메뉴 객체.
 */
function handleMenuClick(clickedMenu) {
  // 경로가 있는 메뉴 처리
  if (clickedMenu.path) {
    router.push(clickedMenu.path);
    return;
  }
  
  // 자식 메뉴가 있는 경우만 토글 (모바일 또는 세로 메뉴에서)
  if (clickedMenu.children && clickedMenu.children.length > 0) {
    toggleMenu(clickedMenu);
  }
}

/**
 * 메뉴 항목을 토글하는 함수입니다.
 * 모바일 뷰(폭 1024px 미만) 또는 `isVertical` prop이 true일 때만 작동합니다.
 * 클릭된 메뉴가 자식 메뉴를 가지고 있다면 해당 메뉴의 `isOpen` 상태를 토글하고,
 * 다른 모든 최상위 메뉴는 닫습니다.
 * @param {object} clickedMenu - 클릭된 메뉴 객체.
 */
function toggleMenu(clickedMenu) {
  // isVertical이 true이거나 모바일 뷰(아코디언)에서만 작동
  if (props.isVertical || window.innerWidth < 1024) {
    const wasOpen = clickedMenu.isOpen;
    
    // 다른 메뉴는 모두 닫습니다.
    accessibleMenus.value.forEach(menu => {
      if (menu.id !== clickedMenu.id) {
        menu.isOpen = false;
      }
    });
    
    // 클릭된 메뉴의 상태를 토글합니다.
    clickedMenu.isOpen = !wasOpen;
  }
}

/**
 * 주어진 메뉴 또는 그 자식 메뉴 중 현재 활성화된 라우트와 일치하는 것이 있는지 확인합니다.
 * @param {object} menu - 확인할 메뉴 객체.
 * @returns {boolean} 메뉴 또는 자식 메뉴가 활성 상태이면 true, 그렇지 않으면 false.
 */
function isActive(menu) {
  // 현재 메뉴 또는 자식 메뉴가 활성 상태인지 확인
  return isMenuActive(menu);
}

/**
 * 모든 최상위 메뉴의 `isOpen` 상태를 `false`로 설정하여 메뉴를 닫습니다.
 */
function closeAllMenus() {
  accessibleMenus.value.forEach(menu => {
    menu.isOpen = false;
  });
}
</script> 