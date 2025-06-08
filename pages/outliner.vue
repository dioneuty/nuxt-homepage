<template>
  <div class="max-w-6xl mx-auto p-5 font-sans dark:bg-gray-800 md:flex md:space-x-5">
    <!-- 아웃라이너 섹션 -->
    <div :class="{'w-full md:w-1/2': true, 'hidden md:block': selectedItem && !isMobile}">
      <h1 class="text-3xl text-gray-800 dark:text-gray-200 mb-5 text-center">아웃라이너</h1>
      <!-- 버튼 -->
      <div class="flex justify-between mb-5">
        <button @click="addItem(null)" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors duration-300 transform active:scale-98">
          <Icon icon="mdi:plus" /> 최상위 항목 추가
        </button>
        <button @click="zoomOut" v-if="zoomPath.length > 0" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors duration-300 transform active:scale-98">
          <Icon icon="mdi:arrow-collapse-all" /> 확대 해제
        </button>
        <button @click="saveAllItems" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors duration-300 transform active:scale-98">
          <Icon icon="mdi:content-save-all-outline" /> 모두 저장
        </button>
      </div>
      <!-- 확대 경로 -->
      <div class="mb-2.5 text-sm" v-if="zoomPath.length > 0">
        <span>
          <a @click="zoomTo(-1)" class="text-blue-500 dark:text-blue-400 cursor-pointer hover:underline">최상단</a>
        </span>
        <span v-for="(item, index) in zoomPath" :key="item.id">
          <span class="mx-1.5 text-gray-500 dark:text-gray-400"> > </span>
          <a @click="zoomTo(index)" class="text-blue-500 dark:text-blue-400 cursor-pointer hover:underline">{{ item.content }}</a>
        </span>
      </div>
      <!-- 아웃라이너 -->
      <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-5 shadow-sm">
        <!-- 드래그 가능한 아웃라이너 항목 -->
        <draggable
          v-model="currentItems"
          item-key="id"
          @change="handleReorder"
          ghost-class="ghost"
          :animation="200"
          :group="{ name: 'outline-group', pull: true, put: true }"
          :move="(evt) => checkDragMove(evt, 0)"
          @start="handleDragStart"
          @end="handleDragEnd"
        >
          <template #item="{ element }">
            <OutlineItem
              :item="element"
              :depth="0"
              :siblings="currentItems"
              @toggle="toggleItem"
              @zoom="zoomToItem"
              @add="addItem"
              @delete="deleteItem"
              @update="updateItem"
              @indent="indentItem"
              @outdent="outdentItem"
              @reorder="handleReorder"
              @itemSelected="handleItemSelected"
              @addAbove="addAboveItem"
              @addBelow="addBelowItem"
              @rename="updateItem"
              @duplicate="duplicateItem"
              @cut="cutItem"
              @copy="copyItem"
              @paste="pasteItem"
              @showDetail="handleShowDetail"
              :checkDragMove="checkDragMove"
              :draggingItem="draggingItem"
              :handleDragStart="handleDragStart"
              :handleDragEnd="handleDragEnd"
              :isClipboardNotEmpty="isClipboardNotEmpty"
              :potentialHierarchyChange="potentialHierarchyChange"
              :isMobile="isMobile"
            />
          </template>
        </draggable>
      </div>
    </div>

    <!-- 데스크톱 상세 화면 섹션 -->
    <div v-if="selectedItem && !isMobile" :class="{'w-full md:w-1/2': true, 'block': selectedItem, 'hidden': !selectedItem}">
      <div class="bg-gray-100 dark:bg-gray-700 rounded-lg px-5 pb-5 pt-0 shadow-sm">
        <h2 class="text-2xl text-gray-800 dark:text-gray-200 mb-3 text-center mt-0" v-if="selectedItem">{{ selectedItem.content }}</h2>
        <div class="flex justify-center items-center mb-3">
          <button @click="toggleEditMode" v-if="selectedItem" class="px-2 py-1 mr-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors duration-300 transform active:scale-98 focus:outline-none focus:ring-0">
            <Icon :icon="isDetailEditing ? 'mdi:eye' : 'mdi:pencil'" class="text-lg" />
          </button>
          <button @click="closeDetail" class="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-300 transform active:scale-98 focus:outline-none focus:ring-0">
            <Icon icon="mdi:close" class="text-lg" />
          </button>
        </div>
        <CommonQuillEditor
          v-if="selectedItem && isDetailEditing"
          :key="selectedItem.id"
          :value="selectedItemContent"
          @input="updateSelectedItemContent"
          placeholder="내용을 입력하세요..."
        />
        <OutlineDetailViewer
          v-else-if="selectedItem && !isDetailEditing"
          :content="selectedItemContent"
        />
        <p v-else class="text-gray-500 dark:text-gray-400 text-center">항목을 선택하여 내용을 확인하세요.</p>
      </div>
    </div>

    <!-- 모바일 모달 팝업 섹션 -->
    <OutlineModal
      v-if="isMobile && showDetailModal && selectedItem"
      :isVisible="showDetailModal"
      :title="selectedItem.content"
      :content="selectedItemContent"
      :isEditing="isDetailEditing"
      @close="closeDetail"
      @update:content="updateSelectedItemContent"
      @toggle:editMode="toggleEditMode"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import OutlineItem from '~/components/OutlineItem.vue'
