<template>
  <div class="outliner">
    <h1 class="title">아웃라이너</h1>
    <div class="controls">
      <button @click="addItem(null)" class="btn btn-primary">
        <Icon icon="mdi:plus" /> 최상위 항목 추가
      </button>
      <button @click="zoomOut" v-if="zoomPath.length > 0" class="btn btn-secondary">
        <Icon icon="mdi:arrow-collapse-all" /> 확대 해제
      </button>
    </div>
    <div class="breadcrumbs" v-if="zoomPath.length > 0">
      <span>
        <a @click="zoomTo(-1)">최상단</a>
      </span>
      <span v-for="(item, index) in zoomPath" :key="item.id">
        <span> > </span>
        <a @click="zoomTo(index)">{{ item.content }}</a>
      </span>
    </div>
    <div class="outline-container">
      <draggable
        v-model="currentItems"
        item-key="id"
        @change="handleReorder"
        handle=".drag-handle"
        ghost-class="ghost"
        :animation="200"
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
            @move="moveItem"
            @update="updateItem"
            @indent="indentItem"
            @outdent="outdentItem"
            @reorder="handleReorder"
          />
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import OutlineItem from '~/components/OutlineItem.vue'
import draggable from 'vuedraggable'

const rootItems = ref([])
const zoomPath = ref([])
const treeState = ref({}) // 트리 상태를 저장할 객체

// 현재 표시할 항목들 (확대 상태에 따라 달라짐)
const currentItems = computed({
  get: () => {
    if (zoomPath.value.length === 0) {
      return rootItems.value
    }
    return zoomPath.value[zoomPath.value.length - 1].children
  },
  set: (newItems) => {
    if (zoomPath.value.length === 0) {
      rootItems.value = newItems
    } else {
      zoomPath.value[zoomPath.value.length - 1].children = newItems
    }
    saveTreeState(rootItems.value)
  }
})

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

// 로컬 스토리지에서 데이터 불러오기
const loadFromLocalStorage = () => {
  const storedData = localStorage.getItem('outlineData')
  return storedData ? JSON.parse(storedData) : null
}

// 로컬 스토리지에 데이터 저장하기
const saveToLocalStorage = (data) => {
  localStorage.setItem('outlineData', JSON.stringify(data))
}

onMounted(() => {
  try {
    const storedData = loadFromLocalStorage()
    if (storedData && Array.isArray(storedData)) {
      rootItems.value = storedData
    } else {
      rootItems.value = sampleData
    }
    saveToLocalStorage(rootItems.value)
    saveTreeState(rootItems.value)
  } catch (error) {
    console.error('Error loading data:', error)
    rootItems.value = []
  }
})

// rootItems가 변경될 때마다 로컬 스토리지에 저장
watch(rootItems, (newValue) => {
  saveToLocalStorage(newValue)
  saveTreeState(newValue) // 트리 상태 저장
}, { deep: true })

const toggleItem = (item) => {
  item.expanded = !item.expanded
  saveTreeState(rootItems.value) // 토글 후 트리 상태 저장
}

const zoomToItem = (item) => {
  const path = findPath(rootItems.value, item.id)
  if (path) {
    zoomPath.value = path
    saveTreeState(rootItems.value) // 확대 후 트리 상태 저장
  }
}

const zoomOut = () => {
  if (zoomPath.value.length > 0) {
    zoomPath.value.pop()
    restoreTreeState() // 축소 시 트리 상태 복원
  }
}

const zoomTo = (index) => {
  if (index === -1) {
    // 최상단으로 이동
    zoomPath.value = []
  } else if (index < zoomPath.value.length - 1) {
    // 현재 확대 레벨보다 상위로 이동할 때만 처리
    zoomPath.value = zoomPath.value.slice(0, index + 1)
  }
  restoreTreeState() // 트리 상태 복원
}

const saveTreeState = (items) => {
  treeState.value = {}
  const saveState = (item) => {
    treeState.value[item.id] = { expanded: item.expanded }
    if (item.children) {
      item.children.forEach(saveState)
    }
  }
  items.forEach(saveState)
}

