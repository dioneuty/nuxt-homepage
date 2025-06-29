<template>
  <div
    :class="[
      'outline-item-container flex items-start group',
      {'dark:text-white': true},
      {'bg-blue-100 dark:bg-blue-800': isSelected},
      {'ml-5': depth > 0},
    ]"
    :data-item-id="item.id"
  >
    <!-- 드래그 핸들 -->
    <div
      class="drag-handle flex-shrink-0 cursor-grab px-2 py-1 -ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
    >
      <Icon icon="mdi:drag-vertical" />
    </div>

    <!-- 토글 및 내용 -->
    <div class="flex-grow flex flex-col">
      <div class="flex items-center space-x-2 py-1">
        <!-- 토글 버튼 -->
        <button
          v-if="item.children && item.children.length > 0"
          @click.stop="toggleExpand"
          class="focus:outline-none focus:ring-0"
        >
          <Icon
            :icon="item.expanded ? 'mdi:menu-down' : 'mdi:menu-right'"
            class="text-xl text-gray-600 dark:text-gray-300"
          />
        </button>
        <button
          v-else
          class="focus:outline-none focus:ring-0 cursor-default"
        >
          <Icon icon="mdi:circle-small" class="text-xl text-gray-400" />
        </button>

        <!-- 아이템 내용 -->
        <input
          v-if="isEditing"
          type="text"
          v-model="mutableContent"
          @blur="saveContent"
          @keyup.enter="saveContent"
          class="flex-grow p-1 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500"
        />
        <span
          v-else
          @click="selectItem"
          @dblclick="startEditing"
          class="flex-grow p-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors duration-200"
          :class="{'font-bold': item.children && item.children.length > 0}"
          v-html="highlightedContent"
        >
        </span>

        <!-- 자식 추가 버튼 -->
        <button
          @click.stop="emitAdd(item.id)"
          class="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-0"
        >
          <Icon icon="mdi:plus" class="text-lg text-gray-600 dark:text-gray-300" />
        </button>

        <!-- 상세 보기 아이콘 (모바일 전용) -->
        <button
          v-if="isMobile"
          @click.stop="emit('showDetail', item)"
          class="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-0"
        >
          <Icon icon="mdi:text-box-search-outline" class="text-lg text-gray-600 dark:text-gray-300" />
        </button>

        <!-- 노드 옵션 드롭다운 -->
        <div class="relative ml-auto">
          <button @click.stop="toggleDropdown" class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-0">
            <Icon icon="mdi:dots-horizontal" class="text-lg text-gray-600 dark:text-gray-300" />
          </button>
          <DropdownMenu
            v-if="showDropdown"
            :options="menuOptions"
            @select="handleMenuItemSelect"
            @close="showDropdown = false"
            class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10"
          />
        </div>

        <!-- 확대/축소 버튼 -->
        <button
          @click.stop="zoomToItem"
          v-if="item.children && item.children.length > 0"
          class="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-0"
        >
          <Icon icon="mdi:magnify-plus-outline" class="text-lg text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      <!-- 자식 항목들 -->
      <div v-if="item.expanded && item.children" class="outline-children">
        <draggable
          v-model="item.children"
          item-key="id"
          @change="(e) => emit('change', e)"
          handle=".drag-handle"
          ghost-class="ghost"
          :animation="200"
          :group="{ name: 'outline-group', pull: true, put: true }"
          :move="(evt) => checkDragMove(evt, depth + 1)"
          @start="handleDragStart"
          @end="handleDragEnd"
        >
          <template #item="{ element }">
            <OutlineItem
              :item="element"
              :depth="depth + 1"
              :siblings="item.children"
              @toggle="emitToggle"
              @zoom="emitZoom"
              @add="emitAdd"
              @delete="emitDelete"
              @update="emitUpdate"
              @indent="emitIndent"
              @outdent="emitOutdent"
              @reorder="(e) => emit('reorder', e)"
              @itemSelected="emitItemSelected"
              @addAbove="emitAddAbove"
              @addBelow="emitAddBelow"
              @rename="emitUpdate"
              @duplicate="emitDuplicate"
              @cut="emitCut"
              @copy="(e) => emit('copy', e)"
              @paste="(e) => emit('paste', e)"
              @showDetail="emitShowDetail"
              :checkDragMove="checkDragMove"
              :draggingItem="draggingItem"
              :handleDragStart="handleDragStart"
              :handleDragEnd="handleDragEnd"
              :isClipboardNotEmpty="isClipboardNotEmpty"
              :potentialHierarchyChange="potentialHierarchyChange"
              :isMobile="isMobile"
              :searchQuery="searchQuery"
            />
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Icon } from '@iconify/vue'
import draggable from 'vuedraggable'
import DropdownMenu from '~/components/common/DropdownMenu.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  depth: {
    type: Number,
    default: 0,
  },
  siblings: {
    type: Array,
    default: () => [],
  },
  checkDragMove: { // Prop for the drag move validation function
    type: Function,
    required: true
  },
  draggingItem: { // Prop for the currently dragged item
    type: Object,
    default: null
  },
  handleDragStart: {
    type: Function,
    required: true
  },
  handleDragEnd: {
    type: Function,
    required: true
  },
  isClipboardNotEmpty: {
    type: Boolean,
    default: false
  },
  potentialHierarchyChange: { // New prop for potential hierarchy change
    type: Object,
    default: () => ({ type: null, targetItemId: null })
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
  searchQuery: {
    type: String,
    default: '',
  }
})

