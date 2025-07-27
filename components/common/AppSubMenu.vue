<template>
  <!-- 세로 메뉴에서는 왼쪽 패딩 유지, 가로 메뉴에서는 데스크톱 스타일 적용 -->
  <ul :class="props.isVertical ? 'pl-4' : 'pl-4 lg:pl-0 lg:py-1'">
    <li v-for="menu in reactiveMenus" :key="menu.id" class="relative group">
       <div 
          @click="handleMenuClick(menu)"
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
        <NuxtLink :to="menu.path || '#'" class="flex-grow pointer-events-none">
          <Icon v-if="menu.icon" :icon="menu.icon" class="mr-2" />
          <span>{{ menu.name }}</span>
        </NuxtLink>
        <Icon 
          v-if="menu.other_Menu && menu.other_Menu.length" 
          :icon="props.isVertical ? 'mdi:chevron-down' : 'mdi:chevron-right'" 
          :class="[
            'transition-transform duration-200',
            props.isVertical 
              ? (menu.isOpen ? 'rotate-180' : '') 
              : (menu.isOpen ? 'rotate-90' : ''),
            props.isVertical ? '' : 'lg:group-hover:opacity-100 lg:opacity-0'
          ]" 
        />
      </div>

      <!-- 하위 메뉴 -->
      <div v-if="menu.other_Menu && menu.other_Menu.length"
           :class="[
             // 세로 메뉴(사이드바)에서는 static 포지셔닝으로 자연스럽게 아래로 펼침
             props.isVertical 
               ? 'relative w-full ml-4' 
               : 'lg:absolute lg:left-full lg:top-0 lg:mt-0 w-full lg:w-48 rounded-md lg:shadow-lg',
             
             // 배경색은 세로 메뉴에서는 필요없음 (이미 부모와 동일)
             props.isVertical ? '' : 'bg-blue-800 dark:bg-blue-900',
             
             // hover 동작과 z-index는 가로 메뉴에서만 필요
             props.isVertical ? '' : 'lg:hidden lg:group-hover:block z-[9999]',
             
             // 표시/숨김 상태
             { 'block': menu.isOpen, 'hidden': !menu.isOpen }
           ]"
           :style="props.isVertical ? '' : 'z-index: 9999 !important;'">
        <!-- 재귀 호출 -->
        <AppSubMenu :menus="menu.other_Menu" @close-parent="$emit('close-parent')" :is-vertical="props.isVertical" />
      </div>
    </li>
  </ul>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';

// 이 컴포넌트는 자기 자신을 참조하므로, 이름을 명시적으로 지정합니다.
defineOptions({
  name: 'AppSubMenu'
});

const props = defineProps({
  menus: {
    type: Array,
    required: true
  },
  isVertical: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close-parent']);
const route = useRoute();
const router = useRouter();

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
  if (menu.other_Menu) {
    return menu.other_Menu.some(child => isActive(child));
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
 * 메뉴 클릭을 처리하는 통합 함수입니다.
 * 경로가 있으면 바로 네비게이션하고, 자식 메뉴가 있으면 토글합니다.
 * @param {object} clickedMenu - 클릭된 메뉴 객체.
 */
function handleMenuClick(clickedMenu) {
  // 경로가 있는 메뉴는 바로 네비게이션
  if (clickedMenu.path && clickedMenu.path !== '#') {
    router.push(clickedMenu.path);
    // 자식 메뉴가 없는 링크를 클릭했을 때 상위 메뉴를 닫습니다.
    if (!clickedMenu.other_Menu || clickedMenu.other_Menu.length === 0) {
      emit('close-parent');
    }
    return;
  }
  
  // 자식 메뉴가 있는 경우만 토글
  if (clickedMenu.other_Menu && clickedMenu.other_Menu.length > 0) {
    toggleMenu(clickedMenu);
  }
}

/**
 * 하위 메뉴 항목을 토글하는 함수입니다.
 * 클릭된 메뉴가 자식 메뉴를 가지고 있다면 해당 메뉴의 `isOpen` 상태를 토글합니다.
 * (현재 구현에서는 형제 메뉴를 닫는 로직은 주석 처리되어 있습니다.)
 * @param {object} clickedMenu - 클릭된 메뉴 객체.
 */
function toggleMenu(clickedMenu) {
  const wasOpen = clickedMenu.isOpen;
  // 먼저 모든 형제 메뉴를 닫습니다. (선택적)
  // reactiveMenus.value.forEach(menu => {
  //   if(menu.id !== clickedMenu.id) menu.isOpen = false;
  // });
  clickedMenu.isOpen = !wasOpen;
}
</script> 