import draggable from 'vuedraggable'
import CommonQuillEditor from '~/components/CommonQuillEditor.vue'
import OutlineDetailViewer from '~/components/OutlineDetailViewer.vue'
import OutlineModal from '~/components/OutlineModal.vue'

// Helper function to check if an item is an ancestor of another item
function isAncestor(ancestorItem, descendantId, items) {
  if (!ancestorItem || !ancestorItem.children) return false;
  for (const child of ancestorItem.children) {
    if (child.id === descendantId) return true;
    if (child.children && isAncestor(child, descendantId, items)) {
      return true;
    }
  }
  return false;
}

// Helper function to ensure all item children arrays are initialized
function normalizeItemChildren(items) {
  if (!Array.isArray(items)) { // Ensure the top level is an array
    return [];
  }
  return items.map(item => {
    const newItem = { ...item };
    if (!newItem.children || !Array.isArray(newItem.children)) {
      newItem.children = [];
    }
    // Ensure 'expanded' property exists, default to true
    if (typeof newItem.expanded === 'undefined') {
      newItem.expanded = true;
    }
    if (newItem.children.length > 0) {
      newItem.children = normalizeItemChildren(newItem.children);
    }
    return newItem;
  });
}

// 메타 데이터
definePageMeta ({
  title: '아웃라이너 - Dion',
  meta: [
    { name: 'description', content: '아웃라이너 - Dion' },
    { name: 'keywords', content: 'Dion, 아웃라이너' }
  ]
})

// 데이터
const rootItems = ref([])
const zoomPath = ref([])
const treeState = ref({}) // 트리 상태를 저장할 객체
const selectedItem = ref(null) // 선택된 항목
const selectedItemContent = ref('') // 선택된 항목의 내용
const isDetailEditing = ref(false); // 상세 화면 편집 모드 상태
const showDetailModal = ref(false); // 모바일 상세 모달 가시성

const draggingItem = ref(null); // 드래그 중인 아이템 및 원래 위치 정보
const clipboardItem = ref(null); // 클립보드에 복사/잘라내기된 아이템
const isCutOperation = ref(false); // 잘라내기 작업인지 여부

// 드래그 중 잠재적인 들여쓰기/내어쓰기 의도를 저장할 ref
const potentialHierarchyChange = ref({
  type: null, // 'indent' | 'outdent' | null
  targetItemId: null // 들여쓰기/내어쓰기 대상 아이템 ID
});

// 클립보드에 아이템이 있는지 확인
const isClipboardNotEmpty = computed(() => {
  return !!clipboardItem.value;
});

// 모바일 상태 확인
const isMobile = ref(false);
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768; // Tailwind의 md breakpoint 기준
};

// 샘플 데이터
const sampleData = [
  {
    id: 1,
    content: '최상위 항목 1',
    children: [
      { id: 2, content: '하위 항목 1-1', children: [] },
      { id: 3, content: '하위 항목 1-2', children: [] },
    ],
  },
  {
    id: 4,
    content: '최상위 항목 2',
    children: [
      { id: 5, content: '하위 항목 2-1', children: [] },
      { id: 6, content: '하위 항목 2-2', children: [] },
    ],
  },
]

