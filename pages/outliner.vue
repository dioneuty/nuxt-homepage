<template>
  <div class="max-w-3xl mx-auto p-5 font-sans dark:bg-gray-800">
    <h1 class="text-3xl text-gray-800 dark:text-gray-200 mb-5 text-center">아웃라이너</h1>
    <div class="flex justify-between mb-5">
      <button @click="addItem(null)" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors duration-300 transform active:scale-98">
        <Icon icon="mdi:plus" /> 최상위 항목 추가
      </button>
      <button @click="zoomOut" v-if="zoomPath.length > 0" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors duration-300 transform active:scale-98">
        <Icon icon="mdi:arrow-collapse-all" /> 확대 해제
      </button>
    </div>
    <div class="mb-2.5 text-sm" v-if="zoomPath.length > 0">
      <span>
        <a @click="zoomTo(-1)" class="text-blue-500 dark:text-blue-400 cursor-pointer hover:underline">최상단</a>
      </span>
      <span v-for="(item, index) in zoomPath" :key="item.id">
        <span class="mx-1.5 text-gray-500 dark:text-gray-400"> > </span>
        <a @click="zoomTo(index)" class="text-blue-500 dark:text-blue-400 cursor-pointer hover:underline">{{ item.content }}</a>
      </span>
    </div>
    <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-5 shadow-sm">
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
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { Icon } from '@iconify/vue'
import OutlineItem from '~/components/OutlineItem.vue'
import draggable from 'vuedraggable'

definePageMeta ({
  title: '아웃라이너 - Dion',
  meta: [
    { name: 'description', content: '아웃라이너 - Dion' },
    { name: 'keywords', content: 'Dion, 아웃라이너' }
  ]
})

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


/**
 * localStorage에서 아웃라이너 데이터 불러오기
 * @returns 아웃라이너 데이터 또는 null
 */
function loadFromLocalStorage() {
  const storedData = localStorage.getItem('outlineData')
  return storedData ? JSON.parse(storedData) : null
}

/**
 * localStorage에 데이터 저장하기
 * @param data 저장할 데이터
 */
function saveToLocalStorage(data) {
  localStorage.setItem('outlineData', JSON.stringify(data))
}

/**
 * DB에서 아웃라이너 데이터 불러오기
 * @returns 아웃라이너 데이터 또는 null
 */
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

/**
 * DB에 아웃라이너 데이터 저장하기
 * @param data 저장할 데이터
 */
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

onMounted(async () => {
  try {
    const dbData = await loadFromDB()
    if (dbData) {
      rootItems.value = dbData
      saveToLocalStorage(dbData)
    } else {
      const storedData = loadFromLocalStorage()
      if (storedData) {
        rootItems.value = storedData
      } else {
        rootItems.value = sampleData
      }
    }
    saveTreeState(rootItems.value)
  } catch (error) {
    console.error('Error loading data:', error)
    rootItems.value = []
  }
})

onBeforeUnmount(async () => {
  await saveToDB(rootItems.value)
  localStorage.removeItem('outlineData')
})

// rootItems가 변경될 때마다 localStorage에 저장
watch(rootItems, (newValue) => {
  saveToLocalStorage(newValue)
  saveTreeState(newValue)
}, { deep: true })

/**
 * 항목 토글
 * @param item 토글할 항목
 */
function toggleItem(item) {
  item.expanded = !item.expanded
  saveTreeState(rootItems.value) // 토글 후 트리 상태 저장
}

/**
 * 항목 확대
 * @param item 확대할 항목
 */
function zoomToItem(item) {
  const path = findPath(rootItems.value, item.id)
  if (path) {
    zoomPath.value = path
    saveTreeState(rootItems.value) // 확대 후 트리 상태 저장
  }
}

/**
 * 항목 축소
 */
function zoomOut() {
  if (zoomPath.value.length > 0) {
    zoomPath.value.pop()
    restoreTreeState() // 축소 시 트리 상태 복원
  }
}

/**
 * 항목 확대
 * @param index 확대할 항목의 인덱스
 */
function zoomTo(index) {
  if (index === -1) {
    // 최상단으로 이동
    zoomPath.value = []
  } else if (index < zoomPath.value.length - 1) {
    // 현재 확대 레벨보다 상위로 이동할 때만 처리
    zoomPath.value = zoomPath.value.slice(0, index + 1)
  }
  restoreTreeState() // 트리 상태 복원
}

/**
 * 트리 상태 저장
 * @param items 항목 배열
 */
function saveTreeState(items) {
  treeState.value = {}
  const saveState = (item) => {
    treeState.value[item.id] = { expanded: item.expanded }
    if (item.children) {
      item.children.forEach(saveState)
    }
  }
  items.forEach(saveState)
}

/**
 * 트리 상태 복원
 */
