<template>
  <!-- 모바일에서는 padding, 데스크톱에서는 py-1 -->
  <ul class="pl-4 lg:pl-0 lg:py-1">
    <li v-for="menu in reactiveMenus" :key="menu.id" class="relative group">
       <div 
          @click.stop="toggleMenu(menu)"
          :class="[
            'flex justify-between items-center px-4 py-2 text-sm cursor-pointer rounded-md transition-colors duration-150 ease-in-out',
            'hover:bg-blue-500 hover:text-white', // 모바일 호버 효과
            'lg:hover:bg-gray-100', // 데스크톱 호버 효과
            'dark:hover:bg-gray-600 lg:dark:hover:bg-gray-700', // 다크 모드 호버 효과
            
            // 조건부 클래스: 활성/비활성 상태에 따라 다른 스타일을 적용합니다.
            isActive(menu)
              // 활성 상태: 모바일과 데스크톱에 다른 텍스트 및 배경색을 적용합니다.
              ? 'bg-blue-700 text-white lg:bg-gray-200 lg:text-blue-600 dark:bg-gray-700 dark:text-white lg:dark:bg-gray-600 lg:dark:text-blue-300 font-semibold'
              // 비활성 상태: 모바일과 데스크톱에 다른 텍스트 색상을 적용합니다.
              : 'text-blue-200 lg:text-gray-700 dark:text-gray-300 lg:dark:text-gray-200'
          ]"
        >
        <NuxtLink :to="menu.path || '#'" @click.stop="handleLinkClick(menu)" class="flex-grow">
          <Icon v-if="menu.icon" :icon="menu.icon" class="mr-2" />
          <span>{{ menu.name }}</span>
        </NuxtLink>
        <Icon 
          v-if="menu.children && menu.children.length" 
          icon="mdi:chevron-right" 
          :class="['transition-transform duration-200', menu.isOpen ? 'rotate-90' : '', 'lg:group-hover:opacity-100 lg:opacity-0']" 
        />
      </div>

      <!-- 하위 메뉴 -->
      <div v-if="menu.children && menu.children.length"
           :class="[
             'lg:absolute lg:left-full lg:top-0 lg:mt-0 w-full lg:w-48 lg:bg-white lg:dark:bg-gray-800 rounded-md lg:shadow-lg',
             'lg:hidden lg:group-hover:block z-10',
             { 'block': menu.isOpen, 'hidden': !menu.isOpen }
           ]">
        <!-- 재귀 호출 -->
        <AppSubMenu :menus="menu.children" @close-parent="$emit('close-parent')" />
      </div>
    </li>
  </ul>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';

// 이 컴포넌트는 자기 자신을 참조하므로, 이름을 명시적으로 지정합니다.
defineOptions({
  name: 'AppSubMenu'
});

const props = defineProps({
  menus: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['close-parent']);
const route = useRoute();

// props.menus를 반응형으로 만들기 위해 ref와 watch 사용
const reactiveMenus = ref([]);

function isActive(menu) {
  if (menu.path && (route.path === menu.path || route.path.startsWith(menu.path + '/'))) {
    return true;
  }
  if (menu.children) {
    return menu.children.some(child => isActive(child));
  }
  return false;
}

watch(() => [props.menus, route.path], ([newMenus, currentPath]) => {
  reactiveMenus.value = newMenus.map(menu => ({ ...menu, isOpen: isActive(menu) }));
}, { immediate: true, deep: true });

function toggleMenu(clickedMenu) {
   if (clickedMenu.children && clickedMenu.children.length > 0) {
      const wasOpen = clickedMenu.isOpen;
      // 먼저 모든 형제 메뉴를 닫습니다. (선택적)
      // reactiveMenus.value.forEach(menu => {
      //   if(menu.id !== clickedMenu.id) menu.isOpen = false;
      // });
      clickedMenu.isOpen = !wasOpen;
   }
}

function handleLinkClick(menu) {
  // 자식 메뉴가 없는 링크를 클릭했을 때만 상위 메뉴를 닫습니다.
  if (!menu.children || menu.children.length === 0) {
    emit('close-parent');
  }
}
</script> 