<template>
  <nav>
    <!-- 모바일에서는 세로, 데스크톱에서는 가로 메뉴 -->
    <ul class="flex flex-col lg:flex-row lg:space-x-1">
      <li v-for="menu in accessibleMenus" :key="menu.id" class="relative group">
        <div 
          @click="toggleMenu(menu)"
          :class="[
            'flex justify-between items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer',
            'text-white lg:hover:bg-blue-700 dark:text-gray-200 lg:dark:hover:bg-gray-700',
            isActive(menu) ? 'bg-blue-700 dark:bg-gray-700' : ''
          ]"
        >
          <NuxtLink v-if="menu.path" :to="menu.path" class="flex-grow flex items-center" @click.stop>
            <Icon v-if="menu.icon" :icon="menu.icon" class="mr-1" />
            <span>{{ menu.name }}</span>
          </NuxtLink>
          <div v-else class="flex-grow flex items-center">
            <Icon v-if="menu.icon" :icon="menu.icon" class="mr-1" />
            <span>{{ menu.name }}</span>
          </div>
          <Icon v-if="menu.children && menu.children.length" 
                icon="mdi:chevron-down" 
                :class="['ml-1 transition-transform duration-200', menu.isOpen ? 'rotate-180' : '', 'lg:group-hover:rotate-180']" />
        </div>
        
        <!-- 하위 메뉴 -->
        <div v-if="menu.children && menu.children.length" 
             :class="[
               'lg:absolute lg:left-0 w-full lg:w-48 lg:bg-white lg:dark:bg-gray-800 rounded-md lg:shadow-lg',
               'lg:hidden lg:group-hover:block z-10', // 데스크톱: hover로 표시
               { 'block': menu.isOpen, 'hidden': !menu.isOpen } // 모바일: isOpen 상태로 표시
             ]">
          <AppSubMenu :menus="menu.children" @close-parent="closeAllMenus" />
        </div>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useMenuStore } from '~/stores/menu';
import { useAuth } from '~/composables/useAuth';
import { Icon } from '@iconify/vue';
import AppSubMenu from './AppSubMenu.vue';

const menuStore = useMenuStore();
const { user, isAdmin } = useAuth();
const route = useRoute();

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
  if (menu.children) {
    // 재귀적으로 자식 메뉴 확인
    return menu.children.some(child => isMenuActive(child));
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


function toggleMenu(clickedMenu) {
  // 모바일 뷰(아코디언)에서만 작동
  if (window.innerWidth < 1024) {
    if (clickedMenu.children && clickedMenu.children.length > 0) {
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
}

function isActive(menu) {
  // 현재 메뉴 또는 자식 메뉴가 활성 상태인지 확인
  return isMenuActive(menu);
}

function closeAllMenus() {
  accessibleMenus.value.forEach(menu => {
    menu.isOpen = false;
  });
}
</script> 