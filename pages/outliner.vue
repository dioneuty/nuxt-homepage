<template>
  <div class="outliner">
    <h1 class="title">아웃라이너</h1>
    <div class="controls">
      <button @click="addItem(null)" class="btn btn-primary">
        <Icon icon="mdi:plus" /> 최상위 항목 추가
      </button>
      <button @click="zoomOut" v-if="currentZoom" class="btn btn-secondary">
        <Icon icon="mdi:arrow-collapse-all" />
      </button>
    </div>
    <div class="outline-container">
      <OutlineItem
        v-for="item in rootItems"
        :key="item.id"
        :item="item"
        :depth="0"
        @toggle="toggleItem"
        @zoom="zoomToItem"
        @add="addItem"
        @delete="deleteItem"
        @move="moveItem"
        @update="updateItem"
      />
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import OutlineItem from '~/components/OutlineItem.vue'
import { Icon } from '@iconify/vue'

const rootItems = ref([])
const currentZoom = ref(null)

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

onMounted(() => {
  rootItems.value = sampleData
})

const toggleItem = (item) => {
  item.expanded = !item.expanded
}

const zoomToItem = (item) => {
  currentZoom.value = item.id
  rootItems.value = [item]
}

const zoomOut = () => {
  currentZoom.value = null
  rootItems.value = sampleData
}

const addItem = (parentId, content = '새 항목') => {
  const newItem = {
    id: Date.now(), // 임시 ID 생성
    content,
    children: []
  }

  if (parentId) {
    const parent = findItem(rootItems.value, parentId)
    if (parent) {
      parent.children.push(newItem)
    }
  } else {
    rootItems.value.push(newItem)
  }
}

const deleteItem = (id) => {
  removeItem(rootItems.value, id)
}

const moveItem = (id, direction) => {
  const item = findItem(rootItems.value, id)
  if (!item) return

  const siblings = item.parentId ? findItem(rootItems.value, item.parentId).children : rootItems.value
  const index = siblings.findIndex(sibling => sibling.id === id)
  
  if (direction === 'up' && index > 0) {
    [siblings[index - 1], siblings[index]] = [siblings[index], siblings[index - 1]]
  } else if (direction === 'down' && index < siblings.length - 1) {
    [siblings[index], siblings[index + 1]] = [siblings[index + 1], siblings[index]]
  }
}

const findItem = (items, id) => {
  for (const item of items) {
    if (item.id === id) return item
    if (item.children) {
      const found = findItem(item.children, id)
      if (found) return found
    }
  }
  return null
}

const removeItem = (items, id) => {
  const index = items.findIndex(item => item.id === id)
  if (index !== -1) {
    items.splice(index, 1)
  } else {
    for (const item of items) {
      if (item.children) {
        removeItem(item.children, id)
      }
    }
  }
}

const updateItem = ({ id, content }) => {
  const item = findItem(rootItems.value, id)
  if (item) {
    item.content = content
  }
}
</script>

<style scoped>
.outliner {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

.title {
  color: #333;
  font-size: 2.5rem;
  margin-bottom: 20px;
  text-align: center;
}

.controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s, transform 0.1s;
}

.btn:active {
  transform: scale(0.98);
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-secondary {
  background-color: #2196F3;
  color: white;
}

.btn-secondary:hover {
  background-color: #1e87db;
}

.outline-container {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>
