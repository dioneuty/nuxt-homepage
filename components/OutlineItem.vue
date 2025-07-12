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
          @dblclick="() => handleAction('rename')"
          class="flex-grow p-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors duration-200"
          :class="{'font-bold': item.children && item.children.length > 0}"
          v-html="highlightedContent"
        >
        </span>

        <!-- 자식 추가 버튼 -->
        <button
          @click.stop="() => handleAction('add')"
          class="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-0"
        >
          <Icon icon="mdi:plus" class="text-lg text-gray-600 dark:text-gray-300" />
        </button>

        <!-- 상세 보기 아이콘 (모바일 전용) -->
        <button
          v-if="isMobile"
          @click.stop="() => handleAction('showDetail', item)"
          class="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-0"
        >
          <Icon icon="mdi:text-box-search-outline" class="text-lg text-gray-600 dark:text-gray-300" />
        </button>

        <!-- 노드 옵션 드롭다운 -->
        <div class="relative ml-auto">
          <button @click.stop="() => showDropdown.value = !showDropdown.value" class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-0">
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
          @click.stop="() => handleAction('zoom')"
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
              @toggle="(item) => handleAction('toggle', item)"
              @zoom="(item) => handleAction('zoom', item)"
              @add="(id) => handleAction('add', id)"
              @delete="(id) => handleAction('delete', id)"
              @update="(item) => handleAction('update', item)"
              @indent="(id) => handleAction('indent', id)"
              @outdent="(id) => handleAction('outdent', id)"
              @reorder="(e) => emit('reorder', e)"
              @itemSelected="(item) => handleAction('itemSelected', item)"
              @addAbove="(id) => handleAction('addAbove', id)"
              @addBelow="(id) => handleAction('addBelow', id)"
              @rename="(item) => handleAction('update', item)"
              @duplicate="(id) => handleAction('duplicate', id)"
              @cut="(id) => handleAction('cut', id)"
              @copy="(id) => handleAction('copy', id)"
              @paste="(id) => handleAction('paste', id)"
              @showDetail="(item) => handleAction('showDetail', item)"
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
  if (!props.searchQuery?.trim()) return props.item.content;
  
  const query = props.searchQuery.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return props.item.content.replace(
    new RegExp(`(${query})`, 'gi'), 
    '<mark class="bg-yellow-300 dark:bg-yellow-600">$1</mark>'
  );
});

watch(() => props.item.content, (newContent) => {
  mutableContent.value = newContent;
});

/**
 * 항목의 확장 상태를 토글하는 함수입니다.
 * @returns {void}
 */
// 간소화된 함수들
const toggleExpand = () => {
  props.item.expanded = !props.item.expanded;
  emit('toggle', props.item);
}

const saveContent = () => {
  isEditing.value = false;
  if (mutableContent.value !== props.item.content) {
    emit('update', { id: props.item.id, content: mutableContent.value });
  }
}

const selectItem = () => {
  emit('itemSelected', props.item);
  emit('showDetail', props.item);
}

// 통합된 액션 핸들러
const handleAction = (action, data = props.item.id) => {
  const actions = {
    rename: () => isEditing.value = true,
    zoom: () => emit('zoom', props.item),
    toggle: () => emit('toggle', data),
    add: () => emit('add', data),
    delete: () => emit('delete', data),
    update: () => emit('update', data),
    indent: () => emit('indent', data),
    outdent: () => emit('outdent', data),
    addAbove: () => emit('addAbove', data),
    addBelow: () => emit('addBelow', data),
    duplicate: () => emit('duplicate', data),
    cut: () => emit('cut', data),
    copy: () => emit('copy', data),
    paste: () => emit('paste', data),
    showDetail: () => emit('showDetail', data)
  }
  actions[action]?.()
}

const handleMenuItemSelect = (option) => {
  showDropdown.value = false;
  handleAction(option.action);
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