function restoreTreeState() {
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

/**
 * 항목 추가
 * @param parentId 부모 항목 ID
 * @param content 항목 내용
 */
function addItem(parentId, content = '새 항목') {
  const newItem = { // 새 항목 생성
    id: Date.now(),
    content,
    children: []
  }

  if (parentId) { // 부모 항목이 있는 경우
    const parent = findItem(rootItems.value, parentId)
    if (parent) {
      if (!parent.children) { // 부모 항목의 children 배열이 없는 경우 생성
        parent.children = []
      }
      parent.children.push(newItem)
      parent.expanded = true // 부모 항목을 확장 상태로 설정
    }
  } else { // 부모 항목이 없는 경우
    rootItems.value.push(newItem)
  }

  // 트리 상태 저장
  saveTreeState(rootItems.value)
}

/**
 * 항목 삭제
 * @param id 항목 ID
 */
function deleteItem(id) {
  removeItem(rootItems.value, id)
}

/**
 * 항목 이동
 * @param id 항목 ID
 * @param direction 이동 방향 (up, down)
 */
function moveItem(id, direction) {
  const item = findItem(rootItems.value, id) // 항목 찾기
  if (!item) return

  const siblings = item.parentId ? findItem(rootItems.value, item.parentId).children : rootItems.value // 형제 항목 찾기
  const index = siblings.findIndex(sibling => sibling.id === id) // 형제 항목 인덱스 찾기
  
  if (direction === 'up' && index > 0) { // 위로 이동
    [siblings[index - 1], siblings[index]] = [siblings[index], siblings[index - 1]]
  } else if (direction === 'down' && index < siblings.length - 1) { // 아래로 이동
    [siblings[index], siblings[index + 1]] = [siblings[index + 1], siblings[index]]
  }
}

/**
 * 항목 업데이트
 * @param id 항목 ID
 * @param content 항목 내용
 */
function updateItem({ id, content }) {
  const item = findItem(rootItems.value, id)
  if (item) {
    item.content = content
  }
}

/**
 * 들여쓰기
 * @param id 항목 ID
 */
function indentItem(id) {
  const indentItemRecursive = (items) => {

    // 항목 배열을 순회하면서 들여쓰기 처리
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
      
      // 하위 항목이 있는 경우 재귀적으로 들여쓰기 처리
      if (items[i].children && items[i].children.length > 0) {
        if (indentItemRecursive(items[i].children)) {
          return true // 하위 항목에서 들여쓰기 성공
        }
      }
    }
    return false // 해당 ID를 찾지 못함
  }

  if (zoomPath.value.length > 0) {
    indentItemRecursive(zoomPath.value[zoomPath.value.length - 1].children) // 확대 상태에서 들여쓰기 처리
  } else {
    indentItemRecursive(rootItems.value) // 확대 상태가 없을 때 들여쓰기 처리
  }

  saveTreeState(rootItems.value) // 들여쓰기 후 트리 상태 저장
}

/**
 * 들여쓰기 해제
 * @param id 항목 ID
 */
function outdentItem(id) {
  const itemPath = findPath(rootItems.value, id)
  if (!itemPath) return

  const item = itemPath[itemPath.length - 1] // 현재 항목
  const parent = itemPath[itemPath.length - 2] // 부모 항목
  const grandparent = itemPath[itemPath.length - 3] // 조부모 항목

  parent.children = parent.children.filter(child => child.id !== id) // 현재 항목 제거
  
  if (grandparent) { // 조부모가 있는 경우
    const parentIndex = grandparent.children.findIndex(child => child.id === parent.id)
    grandparent.children.splice(parentIndex + 1, 0, item) // 현재 항목을 부모 항목 뒤에 추가
  } else { // 조부모가 없는 경우
    const parentIndex = rootItems.value.findIndex(child => child.id === parent.id)
    rootItems.value.splice(parentIndex + 1, 0, item) // 현재 항목을 부모 항목 뒤에 추가
  }

  // 현재 확대 상태 업데이트
  if (zoomPath.value.length > 0) {
    const lastZoomedItem = zoomPath.value[zoomPath.value.length - 1] // 마지막 확대된 항목
    if (lastZoomedItem.id === parent.id) {
      zoomPath.value.pop() // 마지막 확대된 항목 제거
    }
  }
  saveTreeState(rootItems.value) // 들여쓰기 해제 후 트리 상태 저장
}

/**
 * 항목 찾기
 * @param items 항목 배열
 * @param id 항목 ID
 * @returns 항목 객체 또는 null
 */
const findItem = (items, id) => {
  // 항목 배열을 순회하면서 항목 찾기
  for (const item of items) {
    if (item.id === id) return item
    if (item.children) {
      const found = findItem(item.children, id)
      if (found) return found
    }
  }
  return null
}

/**
 * 항목 경로 찾기
 * @param items 항목 배열
 * @param id 항목 ID
 * @param path 현재 경로
 * @returns 항목 경로 배열 또는 null
 */
function findPath(items, id, path = []) {
  // 항목 배열을 순회하면서 항목 경로 찾기
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

/**
 * 부모 항목 찾기
 * @param items 항목 배열
 * @param id 항목 ID
 * @returns 부모 항목 객체 또는 null
 */
function findParent(items, id) {
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

/**
 * 항목 제거
 * @param items 항목 배열
 * @param id 항목 ID
 */
function removeItem(items, id) {
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

/**
 * 재정렬 처리
 */
function handleReorder() {
  // 재정렬 후 트리 상태 저장
  saveTreeState(rootItems.value)
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
