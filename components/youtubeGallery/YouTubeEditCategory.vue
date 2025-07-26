<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 dark:text-white">YouTube 카테고리 편집</h1>
    <div v-if="loading" class="flex justify-center items-center h-64">
      <Icon icon="eos-icons:loading" class="text-blue-500" width="48" height="48" />
    </div>
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
      <p class="font-bold">에러 발생</p>
      <p>{{ error }}</p>
    </div>
    <div v-else class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-6">
      <div class="mb-4 flex">
        <input 
          v-model="newCategory" 
          @keyup.enter="addCategory" 
          placeholder="새 카테고리 이름" 
          class="flex-grow p-2 border rounded dark:bg-gray-700 dark:text-white mr-2"
        >
        <button 
          @click="addCategory" 
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          추가
        </button>
      </div>
      
      <!-- Drag and Drop Category List -->
      <div class="mb-4">
        <h3 class="text-lg font-semibold mb-2 dark:text-white">카테고리 목록 (드래그하여 순서 변경)</h3>
        <div v-if="categories.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          <Icon icon="mdi:folder-outline" width="48" height="48" class="mx-auto mb-2" />
          <p>등록된 카테고리가 없습니다.</p>
          <p class="text-sm">새 카테고리를 추가해보세요.</p>
        </div>
        <draggable 
          v-else
          v-model="categories" 
          :item-key="(item, index) => item.id || `new-${index}`"
          class="space-y-2"
          @end="updateOrder"
        >
          <template #item="{ element: category, index }">
            <div 
              class="mb-2 flex items-center p-2 border rounded bg-gray-50 dark:bg-gray-700 cursor-move hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <Icon icon="mdi:drag" class="text-gray-400 mr-2" width="20" height="20" />
              <input 
                v-model="category.name" 
                class="flex-grow p-2 border rounded dark:bg-gray-600 dark:text-white mr-2"
              >
              <span class="mr-2 text-gray-600 dark:text-gray-400 min-w-12 text-center">
                ({{ category.video_count || 0 }})
              </span>
              <button 
                @click="removeCategory(index)" 
                class="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          </template>
        </draggable>
      </div>
    </div>
    
    <div class="flex justify-between">
      <button 
        @click="cancelEdit" 
        class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        취소
      </button>
      <button 
        @click="saveCategories" 
        :disabled="loading"
        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
      >
        {{ loading ? '저장 중...' : '저장' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useModal } from '~/composables/useModal'
import { useYoutubeCategoryStore } from '~/stores/youtubeCategoryStore'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import { storeToRefs } from 'pinia'

const router = useRouter()
const { openModal } = useModal()
const youtubeCategoryStore = useYoutubeCategoryStore()
const {
  categories: storeCategories,
  loading,
  error
} = storeToRefs(youtubeCategoryStore)
const {
  fetchCategories,
  updateCategories,
  clearError
} = youtubeCategoryStore

const categories = ref([])
const newCategory = ref('')
const deletedCategories = ref([])

/**
 * 컴포넌트 마운트 시 카테고리 데이터를 비동기적으로 가져옵니다.
 */
onMounted(async () => {
  try {
    await fetchCategories(true) // Use admin endpoint
    // 'all' 카테고리 제외하고 복사
    if (storeCategories.value && Array.isArray(storeCategories.value)) {
      categories.value = storeCategories.value
        .filter(category => category.id !== 'all')
        .map(category => ({ ...category }))
    } else {
      console.warn('storeCategories.value가 배열이 아닙니다:', storeCategories.value)
      categories.value = []
    }
  } catch (e) {
    console.error('카테고리 로딩 실패:', e)
    categories.value = []
  }
})

/**
 * 새 카테고리를 추가하는 함수입니다.
 */
function addCategory() {
  if (newCategory.value.trim()) {
    categories.value.push({ 
      name: newCategory.value.trim(), 
      slug: newCategory.value.trim().toLowerCase().replace(/ /g, '-'),
      video_count: 0,
      order: categories.value.length
    })
    newCategory.value = ''
  }
}

/**
 * 지정된 인덱스의 카테고리를 제거하는 함수입니다.
 */
function removeCategory(index) {
  const removedCategory = categories.value.splice(index, 1)[0]
  if (removedCategory.id && removedCategory.id !== 'all') {
    deletedCategories.value.push(removedCategory.id)
  }
}

/**
 * 드래그 앤 드롭으로 순서가 변경되었을 때 호출되는 함수
 */
function updateOrder() {
  // 순서 업데이트
  categories.value.forEach((category, index) => {
    category.order = index
  })
}

/**
 * 변경된 카테고리 목록을 서버에 저장하는 함수입니다.
 */
async function saveCategories() {
  try {
    clearError()
    await updateCategories(categories.value, deletedCategories.value)
    openModal('성공', 'YouTube 카테고리가 성공적으로 저장되었습니다.', () => {
      router.push('/adminpage')
    })
  } catch (error) {
    console.error('Error saving YouTube categories:', error)
    openModal('오류', 'YouTube 카테고리 저장에 실패했습니다.')
  }
}

/**
 * 카테고리 편집을 취소하고 이전 페이지로 돌아가는 함수입니다.
 */
function cancelEdit() {
  router.back()
}
</script>

<style scoped>
.cursor-move:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

.dark .cursor-move:hover {
  background-color: rgba(59, 130, 246, 0.2);
}
</style>