<template>
  <div :class="mainContainerClasses">
    <!-- 아웃라이너 섹션 -->
    <div :class="outlinerSectionClasses">
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
        <!-- 너비 전환 버튼 (전체 너비/컨테이너 너비) -->
        <button v-if="!isMobile" @click="toggleWidth" class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors duration-300 transform active:scale-98">
          <Icon :icon="isFullWidth ? 'mdi:arrow-collapse-horizontal' : 'mdi:arrow-expand-horizontal'" />
          {{ isFullWidth ? '컨테이너 너비' : '전체 너비' }}
        </button>
        <!-- 비율 조절 버튼 (아웃라이너:상세) -->
        <button v-if="!isMobile && selectedItem" @click="toggleLayoutRatio" class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors duration-300 transform active:scale-98 ml-2">
          <Icon icon="mdi:arrow-split-vertical" />
          {{ currentLayoutRatio }}
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
    <div v-if="selectedItem && !isMobile" :class="detailSectionClasses">
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
          @openYoutubeModal="handleOpenYoutubeModal"
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

    <!-- YouTube 크게 보기 모달 -->
    <PlayModal
      v-if="showYoutubeModal"
      :isVisible="showYoutubeModal"
      :youtubeVideoId="currentYoutubeVideoId"
      @close="handleCloseYoutubeModal"
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
import PlayModal from '~/components/youtubeGallery/PlayModal.vue'

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

// --- START: YouTube Fullscreen Modal Logic ---
const showYoutubeModal = ref(false); // YouTube 크게 보기 모달 가시성
const currentYoutubeVideoId = ref(null); // 현재 크게 볼 YouTube 영상 ID

/**
 * @function handleOpenYoutubeModal
 * @description YouTube 크게 보기 모달을 열고 영상 ID를 설정합니다.
 * @param {string} videoId - 크게 볼 YouTube 영상의 ID.
 */
const handleOpenYoutubeModal = (videoId) => {
  currentYoutubeVideoId.value = videoId;
  showYoutubeModal.value = true;
};

/**
 * @function handleCloseYoutubeModal
 * @description YouTube 크게 보기 모달을 닫습니다.
 */
const handleCloseYoutubeModal = () => {
  showYoutubeModal.value = false;
  currentYoutubeVideoId.value = null; // 모달이 닫힐 때 영상 ID 초기화
};
// --- END: YouTube Fullscreen Modal Logic ---

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

// --- START: New Width Feature Logic ---
const isFullWidth = ref(false); // Default to container width

onMounted(() => {
  // Load width preference from localStorage
  const storedWidthPreference = localStorage.getItem('outlinerWidthPreference');
  if (storedWidthPreference !== null) {
    isFullWidth.value = JSON.parse(storedWidthPreference);
  }
  checkMobile(); // Initial check for mobile status
  window.addEventListener('resize', checkMobile); // Listen for resize to update mobile status
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile); // Clean up resize listener
});

watch(isFullWidth, (newValue) => {
  localStorage.setItem('outlinerWidthPreference', JSON.stringify(newValue));
});

const toggleWidth = () => {
  isFullWidth.value = !isFullWidth.value;
};

const mainContainerClasses = computed(() => {
  const baseClasses = "p-5 font-sans dark:bg-gray-800 md:flex md:space-x-5";
  if (!isMobile.value && isFullWidth.value) {
    return `w-full ${baseClasses}`;
  } else {
    // Default or container width on desktop, and always container width on mobile
    return `max-w-6xl mx-auto ${baseClasses}`;
  }
});
// --- END: New Width Feature Logic ---

// --- START: Layout Ratio Feature Logic ---
const currentLayoutRatio = ref('1:1'); // Default to 1:1 ratio

onMounted(() => {
  // Load ratio preference from localStorage
  const storedRatioPreference = localStorage.getItem('outlinerLayoutRatio');
  if (storedRatioPreference !== null) {
    currentLayoutRatio.value = storedRatioPreference;
  }
});

watch(currentLayoutRatio, (newValue) => {
  localStorage.setItem('outlinerLayoutRatio', newValue);
});

const toggleLayoutRatio = () => {
  switch (currentLayoutRatio.value) {
    case '1:1':
      currentLayoutRatio.value = '1:2';
      break;
    case '1:2':
      currentLayoutRatio.value = '2:1';
      break;
    case '2:1':
      currentLayoutRatio.value = '1:1';
      break;
    default:
      currentLayoutRatio.value = '1:1';
  }
};

const outlinerSectionClasses = computed(() => {
  const baseClasses = 'w-full'; // Mobile always full width or hidden
  if (isMobile.value) {
    return selectedItem.value ? 'hidden md:block' : baseClasses; // Hide outliner on mobile if detail selected, otherwise full width
  }

  // Desktop logic
  switch (currentLayoutRatio.value) {
    case '1:1':
      return `${baseClasses} md:w-1/2`;
    case '1:2':
      return `${baseClasses} md:w-1/3`;
    case '2:1':
      return `${baseClasses} md:w-2/3`;
    default:
      return `${baseClasses} md:w-1/2`;
  }
});

