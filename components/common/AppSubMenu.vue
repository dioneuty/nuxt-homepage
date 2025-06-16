<template>
  <!-- 모바일에서는 padding, 데스크톱에서는 py-1 -->
  <ul class="pl-4 lg:pl-0 lg:py-1">
    <li v-for="menu in reactiveMenus" :key="menu.id" class="relative group">
       <div 
          @click.stop="toggleMenu(menu)"
          :class="[
            'flex justify-between items-center px-4 py-2 text-sm cursor-pointer rounded-md transition-colors duration-150 ease-in-out',
            'hover:bg-blue-700', // 통합된 호버 배경색
            
            // 조건부 클래스: 활성/비활성 상태에 따라 다른 스타일을 적용합니다.
            isActive(menu)
              // 활성 상태: 일관된 배경 및 텍스트 색상
              ? 'bg-blue-800 text-blue-100 font-semibold' // 활성 시 더 밝은 텍스트
              // 비활성 상태: 일관된 텍스트 색상
              : 'text-blue-100' // 비활성 시에도 잘 보이는 텍스트
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
             'lg:absolute lg:left-full lg:top-0 lg:mt-0 w-full lg:w-48 rounded-md lg:shadow-lg',
             'bg-blue-800 dark:bg-blue-900', // 새로운 배경색
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

/**
 * 주어진 메뉴 또는 그 자식 메뉴 중 현재 활성화된 라우트와 일치하는 것이 있는지 확인합니다.
 * @param {object} menu - 확인할 메뉴 객체.
 * @returns {boolean} 메뉴 또는 자식 메뉴가 활성 상태이면 true, 그렇지 않으면 false.
 */
function isActive(menu) {
  if (menu.path && (route.path === menu.path || route.path.startsWith(menu.path + '/'))) {
    return true;
  }
  if (menu.children) {
    return menu.children.some(child => isActive(child));
  }
  return false;
}

/**
 * `props.menus`와 `route.path`의 변경을 감지하여 `reactiveMenus`를 업데이트합니다.
 * 각 메뉴에 `isOpen` 상태를 추가하며, 초기에는 활성 상태인 메뉴를 열린 상태로 설정합니다.
 * @param {Array<object>} newMenus - 새로 업데이트된 메뉴 배열.
 * @param {string} currentPath - 현재 라우트 경로.
 */
watch(() => [props.menus, route.path], ([newMenus, currentPath]) => {
  reactiveMenus.value = newMenus.map(menu => ({ ...menu, isOpen: isActive(menu) }));
}, { immediate: true, deep: true });

/**
 * 하위 메뉴 항목을 토글하는 함수입니다.
 * 클릭된 메뉴가 자식 메뉴를 가지고 있다면 해당 메뉴의 `isOpen` 상태를 토글합니다.
 * (현재 구현에서는 형제 메뉴를 닫는 로직은 주석 처리되어 있습니다.)
 * @param {object} clickedMenu - 클릭된 메뉴 객체.
 */
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

/**
 * 링크 클릭을 처리하는 함수입니다.
 * 자식 메뉴가 없는 링크를 클릭했을 때만 `close-parent` 이벤트를 발생시켜 상위 메뉴를 닫도록 합니다.
 * @param {object} menu - 클릭된 메뉴 객체.
 */
function handleLinkClick(menu) {
  // 자식 메뉴가 없는 링크를 클릭했을 때만 상위 메뉴를 닫습니다.
  if (!menu.children || menu.children.length === 0) {
    emit('close-parent');
  }
}
</script> 