// 현재 표시할 항목들 (확대 상태에 따라 달라짐)
const currentItems = computed({
  get: () => {
    if (zoomPath.value.length === 0) {
      return rootItems.value
    }
    return zoomPath.value[zoomPath.value.length - 1].children
  },
  set: (newItems) => {
    console.log('currentItems setter called. New items:', newItems);
    if (zoomPath.value.length === 0) {
      rootItems.value = newItems
    } else {
      zoomPath.value[zoomPath.value.length - 1].children = newItems
    }
    saveTreeState(rootItems.value)
  }
})

// localStorage에서 아웃라이너 데이터 불러오기
function loadFromLocalStorage() {
  const storedData = localStorage.getItem('outlineData')
  return storedData ? JSON.parse(storedData) : null
}

// localStorage에 데이터 저장하기
function saveToLocalStorage(data) {
  localStorage.setItem('outlineData', JSON.stringify(data))
}

// DB에서 아웃라이너 데이터 불러오기
async function loadFromDB() {
  try {
    const response = await fetch('/api/outline')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error loading data from DB:', error)
    return null
  }
}

// DB에 아웃라이너 데이터 저장하기
async function saveToDB(data) {
  try {
    await fetch('/api/outline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  } catch (error) {
    console.error('Error saving data to DB:', error)
  }
}

// 트리 상태를 DB와 LocalStorage에 저장 (실제로는 saveAllItems 호출)
function saveTreeState(treeItems) {
  saveAllItems(treeItems);
}

// 트리 상태 복원
function restoreTreeState() {
  const restoreState = (item) => {
    if (treeState.value[item.id]) { // 항목 ID가 트리 상태에 있는 경우
      item.expanded = treeState.value[item.id].expanded // 항목 확장 상태 복원
    }
    if (item.children) {
      item.children.forEach(restoreState) // 자식 항목들에 대해 재귀적으로 상태 복원
    }
  }
  rootItems.value.forEach(restoreState)
}


// 모든 아이템 저장 (DB & LocalStorage)
async function saveAllItems(items) { // Add items parameter for consistency
  try {
    await fetch('/api/outline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items) // Use passed items
    });
    saveToLocalStorage(items); // Use passed items
  } catch (error) {
    console.error('Error saving all items:', error);
  }
}

// 데이터 로드 및 초기화
onMounted(async () => {
  window.addEventListener('resize', checkMobile);
  checkMobile();
  isDetailEditing.value = false; // 페이지 로드 시 편집 모드 비활성화
  try {
    const dbData = await loadFromDB();

    if (dbData && dbData.length > 0) { // Check if dbData is not empty
      rootItems.value = normalizeItemChildren(dbData);
      saveToLocalStorage(dbData);
    } else {
      const storedData = loadFromLocalStorage();

      if (storedData && storedData.length > 0) { // Check if storedData is not empty
        rootItems.value = normalizeItemChildren(storedData);
      } else {
        rootItems.value = sampleData;
      }
    }
    saveTreeState(rootItems.value);
  } catch (error) {
    console.error('Error loading data:', error);
    rootItems.value = [];
  }
});

onBeforeUnmount(async () => {
  window.removeEventListener('resize', checkMobile);
  await saveToDB(rootItems.value);
  localStorage.removeItem('outlineData');
});

// selectedItem이 변경될 때마다 해당 아이템의 내용을 불러옴
watch(selectedItem, async (newItem) => {
  selectedItemContent.value = ''; // 항상 즉시 내용 지우기
  isDetailEditing.value = false; // 항목 변경 시 편집 모드 비활성화

  if (newItem) {
    await nextTick(); // 다음 틱까지 기다려 Vue가 DOM 업데이트를 처리하도록 함
    await fetchSelectedItemContent(newItem.id);
  } else {
    selectedItemContent.value = '';
  }
}, { deep: true });

// rootItems가 변경될 때마다 localStorage에 저장
watch(rootItems, (newValue) => {
  saveToLocalStorage(newValue);
}, { deep: true });


