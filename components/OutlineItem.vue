<template>
  <div class="mb-1.5" :style="{ marginLeft: `${depth * 20}px` }">
    <div class="flex items-center bg-white dark:bg-gray-800 p-1.5 rounded shadow-sm">
      <div class="drag-handle text-gray-500 dark:text-gray-400 cursor-move">
        <Icon icon="mdi:drag-horizontal-variant" />
      </div>
      <button v-if="hasChildren" @click="toggleItem" class="text-gray-600 dark:text-gray-300">
        <Icon :icon="item.expanded ? 'mdi:chevron-down' : 'mdi:chevron-right'" />
      </button>
      <input
        v-if="isEditing"
        v-model="editedContent"
        @blur="finishEditing"
        @keyup.enter="handleEnter"
        @keydown.tab.prevent="handleTab"
        @keydown.shift.tab.prevent="handleShiftTab"
        ref="editInput"
        :disabled="isLocked"
        class="flex-grow mx-2.5 px-1.5 py-0.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />
      <span v-else @click="startEditing" class="flex-grow mx-2.5 cursor-text text-gray-900 dark:text-gray-100">{{ item.content }}</span>
      <div class="flex gap-1.5">
        <button @click="toggleContent" title="내용 보기/숨기기" class="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-0.5 rounded">
          <Icon :icon="showContent ? 'mdi:eye-off' : 'mdi:eye'" />
        </button>
        <button @click="saveContent" title="내용 저장" class="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-0.5 rounded">
          <Icon icon="mdi:content-save" />
        </button>
        <button @click="toggleLock" title="잠금/해제" class="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-0.5 rounded">
          <Icon :icon="isLocked ? 'mdi:lock' : 'mdi:lock-open'" />
        </button>
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
    <div v-if="showContent" class="mt-2">
      <CommonQuillEditor
        :value="itemContent"
        @input="updateItemContent"
        placeholder="내용을 입력하세요..."
        :readonly="isLocked"
      />
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
import { ref, nextTick, computed, watch, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import draggable from 'vuedraggable'
import CommonQuillEditor from './CommonQuillEditor.vue'

const props = defineProps(['item', 'depth', 'siblings', 'newItemId'])
const emit = defineEmits(['toggle', 'zoom', 'add', 'delete', 'move', 'update', 'indent', 'outdent', 'reorder'])

const isEditing = ref(false)
const editedContent = ref(props.item.content)
const editInput = ref(null)
const showContent = ref(false)
const itemContent = ref('')
const isLocked = ref(false)

onMounted(async () => {
  if (props.item.id) {
    await fetchItemContent()
  }
})

async function fetchItemContent() {
  try {
    const response = await fetch(`/api/outline-item/${props.item.id.toString()}`)
    if (response.ok) {
      const data = await response.json()
      itemContent.value = data.content || ''
    } else {
      console.error('Error fetching item content:', response.statusText)
    }
  } catch (error) {
    console.error('Error fetching item content:', error)
  }
}

function startEditing() {
  if (!isLocked.value) {
    isEditing.value = true
    editedContent.value = props.item.content
    nextTick(() => {
      editInput.value.focus()
    })
  }
}

function finishEditing() {
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

function handleTab(event) {
  event.preventDefault()
  if (canIndent.value) {
    emit('indent', props.item.id)
  }
}

function handleShiftTab(event) {
  event.preventDefault()
  if (canOutdent.value) {
    emit('outdent', props.item.id)
  }
}

function emitChange() {
  emit('reorder')
}

function toggleItem() {
  if (props.item.children && props.item.children.length > 0) {
    emit('toggle', props.item)
  }
}

function toggleContent() {
  showContent.value = !showContent.value
}

async function saveContent() {
  try {
    await fetch(`/api/outline-item/${props.item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: itemContent.value })
    })
    // 저장 성공 메시지 표시
    alert('내용이 저장되었습니다.')
  } catch (error) {
    console.error('Error saving item content:', error)
    alert('내용 저장에 실패했습니다.')
  }
}

function toggleLock() {
  isLocked.value = !isLocked.value
  if (isLocked.value && isEditing.value) {
    finishEditing()
  }
}

async function updateItemContent(content) {
  if (!isLocked.value) {
    itemContent.value = content
    try {
      await fetch(`/api/outline-item/${props.item.id.toString()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
    } catch (error) {
      console.error('Error updating item content:', error)
    }
  }
}

const hasChildren = computed(() => {
  return props.item.children && props.item.children.length > 0
})
</script>

<style scoped>
/* Tailwind 클래스로 대체되어 스타일 제거 */
</style>