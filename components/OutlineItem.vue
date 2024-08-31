<template>
    <div class="outline-item" :style="{ marginLeft: `${depth * 20}px` }">
      <div class="item-content">
        <button @click="$emit('toggle', item)" v-if="item.children && item.children.length">
          <Icon :icon="item.expanded ? 'mdi:minus' : 'mdi:plus'" />
        </button>
        <input
          v-if="isEditing"
          v-model="editedContent"
          @blur="finishEditing"
          @keyup.enter="finishEditing"
          ref="editInput"
          class="edit-input"
        />
        <span v-else @click="startEditing" class="item-text">{{ item.content }}</span>
        <div class="item-actions">
          <button @click="$emit('zoom', item)" title="확대">
            <Icon icon="mdi:magnify-plus-outline" />
          </button>
          <button @click="$emit('add', item.id)" title="추가">
            <Icon icon="mdi:plus" />
          </button>
          <button @click="$emit('delete', item.id)" title="삭제">
            <Icon icon="mdi:delete" />
          </button>
          <button @click="$emit('move', item.id, 'up')" title="위로">
            <Icon icon="mdi:arrow-up" />
          </button>
          <button @click="$emit('move', item.id, 'down')" title="아래로">
            <Icon icon="mdi:arrow-down" />
          </button>
        </div>
      </div>
      <div v-if="item.expanded" class="item-children">
        <OutlineItem
          v-for="child in item.children"
          :key="child.id"
          :item="child"
          :depth="depth + 1"
          @toggle="$emit('toggle', $event)"
          @zoom="$emit('zoom', $event)"
          @add="$emit('add', $event)"
          @delete="$emit('delete', $event)"
          @move="$emit('move', $event)"
          @update="$emit('update', $event)"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, nextTick } from 'vue'
  import { Icon } from '@iconify/vue'

  const props = defineProps(['item', 'depth'])
  const emit = defineEmits(['toggle', 'zoom', 'add', 'delete', 'move', 'update'])

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
  </script>

  <style scoped>
  .outline-item {
    margin-bottom: 5px;
  }

  .item-content {
    display: flex;
    align-items: center;
    background-color: white;
    padding: 5px;
    border-radius: 5px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .item-text {
    flex-grow: 1;
    margin: 0 10px;
    cursor: text;
  }

  .edit-input {
    flex-grow: 1;
    margin: 0 10px;
    padding: 2px 5px;
    border: 1px solid #ccc;
    border-radius: 3px;
  }

  .item-actions {
    display: flex;
    gap: 5px;
  }

  .item-actions button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    border-radius: 3px;
    transition: background-color 0.2s;
  }

  .item-actions button:hover {
    background-color: #f0f0f0;
  }

  .item-children {
    margin-top: 5px;
  }
  </style>