// 선택된 항목의 내용 업데이트 및 DB 저장
async function updateSelectedItemContent(content) {
  if (selectedItem.value) {
    selectedItemContent.value = content;
    // DB 저장
    await saveItemContentToDB(selectedItem.value.id, content);
  }
}

async function saveItemContentToDB(itemId, content) {
  try {
    await fetch(`/api/outline-item/${itemId.toString()}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
  } catch (error) {
    console.error('Error saving item content to DB:', error);
  }
}

async function fetchSelectedItemContent(itemId) {
  try {
    const response = await fetch(`/api/outline-item/${itemId.toString()}`);
    if (response.ok) {
      const data = await response.json();
      selectedItemContent.value = data.content || '';
    } else if (response.status === 404) {
      // 항목 내용이 없을 경우 빈 값으로 초기화하고 DB에 저장
      selectedItemContent.value = '';
      await saveItemContentToDB(itemId, '');
    } else {
      selectedItemContent.value = `Error loading content: ${response.status}`; // Other errors
    }
  } catch (error) {
    console.error('Error fetching item content:', error);
    selectedItemContent.value = 'Error fetching content.';
  }
}

// 항목 선택 핸들러
function handleItemSelected(item) {
  // 모바일 환경이든 아니든, 항목 클릭 시에는 selectedItem만 업데이트합니다.
  // 모달 표시는 상세 보기 아이콘 클릭 시에만 이루어집니다.
  selectedItem.value = item;
}

function closeDetail() {
  selectedItem.value = null;
  isDetailEditing.value = false; // 상세 화면 닫을 때 편집 모드 해제
  showDetailModal.value = false; // 모달도 닫기
}

function toggleEditMode() {
  isDetailEditing.value = !isDetailEditing.value;
}

// 아이템 토글 (확장/축소)
function toggleItem(item) {
  // console.log('toggleItem called in Outliner for item:', item.id, 'Current expanded:', item.expanded);
  // item.expanded = !item.expanded; // 이 줄을 제거하여 이중 토글 방지
  // console.log('toggleItem: New expanded state:', item.expanded);
  saveTreeState(rootItems.value); // 상태 변경 후 저장
  // console.log('toggleItem: saveTreeState called.');
}

/**
 * 새로운 UUID 생성 헬퍼 함수
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 아이템 복사 (재귀적으로 자식도 복사)
 * @param item 복사할 아이템
 * @returns 복사된 새 아이템
 */
function deepCopyItem(item) {
  const newId = generateUUID();
  return {
    ...item,
    id: newId,
    children: item.children ? item.children.map(deepCopyItem) : [],
  };
}

// 복제 기능
function duplicateItem(itemId) {
  const itemToDuplicate = findItem(rootItems.value, itemId);
  if (itemToDuplicate) {
    const duplicatedItem = deepCopyItem(itemToDuplicate);
    const parentList = findParentList(rootItems.value, itemId);
    if (parentList) {
      const index = parentList.findIndex(item => item.id === itemId);
      if (index !== -1) {
        parentList.splice(index + 1, 0, duplicatedItem);
        saveTreeState(rootItems.value);
      }
    }
  }
}

// 잘라내기 기능
function cutItem(itemId) {
  const itemToCut = findItem(rootItems.value, itemId);
  if (itemToCut) {
    clipboardItem.value = deepCopyItem(itemToCut); // 클립보드에 복사본 저장
    isCutOperation.value = true;
    deleteItem(itemId); // 원본 삭제
  }
}

// 복사 기능
function copyItem(itemId) {
  const itemToCopy = findItem(rootItems.value, itemId);
  if (itemToCopy) {
    clipboardItem.value = deepCopyItem(itemToCopy); // 클립보드에 복사본 저장
    isCutOperation.value = false;
  }
}

// 붙여넣기 기능
function pasteItem(targetItemId) {
  if (!clipboardItem.value) return;

  const targetItem = findItem(rootItems.value, targetItemId);
  if (targetItem) {
    const itemToPaste = deepCopyItem(clipboardItem.value); // 새로운 ID로 복사
    targetItem.children.push(itemToPaste);
    targetItem.expanded = true; // 붙여넣으면 부모 노드 펼치기
    saveTreeState(rootItems.value);
    if (isCutOperation.value) {
      clipboardItem.value = null; // 잘라내기였으면 클립보드 비우기
      isCutOperation.value = false;
    }
  }
}

/**
 * ID로 아이템 찾기 (재귀)
 * @param items 검색할 아이템 배열
 * @param id 찾을 아이템의 ID
 * @returns 찾은 아이템 또는 null
 */
function findItem(items, id) {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }
    if (item.children) {
      const found = findItem(item.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * ID로 아이템의 부모 배열 찾기 (재귀)
 * @param items 검색할 아이템 배열
 * @param id 찾을 아이템의 ID
 * @returns 아이템을 포함하는 배열 또는 null
 */
function findParentList(items, id) {
  for (const item of items) {
    if (item.id === id) {
      return items;
    }
    if (item.children) {
      const found = findParentList(item.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * ID로 아이템의 부모 아이템 찾기 (재귀)
 * @param items 검색할 아이템 배열
 * @param id 찾을 아이템의 ID
 * @returns 부모 아이템 또는 null
 */
function findParent(items, id) {
  for (const item of items) {
    if (item.children) {
      for (const child of item.children) {
        if (child.id === id) {
          return item;
        }
      }
      const found = findParent(item.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * ID로 아이템까지의 전체 경로 찾기 (재귀)
 * @param items 검색할 아이템 배열
 * @param id 찾을 아이템의 ID
 * @returns 찾은 아이템까지의 경로 배열 또는 null
 */
function findPathToItem(items, id) {
  for (const item of items) {
    if (item.id === id) {
      return [item];
    }
    if (item.children) {
      const foundPath = findPathToItem(item.children, id);
      if (foundPath) {
        return [item, ...foundPath];
      }
    }
  }
  return null;
}

/**
 * 새 아이템 추가
 * @param parentId 부모 아이템의 ID (최상위면 null)
 */
async function addItem(parentId = null) {
  const newItem = {
    id: generateUUID(),
    content: '새 항목',
    children: [],
    expanded: true, // 새 항목 추가 시 기본적으로 펼쳐진 상태
  };

  if (parentId === null) {
    rootItems.value.push(newItem);
  } else {
    const parent = findItem(rootItems.value, parentId);
    if (parent) {
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(newItem);
      parent.expanded = true; // 자식이 추가되면 부모를 펼침
    }
  }
  saveTreeState(rootItems.value);
  // 새 항목의 내용을 DB에 빈 값으로 초기화
  await saveItemContentToDB(newItem.id, '');
}

/**
 * 특정 아이템 위에 새 아이템 추가
 * @param targetItemId 대상 아이템의 ID
 */
async function addAboveItem(targetItemId) {
  const parentList = findParentList(rootItems.value, targetItemId);
  if (parentList) {
    const index = parentList.findIndex(item => item.id === targetItemId);
    if (index !== -1) {
      const newItem = {
        id: generateUUID(),
        content: '새 항목',
        children: [],
        expanded: true,
      };
      parentList.splice(index, 0, newItem);
      saveTreeState(rootItems.value);
      await saveItemContentToDB(newItem.id, '');
    }
  }
}

/**
 * 특정 아이템 아래에 새 아이템 추가
 * @param targetItemId 대상 아이템의 ID
 */
async function addBelowItem(targetItemId) {
  const parentList = findParentList(rootItems.value, targetItemId);
  if (parentList) {
    const index = parentList.findIndex(item => item.id === targetItemId);
    if (index !== -1) {
      const newItem = {
        id: generateUUID(),
        content: '새 항목',
        children: [],
        expanded: true,
      };
      parentList.splice(index + 1, 0, newItem);
      saveTreeState(rootItems.value);
      await saveItemContentToDB(newItem.id, '');
    }
  }
}

/**
 * 아이템 삭제
 * @param id 삭제할 아이템의 ID
 */
function deleteItem(id) {
  const deleteRecursive = (items) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === id) {
        items.splice(i, 1);
        return true;
      }
      if (items[i].children && deleteRecursive(items[i].children)) {
        return true;
      }
    }
    return false;
  };

  if (deleteRecursive(rootItems.value)) {
    saveTreeState(rootItems.value);
    if (selectedItem.value && selectedItem.value.id === id) {
      selectedItem.value = null; // 삭제된 항목이 선택되어 있으면 선택 해제
    }
  }
}

/**
 * 아이템 내용 업데이트
 * @param updatedItem 업데이트할 아이템 객체 ({ id, content })
 */
function updateItem(updatedItem) {
  const item = findItem(rootItems.value, updatedItem.id);
  if (item) {
    item.content = updatedItem.content;
    saveTreeState(rootItems.value);
  }
}

/**
 * 아이템 들여쓰기
 * @param id 들여쓰기할 아이템의 ID
 */
function indentItem(id) {
  const parentList = findParentList(rootItems.value, id);
  if (!parentList) return;

  const index = parentList.findIndex(item => item.id === id);
  if (index > 0) {
    const itemToIndent = parentList.splice(index, 1)[0];
    const newParent = parentList[index - 1];
    if (newParent) {
      if (!newParent.children) {
        newParent.children = [];
      }
      newParent.children.push(itemToIndent);
      newParent.expanded = true; // 들여쓰기 시 부모 노드 펼치기
      saveTreeState(rootItems.value);
    }
  }
}

/**
 * 아이템 내어쓰기
 * @param id 내어쓰기할 아이템의 ID
 */
function outdentItem(id) {
  const currentParentList = findParentList(rootItems.value, id);
  const currentParent = findParent(rootItems.value, id);

  if (!currentParentList || !currentParent) {
    // 이미 최상위이거나 부모를 찾을 수 없는 경우
    return;
  }

  const itemToOutdent = currentParentList.find(item => item.id === id);
  if (!itemToOutdent) return;

  // 현재 부모의 부모를 찾음 (새로운 부모 리스트)
  const newParentList = findParentList(rootItems.value, currentParent.id);
  if (!newParentList) {
    // 현재 부모가 최상위인 경우 rootItems.value에 추가
    const indexInRoot = currentParentList.findIndex(item => item.id === id);
    if (indexInRoot !== -1) {
      currentParentList.splice(indexInRoot, 1); // 현재 위치에서 제거
      const parentIndex = rootItems.value.findIndex(item => item.id === currentParent.id);
      if (parentIndex !== -1) {
        rootItems.value.splice(parentIndex + 1, 0, itemToOutdent); // 부모 바로 다음에 추가
      }
    }
  } else {
    // 새로운 부모 리스트에 추가
    const indexInNewParentList = newParentList.findIndex(item => item.id === currentParent.id);
    if (indexInNewParentList !== -1) {
      currentParentList.splice(currentParentList.findIndex(item => item.id === id), 1); // 현재 위치에서 제거
      newParentList.splice(indexInNewParentList + 1, 0, itemToOutdent); // 새로운 부모 바로 다음에 추가
    }
  }
  saveTreeState(rootItems.value);
}

/**
 * 재정렬 처리 및 들여쓰기/내어쓰기 감지
 * @param evt vuedraggable change 이벤트 객체
 */
function handleReorder(evt) {
  console.log('handleReorder called. Event:', evt);
  // `added` 또는 `removed` 속성을 통해 항목이 다른 목록으로 이동했는지 확인
  if (evt.added) {
    // 현재는 v-model 변경으로 인해 Vue가 자동으로 트리를 업데이트하므로,
    // 단순히 변경 후 상태를 저장하는 것으로 충분합니다.
    saveTreeState(rootItems.value);

  } else if (evt.removed) {
    // 항목이 제거된 경우 (다른 목록으로 이동했거나 삭제된 경우)
    saveTreeState(rootItems.value);
  } else {
    // 단순히 같은 목록 내에서 순서가 변경된 경우
    saveTreeState(rootItems.value);
  }
}

function zoomToItem(item) {
  const pathToItem = findPathToItem(rootItems.value, item.id);
  if (pathToItem) {
    zoomPath.value = pathToItem;
  }
}

function zoomTo(index) {
  if (index === -1) {
    zoomPath.value = [];
  } else {
    zoomPath.value = zoomPath.value.slice(0, index + 1);
  }
}

function zoomOut() {
  if (zoomPath.value.length > 0) {
    zoomPath.value.pop();
  }
}

function handleDragStart(evt) {
  const draggedElementId = evt.item.dataset.itemId;
  const draggedItem = findItem(rootItems.value, draggedElementId);
  const parent = findParent(rootItems.value, draggedElementId);
  
  draggingItem.value = {
    item: draggedItem,
    originalParentId: parent ? parent.id : null,
    originalIndex: evt.oldIndex
  };
  // 드래그 시작 시 잠재적 변경 초기화
  potentialHierarchyChange.value = { type: null, targetItemId: null };
}

function handleDragEnd(evt) {
  if (!draggingItem.value) return;

  const movedItemId = draggingItem.value.item.id;
  
  // potentialHierarchyChange 값에 따라 들여쓰기/내어쓰기 수행
  if (potentialHierarchyChange.value.type === 'indent' && potentialHierarchyChange.value.targetItemId) {
    // vuedraggable이 이미 DOM을 이동시켰으므로, 우리가 할 일은 `indentItem`이 계층을 올바르게 조정하도록 하는 것입니다.
    // 여기서는 단순히 들여쓰기/내어쓰기를 다시 트리거하여 정렬을 맞춥니다.
    // 만약 드래그앤드롭으로 이미 들여쓰기가 되었다면, 중복 호출될 수 있으니 로직을 더 정교하게 해야 할 수 있습니다.
    indentItem(movedItemId); // 드래그된 아이템을 대상으로 들여쓰기 시도
  } else if (potentialHierarchyChange.value.type === 'outdent' && potentialHierarchyChange.value.targetItemId) {
    outdentItem(movedItemId); // 드래그된 아이템을 대상으로 내어쓰기 시도
  }

  draggingItem.value = null;
  potentialHierarchyChange.value = { type: null, targetItemId: null }; // 상태 초기화
  saveTreeState(rootItems.value); // 최종적으로 트리 상태 저장
}

// vuedraggable move event handler for validation and potential hierarchy change detection
function checkDragMove(evt, currentDepth) {
  // const draggedItem = draggingItem.value.item;
  // const relatedEl = evt.relatedContext.element;
  // const futureParent = evt.to.__vue_component__?.props.item;
  // const newIndex = evt.newIndex;

  // // 들여쓰기/내어쓰기 의도 감지 및 시각적 피드백 업데이트
  // const targetItemBoundingRect = evt.related.getBoundingClientRect();
  // const mouseX = evt.originalEvent.clientX;

  // const indentThreshold = targetItemBoundingRect.left + 50; // 예시 임계값
  // const outdentThreshold = targetItemBoundingRect.left - 20; // 예시 임계값

  // potentialHierarchyChange.value = { type: null, targetItemId: null };

  // if (mouseX > indentThreshold) {
  //   // 들여쓰기: 관련 요소의 자식으로 들어가는 경우 (오른쪽으로 이동)
  //   if (relatedEl && !isAncestor(draggedItem, relatedEl.id)) {
  //     potentialHierarchyChange.value = { type: 'indent', targetItemId: relatedEl.id };
  //   }
  // } else if (mouseX < outdentThreshold && draggedItem.parentId !== null) {
  //   // 내어쓰기: 현재 부모의 형제로 나가는 경우 (왼쪽으로 이동)
  //   const parentItem = findItem(rootItems.value, draggedItem.parentId);
  //   if (parentItem) {
  //     potentialHierarchyChange.value = { type: 'outdent', targetItemId: parentItem.id };
  //   }
  // }

  // // 1. 드래그하는 항목이 자신의 부모가 되는 것을 방지
  // if (futureParent && isAncestor(draggedItem, futureParent.id)) {
  //   return false;
  // }

  // // 2. 드래그하는 항목이 자기 자신이거나 이미 부모인 경우 방지
  // if (relatedEl && draggedItem.id === relatedEl.id) {
  //   return false;
  // }

  return true;
}

// 상세 보기 아이콘 클릭 핸들러 (모바일 전용)
function handleShowDetail(item) {
  selectedItem.value = item;
  showDetailModal.value = true;
}

function selectItem(item) {
  selectedItem.value = item;
  if (item) {
    fetchSelectedItemContent(item.id);
  }
}

</script>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.ghost::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background-color: #2196F3;
}

.outline-container :deep(.sortable-drag) {
  opacity: 0;
}
</style>