const restoreTreeState = () => {
  const restoreState = (item) => {
    if (treeState.value[item.id]) {
      item.expanded = treeState.value[item.id].expanded
    }
    if (item.children) {
      item.children.forEach(restoreState)
    }
  }
  rootItems.value.forEach(restoreState)
}

const addItem = (parentId, content = '새 항목') => {
  const newItem = {
    id: Date.now(),
    content,
    children: []
  }

  if (parentId) {
    const parent = findItem(rootItems.value, parentId)
    if (parent) {
      if (!parent.children) {
        parent.children = []
      }
      parent.children.push(newItem)
      parent.expanded = true // 부모 노드를 확장 상태로 설정
    }
  } else {
    rootItems.value.push(newItem)
  }

  // 트리 상태 저장
  saveTreeState(rootItems.value)
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

const updateItem = ({ id, content }) => {
  const item = findItem(rootItems.value, id)
  if (item) {
    item.content = content
  }
}

const indentItem = (id) => {
  const indentItemRecursive = (items) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === id) {
        if (i > 0) {
          const currentItem = items[i]
          const previousItem = items[i - 1]
          
          // 현재 항목을 제거
          items.splice(i, 1)
          
          // 이전 항목의 children 배열에 현재 항목 추가
          if (!previousItem.children) {
            previousItem.children = []
          }
          previousItem.children.push(currentItem)
          previousItem.expanded = true // 이전 항목을 확장 상태로 설정
          
          return true // 들여쓰기 성공
        }
        return false // 첫 번째 항목은 들여쓰기 불가능
      }
      
      if (items[i].children && items[i].children.length > 0) {
        if (indentItemRecursive(items[i].children)) {
          return true // 하위 항목에서 들여쓰기 성공
        }
      }
    }
    return false // 해당 ID를 찾지 못함
  }

  if (zoomPath.value.length > 0) {
    indentItemRecursive(zoomPath.value[zoomPath.value.length - 1].children)
  } else {
    indentItemRecursive(rootItems.value)
  }

  saveTreeState(rootItems.value)
}

const outdentItem = (id) => {
  const itemPath = findPath(rootItems.value, id)
  if (!itemPath || itemPath.length < 2) return

  const item = itemPath[itemPath.length - 1]
  const parent = itemPath[itemPath.length - 2]
  const grandparent = itemPath[itemPath.length - 3]

  parent.children = parent.children.filter(child => child.id !== id)
  
  if (grandparent) {
    const parentIndex = grandparent.children.findIndex(child => child.id === parent.id)
    grandparent.children.splice(parentIndex + 1, 0, item)
  } else {
    const parentIndex = rootItems.value.findIndex(child => child.id === parent.id)
    rootItems.value.splice(parentIndex + 1, 0, item)
  }

  // 현재 확대 상태 업데이트
  if (zoomPath.value.length > 0) {
    const lastZoomedItem = zoomPath.value[zoomPath.value.length - 1]
    if (lastZoomedItem.id === parent.id) {
      zoomPath.value.pop()
    }
  }
  saveTreeState(rootItems.value)
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

const findPath = (items, id, path = []) => {
  for (const item of items) {
    const newPath = [...path, item]
    if (item.id === id) return newPath
    if (item.children) {
      const found = findPath(item.children, id, newPath)
      if (found) return found
    }
  }
  return null
}

const findParent = (items, id) => {
  for (const item of items) {
    if (item.children) {
      if (item.children.some(child => child.id === id)) {
        return item
      }
      const found = findParent(item.children, id)
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

const handleReorder = () => {
  // 재정렬 후 트리 상태 저장
  saveTreeState(rootItems.value)
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

.breadcrumbs {
  margin-bottom: 10px;
  font-size: 0.9em;
}

.breadcrumbs a {
  color: #2196F3;
  cursor: pointer;
}

.breadcrumbs a:hover {
  text-decoration: underline;
}

.breadcrumbs span {
  margin: 0 5px;
}

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
