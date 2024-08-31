<template>
  <div class="mb-1.5" :style="{ marginLeft: `${depth * 20}px` }">
    <div class="flex items-center bg-white dark:bg-gray-800 p-1.5 rounded shadow-sm">
      <div class="drag-handle text-gray-500 dark:text-gray-400 cursor-move">
        <Icon icon="mdi:drag-horizontal-variant" />
      </div>
      <button @click="toggleItem" v-if="item.children && item.children.length" class="text-gray-600 dark:text-gray-300">
        <Icon :icon="item.expanded ? 'mdi:chevron-down' : 'mdi:chevron-right'" />
      </button>
      <input
        v-if="isEditing"
        v-model="editedContent"
        @blur="finishEditing"
        @keyup.enter="finishEditing"
        @keydown.tab.prevent="handleTab"
        @keydown.shift.tab.prevent="handleShiftTab"
        ref="editInput"
        class="flex-grow mx-2.5 px-1.5 py-0.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />
      <span v-else @click="startEditing" class="flex-grow mx-2.5 cursor-text text-gray-900 dark:text-gray-100">{{ item.content }}</span>
      <div class="flex gap-1.5">
        <button @click="$emit('zoom', item)" title="확대" class="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-0.5 rounded">
          <Icon icon="mdi:magnify-plus-outline" />
        </button>
        <button @click="$emit('add', item.id)" title="추가" class="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-0.5 rounded">
          <Icon icon="mdi:plus" />
        </button>
        <button @click="$emit('delete', item.id)" title="삭제" class="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-0.5 rounded">
          <Icon icon="mdi:delete" />
        </button>
        <button @click="$emit('move', item.id, 'up')" title="위로" class="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-0.5 rounded">
          <Icon icon="mdi:arrow-up" />
        </button>
        <button @click="$emit('move', item.id, 'down')" title="아래로" class="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-0.5 rounded">
          <Icon icon="mdi:arrow-down" />
        </button>
        <button @click="handleTab" title="들여쓰기" :disabled="!canIndent" class="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-0.5 rounded disabled:opacity-50 disabled:cursor-not-allowed">
          <Icon icon="mdi:format-indent-increase" />
        </button>
        <button @click="handleShiftTab" title="내어쓰기" :disabled="!canOutdent" class="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-0.5 rounded disabled:opacity-50 disabled:cursor-not-allowed">
          <Icon icon="mdi:format-indent-decrease" />
        </button>
      </div>
    </div>
    <draggable
      v-if="item.expanded"
      v-model="item.children"
      item-key="id"
      handle=".drag-handle"
      @change="emitChange"
      class="mt-1.5"
    >
      <template #item="{ element }">
        <OutlineItem
          :item="element"
          :depth="depth + 1"
          :siblings="item.children"
          @toggle="$emit('toggle', $event)"
          @zoom="$emit('zoom', $event)"
          @add="$emit('add', $event)"
          @delete="$emit('delete', $event)"
          @move="$emit('move', $event)"
          @update="$emit('update', $event)"
          @indent="$emit('indent', $event)"
          @outdent="$emit('outdent', $event)"
          @change="$emit('change', $event)"
        />
      </template>
    </draggable>
  </div>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue'
import { Icon } from '@iconify/vue'
import draggable from 'vuedraggable'

const props = defineProps(['item', 'depth', 'siblings'])
const emit = defineEmits(['toggle', 'zoom', 'add', 'delete', 'move', 'update', 'indent', 'outdent', 'reorder'])

const isEditing = ref(false)
const editedContent = ref(props.item.content)
const editInput = ref(null)

const startEditing = () => {
  isEditing.value = true
  editedContent.value = props.item.content
  nextTick(() => {
    editInput.value.focus()
  })
}

const finishEditing = () => {
  isEditing.value = false
  if (editedContent.value !== props.item.content) {
    emit('update', { id: props.item.id, content: editedContent.value })
  }
}

const canIndent = computed(() => {
  if (!props.siblings || props.siblings.length < 2) return false
  const currentIndex = props.siblings.findIndex(sibling => sibling.id === props.item.id)
  return currentIndex > 0 // 첫 번째 항목이 아니면 들여쓰기 가능
})

const canOutdent = computed(() => {
  return props.depth > 0 // 최상위 항목이 아니면 내어쓰기 가능
})

const handleTab = (event) => {
  event.preventDefault()
  if (canIndent.value) {
    emit('indent', props.item.id)
  }
}

const handleShiftTab = (event) => {
  event.preventDefault()
  if (canOutdent.value) {
    emit('outdent', props.item.id)
  }
}

const emitChange = () => {
  emit('reorder')
}

const toggleItem = () => {
  if (props.item.children && props.item.children.length > 0) {
    emit('toggle', props.item)
  }
}
</script>

<style scoped>
/* Tailwind 클래스로 대체되어 스타일 제거 */
</style>