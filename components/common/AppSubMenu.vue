<template>
  <!-- 모바일에서는 padding, 데스크톱에서는 py-1 -->
  <ul class="pl-4 lg:pl-0 lg:py-1">
    <li v-for="menu in reactiveMenus" :key="menu.id" class="relative group">
       <div 
          @click.stop="toggleMenu(menu)"
          :class="[
            'flex justify-between items-center px-4 py-2 text-sm cursor-pointer',
            'text-gray-700 dark:text-gray-200 lg:hover:bg-gray-100 lg:dark:hover:bg-gray-700'
          ]"
        >
        <NuxtLink :to="menu.path || '#'" @click.stop class="flex-grow">
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
        <AppSubMenu :menus="menu.children" />
      </div>
    </li>
  </ul>
</template>

<script setup>
import { ref, watch } from 'vue';
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

// props.menus를 반응형으로 만들기 위해 ref와 watch 사용
const reactiveMenus = ref([]);

watch(() => props.menus, (newMenus) => {
  reactiveMenus.value = newMenus.map(menu => ({ ...menu, isOpen: false }));
}, { immediate: true, deep: true });

function toggleMenu(clickedMenu) {
  reactiveMenus.value.forEach(menu => {
    if (menu.id === clickedMenu.id) {
      menu.isOpen = !menu.isOpen;
    } else {
      menu.isOpen = false;
    }
  });
}
</script> 