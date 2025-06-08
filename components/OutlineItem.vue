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
        >
          {{ item.content }}
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

watch(() => props.item.content, (newContent) => {
  mutableContent.value = newContent;
});

function toggleExpand() {
  // console.log('Toggle expand called for item:', props.item.id, 'Current expanded:', props.item.expanded);
  props.item.expanded = !props.item.expanded;
  // console.log('New expanded state:', props.item.expanded);
  emit('toggle', props.item);
  // console.log('Emitted toggle event with new item state.');
}

function zoomToItem() {
  emit('zoom', props.item);
}

function startEditing() {
  isEditing.value = true;
}

function saveContent() {
  isEditing.value = false;
  if (mutableContent.value !== props.item.content) {
    emit('update', { id: props.item.id, content: mutableContent.value });
  }
}

function emitToggle(item) {
  emit('toggle', item);
}

function emitZoom(item) {
  emit('zoom', item);
}

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

function selectItem() {
  emit('itemSelected', props.item);
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

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

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