<!-- pages/adminpage/menus.vue -->
<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4">메뉴 관리</h2>
    
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="mb-4">
        <button @click="openModal()" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          <Icon icon="mdi:plus" class="mr-2" />
          새 메뉴 추가
        </button>
      </div>

      <!-- 메뉴 목록 -->
      <draggable v-model="menus" item-key="id" tag="ul" class="space-y-2" @end="onDragEnd" :data-id="'root'">
        <template #item="{ element: menu }">
          <li class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg" :data-id="menu.id">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <Icon :icon="menu.icon || 'mdi:menu'" class="w-6 h-6 mr-3 text-gray-500" />
                <span class="font-semibold">{{ menu.name }}</span>
                <span class="text-sm text-gray-500 ml-2">{{ menu.path }}</span>
              </div>
              <div class="space-x-2">
                <button @click="openModal(menu)" class="text-blue-500 hover:text-blue-700"><Icon icon="mdi:pencil" /></button>
                <button @click="deleteMenu(menu.id)" class="text-red-500 hover:text-red-700"><Icon icon="mdi:delete" /></button>
              </div>
            </div>
            <!-- 하위 메뉴 -->
            <draggable v-if="menu.children && menu.children.length" v-model="menu.children" item-key="id" tag="ul" class="mt-2 pl-8 space-y-2" @end="onDragEnd" :data-parent-id="menu.id">
              <template #item="{ element: child }">
                <li class="bg-gray-100 dark:bg-gray-600 p-3 rounded-lg" :data-id="child.id">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <Icon :icon="child.icon || 'mdi:menu'" class="w-5 h-5 mr-2 text-gray-500" />
                      <span>{{ child.name }}</span>
                       <span class="text-sm text-gray-400 ml-2">{{ child.path }}</span>
                    </div>
                    <div class="space-x-2">
                      <button @click="openModal(child, menu.id)" class="text-blue-500 hover:text-blue-700"><Icon icon="mdi:pencil" /></button>
                      <button @click="deleteMenu(child.id)" class="text-red-500 hover:text-red-700"><Icon icon="mdi:delete" /></button>
                    </div>
                  </div>
                </li>
              </template>
            </draggable>
          </li>
        </template>
      </draggable>
    </div>

    <!-- 메뉴 추가/수정 모달 -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-bold mb-4">{{ editingMenu.id ? '메뉴 수정' : '새 메뉴 추가' }}</h3>
        <form @submit.prevent="saveMenu">
          <div class="space-y-4">
            <input v-model="editingMenu.name" placeholder="메뉴 이름" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" required>
            <input v-model="editingMenu.path" placeholder="경로 (예: /about)" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
            <input v-model="editingMenu.icon" placeholder="아이콘 (예: mdi:home)" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
            <select v-model="editingMenu.role" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
              <option value="public">전체 공개</option>
              <option value="user">로그인한 사용자</option>
              <option value="admin">관리자</option>
            </select>
            <select v-model="editingMenu.parentId" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
              <option :value="null">최상위 메뉴</option>
              <option v-for="menu in menus" :key="menu.id" :value="menu.id">{{ menu.name }}</option>
            </select>
          </div>
          <div class="flex justify-end mt-6 space-x-2">
            <button type="button" @click="closeModal" class="bg-gray-300 dark:bg-gray-600 px-4 py-2 rounded">취소</button>
            <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">저장</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import draggable from 'vuedraggable';

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

useHead({
  title: '메뉴 관리'
})

const menus = ref([]);
const isModalOpen = ref(false);
const editingMenu = ref({
  name: '',
  path: '',
  icon: '',
  role: 'public',
  parentId: null
});

async function fetchMenus() {
  menus.value = await $fetch('/api/menus');
}

onMounted(fetchMenus);

function openModal(menu = null, parentId = null) {
  if (menu) {
    editingMenu.value = { ...menu };
  } else {
    editingMenu.value = {
      name: '', path: '', icon: '', role: 'public', parentId
    };
  }
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

async function saveMenu() {
  if (editingMenu.value.id) {
    // 수정
    await $fetch(`/api/menus/${editingMenu.value.id}`, {
      method: 'PUT',
      body: editingMenu.value
    });
  } else {
    // 추가
    await $fetch('/api/menus', {
      method: 'POST',
      body: editingMenu.value
    });
  }
  closeModal();
  await fetchMenus();
}

async function deleteMenu(id) {
  if (confirm('정말로 이 메뉴를 삭제하시겠습니까? 하위 메뉴도 모두 삭제됩니다.')) {
    await $fetch(`/api/menus/${id}`, { method: 'DELETE' });
    await fetchMenus();
  }
}

async function onDragEnd(event) {
  const movedItemId = parseInt(event.item.dataset.id, 10);
  if (isNaN(movedItemId)) return;

  const oldParentId = event.from.dataset.parentId ? parseInt(event.from.dataset.parentId, 10) : null;
  const newParentId = event.to.dataset.parentId ? parseInt(event.to.dataset.parentId, 10) : null;
  
  const fromList = oldParentId ? findMenuById(menus.value, oldParentId)?.children : menus.value;
  const toList = newParentId ? findMenuById(menus.value, newParentId)?.children : menus.value;

  const updatePromises = [];

  // 아이템의 parentId 변경
  updatePromises.push($fetch(`/api/menus/${movedItemId}`, {
    method: 'PATCH',
    body: { parentId: newParentId }
  }));

  // 이전 리스트의 순서 업데이트
  if (fromList) {
    fromList.forEach((menu, index) => {
      updatePromises.push($fetch(`/api/menus/${menu.id}`, {
        method: 'PATCH',
        body: { order: index }
      }));
    });
  }

  // 새 리스트의 순서 업데이트 (리스트가 다른 경우에만)
  if (fromList !== toList && toList) {
    toList.forEach((menu, index) => {
      updatePromises.push($fetch(`/api/menus/${menu.id}`, {
        method: 'PATCH',
        body: { order: index }
      }));
    });
  }
  
  await Promise.all(updatePromises);
  await fetchMenus();
}

// 재귀적으로 메뉴를 찾아 삭제하고 반환하는 헬퍼 함수
function findAndRemoveMenuById(menuList, id) {
  for (let i = 0; i < menuList.length; i++) {
    if (menuList[i].id === id) {
      return menuList.splice(i, 1)[0];
    }
    if (menuList[i].children) {
      const found = findAndRemoveMenuById(menuList[i].children, id);
      if (found) return found;
    }
  }
  return null;
}

// 재귀적으로 메뉴를 찾는 헬퍼 함수
function findMenuById(menuList, id) {
  for (const menu of menuList) {
    if (menu.id === id) return menu;
    if (menu.children) {
      const found = findMenuById(menu.children, id);
      if (found) return found;
    }
  }
  return null;
}
</script> 