const emit = defineEmits([
  'toggle',
  'zoom',
  'add',
  'delete',
  'update',
  'indent',
  'outdent',
  'reorder',
  'itemSelected',
  'addAbove',
  'addBelow',
  'rename',
  'duplicate',
  'cut',
  'copy',
  'paste',
  'showDetail',
  'change',
])

const isEditing = ref(false)
const mutableContent = ref(props.item.content)
const showDropdown = ref(false)

// 드롭다운 메뉴 옵션
const menuOptions = computed(() => {
  const options = [
    { label: '이름 변경', action: 'rename' },
    { label: '삭제', action: 'delete' },
    { label: '복제', action: 'duplicate' },
    { label: '복사', action: 'copy' },
    { label: '잘라내기', action: 'cut' },
    { label: '------------', action: 'separator', disabled: true }, // 구분선
    { label: '위에 추가', action: 'addAbove' },
    { label: '아래에 추가', action: 'addBelow' },
  ];
  if (props.isClipboardNotEmpty) {
    options.push({ label: '붙여넣기', action: 'paste' });
  }
  return options;
});

const isSelected = computed(() => {
  // Assume a global selected item state or pass down from parent
  // For now, let's just make a simple check (you'd replace this with actual logic)
  return false; // This needs to be hooked up to the actual selected item in pages/outliner.vue
});

// 검색 결과 하이라이팅
const highlightedContent = computed(() => {
  if (!props.searchQuery || props.searchQuery.trim() === '') {
    return props.item.content;
  }

  const query = props.searchQuery.trim();
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  return props.item.content.replace(regex, '<mark class="bg-yellow-300 dark:bg-yellow-600">$1</mark>');
});

// 정규표현식 특수문자 이스케이프
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

watch(() => props.item.content, (newContent) => {
  mutableContent.value = newContent;
});

/**
 * 항목의 확장 상태를 토글하는 함수입니다.
 * @returns {void}
 */
function toggleExpand() {
  // console.log('Toggle expand called for item:', props.item.id, 'Current expanded:', props.item.expanded);
  props.item.expanded = !props.item.expanded;
  // console.log('New expanded state:', props.item.expanded);
  emit('toggle', props.item);
  // console.log('Emitted toggle event with new item state.');
}

/**
 * 편집 중인 항목의 내용을 저장하는 함수입니다.
 * `mutableContent`가 변경되었을 경우에만 `update` 이벤트를 발생시킵니다.
 * 편집 모드를 비활성화합니다.
 * @returns {void}
 */
function saveContent() {
  isEditing.value = false;
  if (mutableContent.value !== props.item.content) {
    emit('update', { id: props.item.id, content: mutableContent.value });
  }
}

/**
 * 항목을 선택하는 함수입니다.
 * `itemSelected` 이벤트를 발생시켜 현재 항목을 전달하고, 상세 보기 모달을 엽니다.
 * @returns {void}
 */
function selectItem() {
  emit('itemSelected', props.item);
  emit('showDetail', props.item);
}

/**
 * 항목의 편집 모드를 활성화하는 함수입니다.
 * @returns {void}
 */
function startEditing() {
  isEditing.value = true;
}

function zoomToItem() {
  emit('zoom', props.item);
}

function emitToggle(item) {
  emit('toggle', item);
}

function emitZoom(item) {
  emit('zoom', item);
}

/**
 * 새로운 자식 항목을 추가하기 위해 `add` 이벤트를 발생시키는 함수입니다.
 * @param {number} parentId - 새로운 항목이 추가될 부모 항목의 ID.
 * @returns {void}
 */
function emitAdd(parentId) {
  emit('add', parentId);
}

function emitDelete(id) {
  emit('delete', id);
}

function emitUpdate(updatedItem) {
  emit('update', updatedItem);
}

function emitIndent(id) {
  emit('indent', id);
}

function emitOutdent(id) {
  emit('outdent', id);
}

function emitItemSelected(item) {
  emit('itemSelected', item);
}

function emitAddAbove(id) {
  emit('addAbove', id);
}

function emitAddBelow(id) {
  emit('addBelow', id);
}

/**
 * 드롭다운 메뉴의 가시성을 토글하는 함수입니다.
 * @returns {void}
 */
function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

/**
 * 드롭다운 메뉴에서 항목이 선택되었을 때 호출되는 핸들러 함수입니다.
 * 선택된 작업에 따라 적절한 이벤트를 발생시킵니다.
 * @param {object} option - 선택된 메뉴 옵션 객체 (label, action).
 * @returns {void}
 */
function handleMenuItemSelect(option) {
  showDropdown.value = false; // 메뉴 선택 시 드롭다운 닫기
  switch (option.action) {
    case 'rename':
      startEditing();
      break;
    case 'delete':
      emit('delete', props.item.id);
      break;
    case 'duplicate':
      emit('duplicate', props.item.id);
      break;
    case 'cut':
      emit('cut', props.item.id);
      break;
    case 'copy':
      emit('copy', props.item.id);
      break;
    case 'paste':
      emit('paste', props.item.id);
      break;
    case 'addAbove':
      emit('addAbove', props.item.id);
      break;
    case 'addBelow':
      emit('addBelow', props.item.id);
      break;
    default:
      break;
  }
}

function emitShowDetail(item) {
  emit('showDetail', item);
}
</script>

<style scoped>
/* Add styling for drag-and-drop */
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

/* Optional: style for when a drag is over a potential indent/outdent zone */
.potential-indent {
  border-left: 2px solid blue; /* Example visual cue */
}

.potential-outdent {
  border-right: 2px solid orange; /* Example visual cue */
}
</style>