const detailSectionClasses = computed(() => {
  const baseClasses = 'w-full'; // Mobile always full width or hidden
  if (isMobile.value) {
    return selectedItem.value ? baseClasses : 'hidden'; // Show detail on mobile if selected, otherwise hidden
  }

  // Desktop logic
  const visibilityClass = selectedItem.value ? 'block' : 'hidden';
  switch (currentLayoutRatio.value) {
    case '1:1':
      return `${baseClasses} md:w-1/2 ${visibilityClass}`;
    case '1:2':
      return `${baseClasses} md:w-2/3 ${visibilityClass}`;
    case '2:1':
      return `${baseClasses} md:w-1/3 ${visibilityClass}`;
    default:
      return `${baseClasses} md:w-1/2 ${visibilityClass}`;
  }
});
// --- END: Layout Ratio Feature Logic ---

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

/**
 * 클립보드에 아이템을 설정하고, 잘라내기 작업 여부를 지정합니다.
 * @param item 복사/잘라내기할 아이템
 * @param isCut 잘라내기 작업인지 여부
 */
function setClipboardItem(item, isCut) {
  if (item) {
    clipboardItem.value = deepCopyItem(item); // 클립보드에 복사본 저장
    isCutOperation.value = isCut;
  }
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
    setClipboardItem(itemToCut, true);
    deleteItem(itemId); // 원본 삭제
  }
}

// 복사 기능
function copyItem(itemId) {
  const itemToCopy = findItem(rootItems.value, itemId);
  if (itemToCopy) {
    setClipboardItem(itemToCopy, false);
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

// 새 항목 객체를 생성하는 헬퍼 함수
function createNewOutlineItem() {
  return {
    id: generateUUID(),
    content: '새 항목',
    children: [],
    expanded: true,
  };
}

/**
 * 새 아이템 추가
 * @param parentId 부모 아이템의 ID (최상위면 null)
 */
async function addItem(parentId = null) {
  const newItem = createNewOutlineItem();

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
      const newItem = createNewOutlineItem();
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
      const newItem = createNewOutlineItem();
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
  const result = findAndRemoveItemFromTree(rootItems.value, id);

  if (result) {
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
  const result = findAndRemoveItemFromTree(rootItems.value, id);
  if (!result) {
    return; // 아이템을 찾지 못함
  }

  const { removedItem, parent: currentParent } = result;

  if (currentParent) {
    // 현재 부모가 있는 경우: 현재 부모의 부모를 찾아 그곳에 삽입
    const newParentListResult = findParentList(rootItems.value, currentParent.id);
    if (newParentListResult) {
      const indexInNewParentList = newParentListResult.findIndex(item => item.id === currentParent.id);
      if (indexInNewParentList !== -1) {
        newParentListResult.splice(indexInNewParentList + 1, 0, removedItem);
      }
    } else {
      // 현재 부모가 최상위 항목이면, rootItems에 추가
      const parentIndexInRoot = rootItems.value.findIndex(item => item.id === currentParent.id);
      if (parentIndexInRoot !== -1) {
        rootItems.value.splice(parentIndexInRoot + 1, 0, removedItem);
      }
    }
  } else {
    // 이미 최상위 항목이므로 내어쓰기 불가능 (또는 처리할 필요 없음)
    // 이 경우는 findAndRemoveItemFromTree에서 제거되지 않았을 것이므로 여기에 도달하지 않을 수도 있음
    // 안전을 위해 다시 추가하거나 로깅
    console.warn('Attempted to outdent a top-level item without a parent, which should not happen if removed successfully.');
    // removedItem을 다시 rootItems에 추가 (혹시 모를 상황 대비)
    rootItems.value.push(removedItem);
  }
  saveTreeState(rootItems.value);
}

/**
 * 재정렬 처리 및 들여쓰기/내어쓰기 감지
 * @param evt vuedraggable change 이벤트 객체
 */
function handleReorder(evt) {
  console.log('handleReorder called. Event:', evt);
  // v-model 변경으로 인해 Vue가 자동으로 트리를 업데이트하므로,
  // 단순히 변경 후 상태를 저장하는 것으로 충분합니다.
  saveTreeState(rootItems.value);
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
}

function handleDragEnd(evt) {
  if (!draggingItem.value) return;

  // 드래그 종료 시 추가 로직이 필요하다면 여기에 추가

  draggingItem.value = null;
  saveTreeState(rootItems.value); // 최종적으로 트리 상태 저장
}

// vuedraggable move event handler for validation and potential hierarchy change detection
function checkDragMove(evt, currentDepth) {
  // 이 함수는 현재 드래그앤드롭 유효성 검사 또는 계층 변경 감지 로직을 수행하지 않음.
  // 모든 드래그 이동을 허용.
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

/**
 * ID로 아이템을 찾고, 현재 위치에서 제거하며, 제거된 아이템, 직계 부모, 그리고 아이템이 제거된 리스트를 반환합니다.
 * @param items 검색할 아이템 배열
 * @param targetId 찾을 아이템의 ID
 * @param parent 직계 부모 아이템 (재귀 호출용)
 * @returns { removedItem, parent, parentList } 객체 또는 null
 */
function findAndRemoveItemFromTree(items, targetId, parent = null) {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === targetId) {
      const removedItem = items.splice(i, 1)[0];
      return { removedItem, parent, parentList: items };
    }
    if (items[i].children && items[i].children.length > 0) {
      const result = findAndRemoveItemFromTree(items[i].children, targetId, items[i]);
      if (result) {
        return result;
      }
    }
  }
  return null;
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
