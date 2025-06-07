<template>
  <nav>
    <!-- 모바일에서는 세로, 데스크톱에서는 가로 메뉴 -->
    <ul class="flex flex-col lg:flex-row lg:space-x-1">
      <li v-for="menu in accessibleMenus" :key="menu.id" class="relative group">
        <div 
          @click="toggleMenu(menu)"
          :class="[
            'flex justify-between items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer',
            'text-white lg:hover:bg-blue-700 dark:text-gray-200 lg:dark:hover:bg-gray-700'
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
          <AppSubMenu :menus="menu.children" />
        </div>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useMenuStore } from '~/stores/menu';
import { useAuth } from '~/composables/useAuth';
import { Icon } from '@iconify/vue';
import AppSubMenu from './AppSubMenu.vue';

const menuStore = useMenuStore();
const { user, isAdmin } = useAuth();

const userRole = computed(() => {
  if (isAdmin && isAdmin.value) return 'admin';
  if (user && user.value) return 'user';
  return 'public';
});

// 메뉴 데이터에 isOpen 상태를 추가
const accessibleMenus = computed(() => {
  return menuStore.getAccessibleMenus(userRole.value).map(menu => ({ ...menu, isOpen: false }));
});

function toggleMenu(clickedMenu) {
  // 모바일에서만 동작 (화면 너비 확인 로직 추가 가능)
  accessibleMenus.value.forEach(menu => {
    if (menu.id === clickedMenu.id) {
      menu.isOpen = !menu.isOpen;
    } else {
      menu.isOpen = false; // 다른 메뉴는 닫음
    }
  });
}
</script> 